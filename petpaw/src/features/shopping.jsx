import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, BadgeCheck, Clock, FileText, List, Map as MapIcon, MapPin, Minus, Navigation, Package, Phone, Pill, Plus,
  ShieldCheck, ShoppingBag, ShoppingCart, Store, Trash2, Truck, Upload,
} from 'lucide-react';
import MapView, { directionsUrl, distanceTo, fmtKm, useUserLocation, LocationButton } from '../components/MapView.jsx';
import { Chip, Empty, Field, Img, Modal, PageHeader, Seg, Stars, Tabs, PrototypeNote } from '../components/ui.jsx';
import { fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { AREAS, medicineCategories, productCategories, day } from '../data/mock.js';
import { addToCart, useAuthGate, useFakeLoad } from './common.jsx';

const crumbs = (base, label, to) => [{ label: base === '/explore' ? 'Home' : 'Dashboard', to: base === '/explore' ? '/' : '/user/dashboard' }, to ? { label, to } : { label }];

function StockChip({ stock }) {
  if (stock <= 0) return <Chip status="Out of stock" />;
  if (stock <= 5) return <Chip status="Low stock">Only {stock} left</Chip>;
  return <Chip status="In stock" />;
}

/* ======================= PHARMACY ======================= */
export function PharmacyBrowser({ base = '/user' }) {
  const { db, set, toast } = useApp();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState('');
  const [ph, setPh] = useState('');
  const [rxOnly, setRxOnly] = useState('');
  const [gate, gateModal] = useAuthGate();
  const loading = useFakeLoad(350);
  const list = db.medicines.filter((m) => m.expiry >= today() && (!q || m.name.toLowerCase().includes(q.toLowerCase())) && (!cat || m.cat === cat) && (!ph || m.pharmacyId === ph) && (!rxOnly || (rxOnly === 'rx' ? m.rx : !m.rx)));
  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title="Pharmacy" crumbs={crumbs(base, 'Pharmacy')} sub="Medicines from licensed veterinary pharmacies. Kept separate from Pet Shop products." actions={base === '/user' && <Link to="/user/cart" className="btn btn-outline"><ShoppingCart size={16} /> View cart</Link>} />
      <div className="alert alert-info"><ShieldCheck size={18} /><span>Items marked <span className="rx">Rx</span> need a valid prescription from a registered vet. You can attach one at checkout, and the pharmacy reviews it before dispensing. Expired stock is never sold.</span></div>
      <div className="grid g3">
        {db.pharmacies.map((p) => (
          <button key={p.id} className={`card pad-sm row ${ph === p.id ? '' : ''}`} style={{ textAlign: 'left', cursor: 'pointer', borderColor: ph === p.id ? 'var(--green)' : undefined, background: ph === p.id ? 'var(--green-50)' : undefined, flexWrap: 'nowrap' }} onClick={() => setPh(ph === p.id ? '' : p.id)} aria-pressed={ph === p.id}>
            <div className="stat" style={{ padding: 0, border: 0, background: 'none' }}><div className="ico tone-blue"><Pill size={18} /></div></div>
            <div style={{ minWidth: 0 }}><strong className="small">{p.name}</strong> <span className="verified"><BadgeCheck size={12} /></span><div className="tiny muted">{p.area} · {p.hours}</div><div className="tiny muted">Licence {p.license}</div></div>
          </button>
        ))}
      </div>
      <div className="card pad-sm grid g4" style={{ alignItems: 'end' }}>
        <Field label="Search medicine" htmlFor="pm-q"><input id="pm-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. dewormer" /></Field>
        <Field label="Category" htmlFor="pm-c"><select id="pm-c" className="select" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{medicineCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Prescription" htmlFor="pm-r"><select id="pm-r" className="select" value={rxOnly} onChange={(e) => setRxOnly(e.target.value)}><option value="">All</option><option value="otc">No prescription needed</option><option value="rx">Prescription required</option></select></Field>
        <Field label="Pharmacy" htmlFor="pm-p"><select id="pm-p" className="select" value={ph} onChange={(e) => setPh(e.target.value)}><option value="">All pharmacies</option>{db.pharmacies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
      </div>
      {loading ? <div className="grid g4">{[1, 2, 3, 4].map((i) => <div className="skel" key={i} style={{ height: 220 }} />)}</div> : list.length === 0 ? <div className="card"><Empty icon={Pill} title="No medicines found" text="Try a different name or category." /></div> : (
        <div className="grid g4">
          {list.map((m) => {
            const p = db.pharmacies.find((x) => x.id === m.pharmacyId);
            return (
              <div key={m.id} className="card stack sm">
                <div className="row between"><span className="tiny muted">{m.cat}</span>{m.rx ? <span className="rx">Rx · Prescription required</span> : <span className="pill">No prescription</span>}</div>
                <h4 style={{ fontWeight: 600 }}>{m.name}</h4>
                <div className="small muted">{m.pack} · {p?.name}</div>
                <p className="tiny muted">{m.desc}</p>
                <div className="row between" style={{ marginTop: 'auto' }}><span className="price">{money(m.price)}</span><StockChip stock={m.stock} /></div>
                <button className="btn btn-primary btn-sm" disabled={m.stock <= 0} onClick={() => gate(() => addToCart(set, toast, { id: m.id, source: 'pharmacy', providerId: m.pharmacyId, name: m.name, price: m.price, rx: m.rx, max: m.stock }), 'order medicines')}>
                  <Plus size={14} /> {m.rx ? 'Add (prescription needed)' : 'Add to cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ======================= PET SHOP ======================= */
export function ShopBrowser({ base = '/user' }) {
  const { db, set, toast } = useApp();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'products');
  const [q, setQ] = useState(params.get('q') || '');
  const [cat, setCat] = useState('');
  const [brand, setBrand] = useState('');
  const [max, setMax] = useState(5000);
  const [inStock, setInStock] = useState(false);
  const [view, setView] = useState('map');
  const [sel, setSel] = useState(null);
  const [area, setArea] = useState('');
  const [gate, gateModal] = useAuthGate();
  const loc = useUserLocation();
  const loading = useFakeLoad(400, [tab, view]);
  const brands = [...new Set(db.products.map((p) => p.brand))];
  const list = db.products.filter((p) => (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase())) && (!cat || p.cat === cat) && (!brand || p.brand === brand) && p.price <= max && (!inStock || p.stock > 0));
  const shops = db.shops.filter((s) => (!area || s.area === area) && (!q || tab !== 'shops' || `${s.name} ${s.area} ${s.address}`.toLowerCase().includes(q.toLowerCase())));
  const items = shops.map((s) => ({
    id: s.id, type: 'shop', name: s.name, lat: s.lat, lng: s.lng, area: s.area, address: s.address, img: s.img,
    lines: [s.address, `${s.hours} · ${s.phone}`, [s.delivery && 'Home delivery', s.pickup && 'Store pickup'].filter(Boolean).join(' · ')],
    primary: { label: 'View Shop', to: `${base}/shop/store/${s.id}` },
  }));
  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title="Pet Shop" crumbs={crumbs(base, 'Pet Shop')} sub="Food, toys, grooming and supplies from verified shops." actions={base === '/user' && <Link to="/user/cart" className="btn btn-outline"><ShoppingCart size={16} /> View cart</Link>} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'products', label: 'Products', count: db.products.length }, { value: 'shops', label: 'Shops near you', count: db.shops.length }]} />
      {tab === 'products' ? (
        <>
          <div className="card pad-sm grid g5" style={{ alignItems: 'end' }}>
            <Field label="Search" htmlFor="sp-q"><input id="sp-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product or brand" /></Field>
            <Field label="Category" htmlFor="sp-c"><select id="sp-c" className="select" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{productCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Brand" htmlFor="sp-b"><select id="sp-b" className="select" value={brand} onChange={(e) => setBrand(e.target.value)}><option value="">All brands</option>{brands.map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label={`Max price: ${money(max)}`} htmlFor="sp-m"><input id="sp-m" type="range" min="200" max="5000" step="100" value={max} onChange={(e) => setMax(Number(e.target.value))} style={{ accentColor: 'var(--green)' }} /></Field>
            <label className="check" style={{ paddingBottom: 10 }}><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
          </div>
          {loading ? <div className="grid g4">{[1, 2, 3, 4].map((i) => <div className="skel" key={i} style={{ height: 300 }} />)}</div> : list.length === 0 ? <div className="card"><Empty icon={ShoppingBag} title="No products match" text="Try a higher price limit or another category." /></div> : (
            <div className="grid g4">
              {list.map((p) => (
                <div key={p.id} className="media-card">
                  <Link to={`${base}/shop/product/${p.id}`} className="media" style={{ aspectRatio: '1' }}><Img src={p.img} alt={p.name} /></Link>
                  <div className="body">
                    <span className="tiny muted">{p.cat} · {p.brand}</span>
                    <Link to={`${base}/shop/product/${p.id}`} style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 14 }}>{p.name}</Link>
                    <div className="row between"><Stars value={p.rating} /><StockChip stock={p.stock} /></div>
                    <div className="row between" style={{ marginTop: 'auto' }}>
                      <span className="price">{money(p.price)}</span>
                      <button className="btn btn-primary btn-sm" disabled={p.stock <= 0} onClick={() => gate(() => addToCart(set, toast, { id: p.id, source: 'shop', providerId: p.shopId, name: p.name, price: p.price, max: p.stock, img: p.img }), 'add items to your cart')}><Plus size={14} /> Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card pad-sm row between">
            <div className="row">
              <input className="input" style={{ width: 240 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Shop name, area or address" aria-label="Search shops" />
              <select className="select" style={{ width: 180 }} value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area"><option value="">All areas</option>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select>
              <LocationButton compact />
            </div>
            <Seg value={view} onChange={setView} items={[{ value: 'list', label: 'List', icon: List }, { value: 'map', label: 'Map', icon: MapIcon }]} />
          </div>
          {view === 'map' ? <MapView items={items} selectedId={sel} onSelect={setSel} loading={loading} /> : shops.length === 0 ? <div className="card"><Empty icon={Store} title="No shops in this area" /></div> : (
            <div className="grid g3">
              {shops.map((s) => (
                <div key={s.id} className="media-card">
                  <div className="media" style={{ aspectRatio: '16/9' }}><Img src={s.img} alt={s.name} /></div>
                  <div className="body">
                    <div className="row between"><Stars value={s.rating} /><span className="verified"><BadgeCheck size={14} /> Verified</span></div>
                    <h3 style={{ fontSize: 16 }}>{s.name}</h3>
                    <div className="small muted row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'flex-start' }}><MapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} /> {s.address}</div>
                    <div className="small muted row" style={{ gap: 6 }}><Clock size={14} /> {s.hours}</div>
                    <div className="small muted row" style={{ gap: 6 }}><Phone size={14} /> {s.phone}</div>
                    <div className="row" style={{ gap: 6 }}>{s.delivery && <span className="pill"><Truck size={12} /> Delivery</span>}{s.pickup && <span className="pill"><Store size={12} /> Pickup</span>}</div>
                    {fmtKm(distanceTo(loc, s)) && <div className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtKm(distanceTo(loc, s))}</div>}
                    <div className="row" style={{ marginTop: 'auto', paddingTop: 8, gap: 8 }}>
                      <Link className="btn btn-primary btn-sm" to={`${base}/shop/store/${s.id}`}>View Shop</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSel(s.id); setView('map'); }}><MapIcon size={14} /> View on Map</button>
                      <a className="btn btn-ghost btn-sm" href={directionsUrl(s)} target="_blank" rel="noreferrer"><Navigation size={14} /> Directions</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ProductDetail({ base = '/user' }) {
  const { id } = useParams();
  const { db, set, toast } = useApp();
  const [qty, setQty] = useState(1);
  const [gate, gateModal] = useAuthGate();
  const p = db.products.find((x) => x.id === id);
  if (!p) return <Empty title="Product not found" />;
  const s = db.shops.find((x) => x.id === p.shopId);
  const reviews = db.reviews.filter((r) => r.targetType === 'product' && r.targetId === p.id);
  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title={p.name} crumbs={[...crumbs(base, 'Pet Shop', `${base}/shop`), { label: p.cat }]} />
      <div className="grid g2" style={{ gap: 28 }}>
        <div className="stack">
          <div className="banner-img" style={{ aspectRatio: '1' }}><Img src={p.img} alt={p.name} /></div>
          <div className="grid g4">{[0, 1, 2, 3].map((i) => <div key={i} className="banner-img" style={{ aspectRatio: '1', opacity: i ? 0.7 : 1, outline: i ? 'none' : '2px solid var(--green)' }}><Img src={p.img} alt="" /></div>)}</div>
        </div>
        <div className="stack lg">
          <div className="stack sm">
            <span className="small muted">{p.brand} · For {p.species}</span>
            <Stars value={p.rating} count={reviews.length || 24} />
            <div className="price-lg" style={{ fontSize: 30 }}>{money(p.price)}</div>
            <StockChip stock={p.stock} />
          </div>
          <p>{p.desc}</p>
          <div className="row">
            <div className="row" style={{ gap: 0, border: '1px solid var(--line)', borderRadius: 10 }}>
              <button className="btn btn-ghost" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
              <span className="num" style={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
              <button className="btn btn-ghost" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            <button className="btn btn-primary btn-lg" disabled={p.stock <= 0} onClick={() => gate(() => addToCart(set, toast, { id: p.id, source: 'shop', providerId: p.shopId, name: p.name, price: p.price, max: p.stock, img: p.img, qty }), 'add items to your cart')}><ShoppingCart size={17} /> Add to cart</button>
          </div>
          <div className="card pad-sm stack sm">
            <div className="row between"><strong>{s.name}</strong><span className="verified"><BadgeCheck size={14} /> Verified shop</span></div>
            <div className="small muted">{s.address}</div>
            <div className="row small" style={{ gap: 14 }}>{s.delivery && <span className="row" style={{ gap: 5 }}><Truck size={14} /> Home delivery, 1–2 days</span>}{s.pickup && <span className="row" style={{ gap: 5 }}><Store size={14} /> Store pickup</span>}</div>
            <Link to={`${base}/shop/store/${s.id}`} className="small" style={{ fontWeight: 600 }}>Visit shop</Link>
          </div>
          <div className="stack">
            <h3>Reviews</h3>
            {[{ by: 'Nusrat T.', r: 5, t: 'My dog loves it and the delivery was quick.' }, { by: 'Arman K.', r: 4, t: 'Good quality for the price.' }].map((r) => (
              <div key={r.by} className="card pad-sm"><div className="row between"><strong className="small">{r.by}</strong><Stars value={r.r} /></div><p className="small" style={{ marginTop: 6 }}>{r.t}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreDetail({ base = '/user' }) {
  const { id } = useParams();
  const { db } = useApp();
  const s = db.shops.find((x) => x.id === id);
  if (!s) return <Empty title="Shop not found" />;
  const prods = db.products.filter((p) => p.shopId === s.id);
  return (
    <div className="stack lg">
      <PageHeader title={s.name} crumbs={[...crumbs(base, 'Pet Shop', `${base}/shop?tab=shops`), { label: s.name }]} actions={<a className="btn btn-outline" href={directionsUrl(s)} target="_blank" rel="noreferrer"><Navigation size={16} /> Get Directions</a>} />
      <div className="split">
        <div className="stack">
          <h3>Products from this shop</h3>
          {prods.length ? (
            <div className="grid g3">{prods.map((p) => (
              <Link key={p.id} to={`${base}/shop/product/${p.id}`} className="media-card hover-card" style={{ color: 'inherit' }}>
                <div className="media" style={{ aspectRatio: '1' }}><Img src={p.img} alt={p.name} /></div>
                <div className="body"><span className="small" style={{ fontWeight: 600 }}>{p.name}</span><div className="row between"><span className="price">{money(p.price)}</span><StockChip stock={p.stock} /></div></div>
              </Link>
            ))}</div>
          ) : <div className="card"><Empty icon={Package} title="No products listed yet" /></div>}
        </div>
        <div className="stack">
          <div className="card stack sm">
            <div className="row between"><Stars value={s.rating} /><span className="verified"><BadgeCheck size={14} /> Verified</span></div>
            <div className="small row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}><MapPin size={15} style={{ marginTop: 3, flexShrink: 0 }} /> {s.address}</div>
            <div className="small row" style={{ gap: 8 }}><Clock size={15} /> {s.hours}</div>
            <div className="small row" style={{ gap: 8 }}><Phone size={15} /> {s.phone}</div>
            <div className="row" style={{ gap: 6 }}>{s.delivery && <span className="pill"><Truck size={12} /> Delivery</span>}{s.pickup && <span className="pill"><Store size={12} /> Pickup</span>}</div>
          </div>
          <MapView side={false} height={260} items={[{ id: s.id, type: 'shop', name: s.name, lat: s.lat, lng: s.lng, area: s.area, img: s.img, lines: [s.address] }]} />
        </div>
      </div>
    </div>
  );
}

/* ======================= CART & CHECKOUT ======================= */
export function Cart() {
  const { db, set, notify, toast } = useApp();
  const nav = useNavigate();
  const [checkout, setCheckout] = useState(null); // { source, providerId }
  const groups = useMemo(() => {
    const g = {};
    db.cart.forEach((c) => { const k = `${c.source}:${c.providerId}`; (g[k] = g[k] || { source: c.source, providerId: c.providerId, items: [] }).items.push(c); });
    return Object.values(g);
  }, [db.cart]);
  const updQty = (c, q) => set('cart', (cart) => (q <= 0 ? cart.filter((x) => x !== c) : cart.map((x) => (x === c ? { ...x, qty: Math.min(q, x.max || 99) } : x))));
  const providerName = (g) => (g.source === 'shop' ? db.shops : db.pharmacies).find((x) => x.id === g.providerId)?.name;

  return (
    <div className="stack lg">
      <PageHeader title="Your cart" crumbs={[{ label: 'Dashboard', to: '/user/dashboard' }, { label: 'Cart' }]} sub="Pet Shop and Pharmacy orders are placed separately with each seller." />
      {groups.length === 0 ? (
        <div className="card"><Empty icon={ShoppingCart} title="Your cart is empty" text="Browse the Pet Shop for supplies or the Pharmacy for medicines." action={<div className="row"><Link to="/user/shop" className="btn btn-primary">Pet Shop</Link><Link to="/user/pharmacy" className="btn btn-outline">Pharmacy</Link></div>} /></div>
      ) : groups.map((g) => {
        const total = g.items.reduce((s, i) => s + i.price * i.qty, 0);
        const hasRx = g.items.some((i) => i.rx);
        return (
          <div key={`${g.source}${g.providerId}`} className="card stack">
            <div className="row between">
              <div className="row">{g.source === 'shop' ? <Store size={18} color="var(--orange-700)" /> : <Pill size={18} color="var(--info)" />}<h3>{providerName(g)}</h3><Chip tone={g.source === 'shop' ? 'orange' : 'info'}>{g.source === 'shop' ? 'Pet Shop' : 'Pharmacy'}</Chip></div>
              {hasRx && <span className="rx">Contains prescription items</span>}
            </div>
            <div className="table-wrap"><table className="table"><tbody>
              {g.items.map((i) => (
                <tr key={i.id}>
                  <td><strong className="small">{i.name}</strong> {i.rx && <span className="rx">Rx</span>}</td>
                  <td className="num">{money(i.price)}</td>
                  <td><div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><button className="btn btn-ghost btn-sm" onClick={() => updQty(i, i.qty - 1)} aria-label="Decrease"><Minus size={13} /></button><span className="num" style={{ minWidth: 20, textAlign: 'center' }}>{i.qty}</span><button className="btn btn-ghost btn-sm" onClick={() => updQty(i, i.qty + 1)} aria-label="Increase"><Plus size={13} /></button></div></td>
                  <td className="num"><strong>{money(i.price * i.qty)}</strong></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => updQty(i, 0)} aria-label={`Remove ${i.name}`}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody></table></div>
            <div className="row between"><span>Subtotal <strong className="price">{money(total)}</strong></span><button className="btn btn-primary" onClick={() => setCheckout(g)}>Checkout with {providerName(g)}</button></div>
          </div>
        );
      })}
      {checkout && <CheckoutModal group={checkout} providerName={providerName(checkout)} onClose={() => setCheckout(null)} onPlaced={(id) => { setCheckout(null); nav('/user/orders'); }} />}
    </div>
  );
}

function CheckoutModal({ group, providerName, onClose, onPlaced }) {
  const { db, set, notify, toast } = useApp();
  const shop = group.source === 'shop' ? db.shops.find((s) => s.id === group.providerId) : null;
  const hasRx = group.items.some((i) => i.rx);
  const myRx = db.prescriptions.filter((r) => db.pets.some((p) => p.id === r.petId));
  const [f, setF] = useState({ delivery: shop && !shop.delivery ? 'Store pickup' : 'Home delivery', address: 'Road 4, House 22, Dhanmondi, Dhaka 1209', payment: 'Cash on delivery', rxId: myRx[0]?.id || '', rxFile: '', rxMode: myRx.length ? 'existing' : 'upload' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const subtotal = group.items.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = f.delivery === 'Home delivery' ? (subtotal >= db.shopDelivery.freeAbove && group.source === 'shop' ? 0 : db.shopDelivery.insideDhaka) : 0;
  const place = () => {
    if (f.delivery === 'Home delivery' && f.address.trim().length < 8) { setErr('Enter a full delivery address'); return; }
    if (hasRx && f.rxMode === 'existing' && !f.rxId) { setErr('Choose a prescription'); return; }
    if (hasRx && f.rxMode === 'upload' && !f.rxFile) { setErr('Upload a photo or PDF of the prescription'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => {
      const id = newId('ORD');
      const order = {
        id, source: group.source, providerId: group.providerId, customer: db.auth.name, phone: '+880 1712-345678',
        items: group.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, rx: i.rx })), total: subtotal + fee, deliveryFee: fee,
        delivery: f.delivery, address: f.delivery === 'Home delivery' ? f.address : providerName,
        payment: hasRx ? 'Pending' : f.payment === 'Cash on delivery' ? 'Cash on delivery' : `Paid (${f.payment} — prototype)`,
        status: hasRx ? 'Prescription review' : 'New', rxId: hasRx && f.rxMode === 'existing' ? f.rxId : null, rxFile: hasRx && f.rxMode === 'upload' ? f.rxFile : hasRx ? `${f.rxId}.pdf` : null, date: day(0),
      };
      set('orders', (o) => [order, ...o]);
      set('cart', (c) => c.filter((x) => !(x.source === group.source && x.providerId === group.providerId)));
      notify(group.source === 'shop' ? 'shop' : 'pharmacy', hasRx ? `Order ${id} needs prescription review.` : `New order ${id} from ${db.auth.name}.`, group.source === 'shop' ? '/shop/orders' : hasRx ? '/pharmacy/prescriptions' : '/pharmacy/orders');
      notify('user', hasRx ? `Order ${id} sent to ${providerName} for prescription review.` : `Order ${id} placed with ${providerName}.`, '/user/orders');
      toast(hasRx ? 'Order sent for prescription review' : 'Order placed');
      setLoading(false);
      onPlaced(id);
    }, 700);
  };
  return (
    <Modal open wide onClose={onClose} title={`Checkout — ${providerName}`} footer={<><button className="btn btn-outline" onClick={onClose}>Back to cart</button><button className="btn btn-primary" onClick={place} disabled={loading}>{loading ? <><span className="spinner" /> Placing…</> : hasRx ? 'Submit for prescription review' : `Place order · ${money(subtotal + fee)}`}</button></>}>
      <div className="split">
        <div className="stack">
          <div className="field">
            <span className="label">Delivery or pickup</span>
            <div className="choice-grid">
              {(!shop || shop.delivery) && <button type="button" className={`choice ${f.delivery === 'Home delivery' ? 'on' : ''}`} onClick={() => setF({ ...f, delivery: 'Home delivery' })}><Truck size={18} /><strong>Home delivery</strong><span className="tiny muted">{money(db.shopDelivery.insideDhaka)} inside Dhaka · {db.shopDelivery.eta}</span></button>}
              {(!shop || shop.pickup) && <button type="button" className={`choice ${f.delivery === 'Store pickup' ? 'on' : ''}`} onClick={() => setF({ ...f, delivery: 'Store pickup' })}><Store size={18} /><strong>Store pickup</strong><span className="tiny muted">Free · ready in ~2 hours</span></button>}
            </div>
          </div>
          {f.delivery === 'Home delivery' && <Field label="Delivery address" htmlFor="co-addr"><textarea id="co-addr" className="textarea" style={{ minHeight: 64 }} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>}
          {hasRx && (
            <div className="card pad-sm stack" style={{ background: 'var(--bg)' }}>
              <div className="row"><ShieldCheck size={18} color="var(--bad)" /><strong>Prescription required</strong></div>
              <p className="small muted">The pharmacy reviews the prescription before dispensing. You pay only after it’s approved.</p>
              <Seg value={f.rxMode} onChange={(v) => setF({ ...f, rxMode: v })} items={[{ value: 'existing', label: 'From my PetPaw vet' }, { value: 'upload', label: 'Upload' }]} />
              {f.rxMode === 'existing' ? (myRx.length ? (
                <select className="select" value={f.rxId} onChange={(e) => setF({ ...f, rxId: e.target.value })} aria-label="Prescription">
                  {myRx.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.petName} · {fmtDate(r.date)} · {r.items.map((i) => i.med).join(', ')}</option>)}
                </select>
              ) : <p className="small muted">No prescriptions from PetPaw doctors yet. Upload one instead.</p>) : (
                f.rxFile ? <div className="doc-thumb"><FileText size={15} /> {f.rxFile}<button className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, rxFile: '' })}>Remove</button></div> : (
                  <label className="upload"><input type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => e.target.files[0] && setF({ ...f, rxFile: e.target.files[0].name })} /><Upload size={18} style={{ margin: '0 auto 4px' }} /> Upload prescription (photo or PDF)</label>
                )
              )}
            </div>
          )}
          {!hasRx && (
            <Field label="Payment method" htmlFor="co-pay">
              <select id="co-pay" className="select" value={f.payment} onChange={(e) => setF({ ...f, payment: e.target.value })}>
                <option>Cash on delivery</option><option>bKash</option><option>Nagad</option><option>Card</option>
              </select>
            </Field>
          )}
          {!hasRx && f.payment !== 'Cash on delivery' && <PrototypeNote>No real payment gateway is connected</PrototypeNote>}
          {err && <div className="alert alert-bad small"><AlertTriangle size={16} /> {err}</div>}
        </div>
        <div className="card pad-sm breakdown" style={{ background: 'var(--bg)' }}>
          <strong>Order summary</strong>
          {group.items.map((i) => <div key={i.id} className="line small"><span>{i.qty} × {i.name}</span><span className="num">{money(i.price * i.qty)}</span></div>)}
          <div className="line"><span>Delivery</span><span className="num">{fee ? money(fee) : 'Free'}</span></div>
          <div className="line total"><span>Total</span><span className="num">{money(subtotal + fee)}</span></div>
          {hasRx && <span className="tiny muted">Payment is collected after prescription approval.</span>}
        </div>
      </div>
    </Modal>
  );
}
