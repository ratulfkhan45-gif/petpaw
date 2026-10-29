import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Crosshair, Locate, MapPin, Minus, Navigation, Plus, Search, X } from 'lucide-react';
import { AREAS } from '../data/mock.js';
import { Img, Modal } from './ui.jsx';

/*
  Reusable interactive map for hospitals, pet shops and Pet Borrow listings.
  It draws a simplified vector map of Dhaka (no external map service), so it
  works offline. Swap the <BaseMap/> layer for Leaflet/Google Maps when a real
  map service is integrated.
*/

const W = 1000;
const H = 1200;
const BOUNDS = { minLng: 90.33, maxLng: 90.47, minLat: 23.70, maxLat: 23.89 };
export const project = (lat, lng) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
});
const unproject = (x, y) => ({
  lng: +(BOUNDS.minLng + (x / W) * (BOUNDS.maxLng - BOUNDS.minLng)).toFixed(5),
  lat: +(BOUNDS.maxLat - (y / H) * (BOUNDS.maxLat - BOUNDS.minLat)).toFixed(5),
});

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/* ---------- Shared user-location store (permission-based) ---------- */
let locState = { status: 'idle', coords: null, message: '' };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
const locStore = {
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  get: () => locState,
  request() {
    if (!('geolocation' in navigator)) {
      locState = { status: 'error', coords: null, message: 'Your browser does not support location. Search by area instead.' };
      emit();
      return;
    }
    locState = { ...locState, status: 'loading', message: '' };
    emit();
    navigator.geolocation.getCurrentPosition(
      (p) => { locState = { status: 'granted', coords: { lat: p.coords.latitude, lng: p.coords.longitude }, message: '' }; emit(); },
      () => { locState = { status: 'denied', coords: null, message: 'Location access is off. Search by area or address instead.' }; emit(); },
      { timeout: 8000 }
    );
  },
  clear() { locState = { status: 'idle', coords: null, message: '' }; emit(); },
};
export function useUserLocation() {
  const s = useSyncExternalStore(locStore.subscribe, locStore.get);
  return { ...s, request: locStore.request, clear: locStore.clear };
}
export function distanceTo(loc, item) {
  if (loc.status !== 'granted' || !loc.coords || item.lat == null) return null;
  return haversineKm(loc.coords, item);
}
export const fmtKm = (km) => (km == null ? null : km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`);

export function directionsUrl(item) {
  if (item.approx) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.area}, Dhaka`)}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
}

export function LocationButton({ compact }) {
  const loc = useUserLocation();
  const [ask, setAsk] = useState(false);
  return (
    <>
      <button
        type="button"
        className={`btn ${loc.status === 'granted' ? 'btn-outline' : 'btn-outline'} ${compact ? 'btn-sm' : ''}`}
        onClick={() => (loc.status === 'granted' ? loc.clear() : setAsk(true))}
        style={{ boxShadow: compact ? 'var(--shadow)' : undefined }}
      >
        {loc.status === 'loading' ? <span className="spinner" style={{ color: 'var(--green)' }} /> : <Locate size={15} />}
        {loc.status === 'granted' ? 'Location on' : 'Use my location'}
      </button>
      <Modal
        open={ask}
        onClose={() => setAsk(false)}
        title="Use your location?"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAsk(false)}>Not now</button>
            <button className="btn btn-primary" onClick={() => { setAsk(false); locStore.request(); }}>Allow location</button>
          </>
        }
      >
        <div className="stack">
          <p>PetPaw uses your location only to show places near you and how far away they are. It is not saved to your profile or shared with providers.</p>
          <p className="muted small">Your browser will ask for permission next. If you prefer not to share it, search by area or address instead.</p>
        </div>
      </Modal>
    </>
  );
}

/* ---------- Base map (simplified Dhaka) ---------- */
function BaseMap() {
  return (
    <g>
      <rect x="-2000" y="-2000" width="5000" height="5200" fill="#eef2e8" />
      {/* rivers */}
      <path d="M150,-200 C120,150 70,350 100,520 C130,700 150,880 190,1000 C230,1080 330,1120 470,1150 C600,1175 760,1190 1200,1230" fill="none" stroke="#bcd9e8" strokeWidth="46" strokeLinecap="round" />
      <path d="M980,-200 C950,200 930,450 960,700 C985,900 990,1050 1060,1300" fill="none" stroke="#bcd9e8" strokeWidth="36" strokeLinecap="round" />
      <path d="M-100,10 C200,30 500,-10 1100,20" fill="none" stroke="#bcd9e8" strokeWidth="22" />
      {/* lakes */}
      <path d="M300,862 C318,880 312,905 330,925 C345,940 352,960 340,972" fill="none" stroke="#bcd9e8" strokeWidth="13" strokeLinecap="round" />
      <path d="M612,540 C640,575 620,615 645,650 C665,680 650,705 630,720" fill="none" stroke="#bcd9e8" strokeWidth="14" strokeLinecap="round" />
      <path d="M500,800 C540,780 575,800 600,780 C625,765 650,775 660,760" fill="none" stroke="#bcd9e8" strokeWidth="14" strokeLinecap="round" />
      {/* parks */}
      <ellipse cx="114" cy="470" rx="46" ry="32" fill="#d5e8cc" />
      <ellipse cx="486" cy="958" rx="34" ry="24" fill="#d5e8cc" />
      <ellipse cx="420" cy="700" rx="30" ry="40" fill="#d5e8cc" />
      {/* airport */}
      <rect x="455" y="190" width="40" height="230" rx="8" fill="#e1e5df" transform="rotate(8 475 305)" />
      {/* major roads */}
      <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        <path d="M495,40 L500,300 L520,520 L530,610 L470,720 L430,830 L470,960 L560,1100" strokeWidth="12" />
        <path d="M250,420 L276,524 L300,640 L320,780 L330,905 L360,1010 L470,1080" strokeWidth="10" />
        <path d="M276,524 L400,560 L530,610 L640,620 L690,690 L700,820 L640,990" strokeWidth="10" />
        <path d="M690,690 L740,560 L800,450 L876,448" strokeWidth="9" />
        <path d="M200,789 L330,820 L426,834 L560,860 L700,860" strokeWidth="8" />
        <path d="M426,834 L470,960 L623,992" strokeWidth="8" />
        <path d="M200,789 L240,650 L276,524" strokeWidth="7" />
      </g>
      <g fill="none" stroke="#f3d9a9" strokeLinecap="round">
        <path d="M495,40 L500,300 L520,520 L530,610" strokeWidth="4" />
      </g>
      {/* area labels */}
      {AREAS.map((a) => {
        const p = project(a.lat, a.lng);
        return (
          <text key={a.name} x={p.x} y={p.y - 46} textAnchor="middle" fontSize="20" fontWeight="600" fill="#93a198" style={{ letterSpacing: '0.04em', pointerEvents: 'none' }}>
            {a.name.toUpperCase()}
          </text>
        );
      })}
    </g>
  );
}

const PIN_COLORS = { hospital: '#237a57', shop: '#d9822b', borrow: '#2f8f74', pharmacy: '#2a6fb0', picker: '#c0392b' };

function Glyph({ type }) {
  if (type === 'hospital') return <path d="M-4,-14 h8 v6 h6 v8 h-6 v6 h-8 v-6 h-6 v-8 h6 z" fill="#fff" transform="translate(0,-14)" />;
  if (type === 'shop') return <g transform="translate(0,-28)" fill="none" stroke="#fff" strokeWidth="2.4"><path d="M-8,-4 h16 l-1.5,12 h-13 z" /><path d="M-4,-4 v-3 a4,4 0 0 1 8,0 v3" /></g>;
  if (type === 'pharmacy') return <g transform="translate(0,-28)"><rect x="-9" y="-4" width="18" height="8" rx="4" fill="#fff" /><rect x="-1" y="-4" width="10" height="8" rx="4" fill="#9cc8f0" /></g>;
  if (type === 'borrow') {
    return (
      <g transform="translate(0,-28)" fill="#fff">
        <ellipse cx="0" cy="3" rx="6" ry="5" />
        <circle cx="-7" cy="-4" r="2.6" /><circle cx="-2.5" cy="-8" r="2.6" /><circle cx="2.5" cy="-8" r="2.6" /><circle cx="7" cy="-4" r="2.6" />
      </g>
    );
  }
  return <circle cx="0" cy="-28" r="5" fill="#fff" />;
}

function Pin({ item, x, y, scale, k = 1, selected, onSelect }) {
  const color = PIN_COLORS[item.type] || PIN_COLORS.picker;
  const body = item.type === 'hospital'
    ? <rect className="pin-body" x="-17" y="-46" width="34" height="34" rx="8" fill={color} stroke="#fff" strokeWidth="2.5" />
    : <circle className="pin-body" cx="0" cy="-28" r="17" fill={color} stroke="#fff" strokeWidth="2.5" />;
  return (
    <g
      className="pin"
      transform={`translate(${x},${y}) scale(${(selected ? 1.2 : 1) / (scale * k)})`}
      tabIndex={0}
      role="button"
      aria-label={`${item.name}${item.area ? `, ${item.area}` : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect?.(item.id); }}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect?.(item.id))}
    >
      <path d="M0,0 L-7,-14 L7,-14 Z" fill={color} />
      {body}
      <Glyph type={item.type} />
      {selected && <circle cx="0" cy="-28" r="25" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />}
    </g>
  );
}

export default function MapView({
  items = [],
  selectedId,
  onSelect,
  loading = false,
  error = '',
  side = true,
  renderSideItem,
  picker = false,
  value,
  onPick,
  height,
  searchPlaceholder = 'Search name, area or address',
  emptyText = 'No places match your search. Try another area or clear filters.',
}) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const drag = useRef(null);
  const [view, setView] = useState({ s: 1.15, tx: -60, ty: -80 });
  const [q, setQ] = useState('');
  const [dragging, setDragging] = useState(false);
  const [k, setK] = useState(1); // rendered pixels per map unit, so pins keep a constant on-screen size
  const loc = useUserLocation();
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const measure = () => { const r = el.getBoundingClientRect(); if (r.width) setK(Math.max(r.width / W, r.height / H)); };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => `${i.name} ${i.area || ''} ${i.address || ''}`.toLowerCase().includes(t));
  }, [items, q]);

  const selected = items.find((i) => i.id === selectedId);

  const centerOn = (lat, lng, s) => {
    const p = project(lat, lng);
    setView((v) => {
      const ns = s || Math.max(v.s, 1.6);
      return { s: ns, tx: W / 2 - p.x * ns, ty: H / 2 - p.y * ns };
    });
  };

  useEffect(() => { if (selected) centerOn(selected.lat, selected.lng); }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (picker && value?.lat) centerOn(value.lat, value.lng, 1.8); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runSearch = (e) => {
    e.preventDefault();
    const t = q.trim().toLowerCase();
    if (!t) return;
    const area = AREAS.find((a) => a.name.toLowerCase().includes(t));
    if (filtered[0]) { onSelect?.(filtered[0].id); centerOn(filtered[0].lat, filtered[0].lng); }
    else if (area) centerOn(area.lat, area.lng, 1.8);
  };

  const zoom = (f) => setView((v) => {
    const s = Math.min(4, Math.max(0.8, v.s * f));
    const cx = W / 2; const cy = H / 2;
    return { s, tx: cx - (cx - v.tx) * (s / v.s), ty: cy - (cy - v.ty) * (s / v.s) };
  });

  const unitsPerPx = () => {
    const r = svgRef.current.getBoundingClientRect();
    return 1 / Math.max(r.width / W, r.height / H);
  };
  const onDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x; const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) { d.moved = true; setDragging(true); try { svgRef.current.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } }
    const k = unitsPerPx();
    setView((v) => ({ ...v, tx: d.tx + dx * k, ty: d.ty + dy * k }));
  };
  const onUp = (e) => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (d && !d.moved && picker && onPick) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(gRef.current.getScreenCTM().inverse());
      onPick(unproject(p.x, p.y));
    } else if (d && !d.moved && !picker) {
      onSelect?.(null);
    }
  };

  const userPt = loc.status === 'granted' && loc.coords ? project(loc.coords.lat, loc.coords.lng) : null;
  const userInside = userPt && userPt.x >= 0 && userPt.x <= W && userPt.y >= 0 && userPt.y <= H;

  const canvas = (
    <div className={`map-canvas ${dragging ? 'dragging' : ''}`} style={{ height: picker ? height || 340 : undefined }}>
      <svg
        ref={svgRef}
        className="mapsvg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={() => { drag.current = null; setDragging(false); }}
      >
        <g ref={gRef} transform={`translate(${view.tx} ${view.ty}) scale(${view.s})`}>
          <BaseMap />
          {!picker && filtered.filter((i) => i.approx).map((i) => {
            const p = project(i.lat, i.lng);
            return <circle key={`r-${i.id}`} cx={p.x} cy={p.y} r="42" fill="#45a88a" opacity={i.id === selectedId ? 0.28 : 0.14} stroke="#2f8f74" strokeDasharray="6 5" strokeWidth={1.5 / view.s} />;
          })}
          {!picker && filtered.map((i) => {
            const p = project(i.lat, i.lng);
            return <Pin key={i.id} item={i} x={p.x} y={p.y} scale={view.s} k={k} selected={i.id === selectedId} onSelect={onSelect} />;
          })}
          {picker && value?.lat && (() => { const p = project(value.lat, value.lng); return <Pin item={{ id: 'pick', type: 'picker', name: 'Selected location' }} x={p.x} y={p.y} scale={view.s} k={k} />; })()}
          {userInside && (
            <g transform={`translate(${userPt.x},${userPt.y}) scale(${1 / (view.s * k)})`}>
              <circle r="18" fill="#2a6fb0" opacity="0.18" />
              <circle r="8" fill="#2a6fb0" stroke="#fff" strokeWidth="3" />
            </g>
          )}
        </g>
      </svg>

      <form className="map-top" onSubmit={runSearch}>
        <div className="input-icon">
          <Search size={16} />
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={picker ? 'Jump to area (e.g. Gulshan)' : searchPlaceholder} aria-label="Search the map" />
          {q && <button type="button" className="trail btn btn-ghost btn-sm" onClick={() => setQ('')} aria-label="Clear search"><X size={14} /></button>}
        </div>
        {!picker && <LocationButton compact />}
      </form>

      <div className="map-ctrls">
        <button type="button" onClick={() => zoom(1.3)} aria-label="Zoom in"><Plus size={18} /></button>
        <button type="button" onClick={() => zoom(1 / 1.3)} aria-label="Zoom out"><Minus size={18} /></button>
        {userInside && <button type="button" onClick={() => centerOn(loc.coords.lat, loc.coords.lng)} aria-label="Center on my location"><Crosshair size={18} /></button>}
      </div>

      {!picker && (
        <div className="map-legend" aria-hidden="true">
          {[...new Set(items.map((i) => i.type))].map((t) => (
            <span key={t}>
              <svg width="14" height="14" viewBox="0 0 14 14">{t === 'hospital' ? <rect x="1" y="1" width="12" height="12" rx="3" fill={PIN_COLORS[t]} /> : <circle cx="7" cy="7" r="6" fill={PIN_COLORS[t]} />}</svg>
              {t === 'hospital' ? 'Pet hospital' : t === 'shop' ? 'Pet shop' : t === 'pharmacy' ? 'Pharmacy' : 'Pet Borrow area (approx.)'}
            </span>
          ))}
          {userInside && <span><svg width="14" height="14"><circle cx="7" cy="7" r="5" fill="#2a6fb0" /></svg> You</span>}
        </div>
      )}

      {loc.status === 'granted' && !userInside && !picker && (
        <div className="map-legend" style={{ bottom: 52 }}>You appear to be outside Dhaka. Distances are measured from your real location.</div>
      )}
      {(loc.status === 'denied' || loc.status === 'error') && !picker && (
        <div className="map-legend" style={{ bottom: 52, color: 'var(--warn)' }}>{loc.message}</div>
      )}

      {selected && !picker && (
        <div className="map-preview">
          <div className="img"><Img src={selected.img} alt={selected.name} /></div>
          <div className="body">
            <div className="row between top" style={{ flexWrap: 'nowrap' }}>
              <h4 style={{ minWidth: 0 }}>{selected.name}</h4>
              <button className="btn btn-ghost btn-sm" onClick={() => onSelect?.(null)} aria-label="Close preview"><X size={14} /></button>
            </div>
            {selected.lines?.map((l, i) => <div key={i} className="small muted">{l}</div>)}
            {fmtKm(distanceTo(loc, selected)) && <div className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtKm(distanceTo(loc, selected))}{selected.approx ? ' (to general area)' : ''}</div>}
            <div className="row" style={{ marginTop: 6 }}>
              {selected.primary && (selected.primary.to
                ? <Link className="btn btn-primary btn-sm" to={selected.primary.to}>{selected.primary.label}</Link>
                : <button className="btn btn-primary btn-sm" onClick={selected.primary.onClick}>{selected.primary.label}</button>)}
              {selected.secondary && <Link className="btn btn-outline btn-sm" to={selected.secondary.to}>{selected.secondary.label}</Link>}
              <a className="btn btn-ghost btn-sm" href={directionsUrl(selected)} target="_blank" rel="noreferrer"><Navigation size={14} /> Directions</a>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="map-state"><div className="box"><span className="spinner" style={{ color: 'var(--green)', width: 26, height: 26 }} /><strong>Loading map…</strong></div></div>
      )}
      {!loading && error && (
        <div className="map-state"><div className="box"><MapPin size={26} color="var(--bad)" /><strong>Map couldn’t load</strong><span className="small muted">{error}</span></div></div>
      )}
      {!loading && !error && !picker && filtered.length === 0 && (
        <div className="map-state"><div className="box"><MapPin size={26} color="var(--muted)" /><strong>No results on the map</strong><span className="small muted">{emptyText}</span>{q && <button className="btn btn-outline btn-sm" onClick={() => setQ('')}>Clear search</button>}</div></div>
      )}
    </div>
  );

  if (picker) return <div className="map-shell solo" style={{ height: height || 340 }}>{canvas}</div>;

  return (
    <div className={`map-shell ${side ? '' : 'solo'}`} style={height ? { height } : undefined}>
      {side && (
        <div className="map-side">
          <div className="small muted" style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-soft)' }}>{filtered.length} result{filtered.length === 1 ? '' : 's'} on map</div>
          {filtered.map((i) => (
            <button key={i.id} className={`item ${i.id === selectedId ? 'on' : ''}`} onClick={() => onSelect?.(i.id)}>
              {renderSideItem ? renderSideItem(i) : (
                <>
                  <div className="thumb"><Img src={i.img} alt={i.name} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                    {i.lines?.slice(0, 2).map((l, k) => <div key={k} className="small muted">{l}</div>)}
                    {fmtKm(distanceTo(loc, i)) && <div className="tiny" style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtKm(distanceTo(loc, i))}</div>}
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}
      {canvas}
    </div>
  );
}
