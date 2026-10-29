import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle, BadgeCheck, CalendarRange, CheckCircle2, Flag, HeartHandshake, Info, List, Lock, Map as MapIcon, MapPin,
  Megaphone, MessageSquare, Phone, ShieldCheck, Star, Upload, Wallet,
} from 'lucide-react';
import MapView, { distanceTo, fmtKm, useUserLocation, LocationButton } from '../components/MapView.jsx';
import { Chip, Empty, Field, Img, Initials, Modal, PageHeader, PrototypeNote, Seg, Stars, StarInput, Timeline } from '../components/ui.jsx';
import { borrowCost, daysBetween, findConflict, fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { AREAS, IMG, day } from '../data/mock.js';
import { ReportModal, useAuthGate, useFakeLoad } from './common.jsx';

const crumbs = (base, label, to) => [{ label: base === '/explore' ? 'Home' : 'Dashboard', to: base === '/explore' ? '/' : base === '/borrow/browse' ? '/borrow/dashboard' : '/user/dashboard' }, to ? { label, to } : { label }];
const typeTone = (t) => (t === 'For Sale' ? 'orange' : t === 'Free' ? 'ok' : 'info');

/* ======================= MARKETPLACE ======================= */
export function MarketplaceBrowser({ base = '/user' }) {
  const { db } = useApp();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [species, setSpecies] = useState('');
  const [type, setType] = useState('');
  const [area, setArea] = useState('');
  const [max, setMax] = useState(30000);
  const [gate, gateModal] = useAuthGate();
  const loading = useFakeLoad(400);
  const all = db.ads.filter((a) => a.status === 'Active' || a.status === 'Reserved');
  const list = all.filter((a) => (!q || `${a.name} ${a.breed} ${a.area}`.toLowerCase().includes(q.toLowerCase())) && (!species || a.species === species) && (!type || a.type === type) && (!area || a.area === area) && (a.type !== 'For Sale' || a.price <= max));
  // Ads with open reports are not promoted to the top
  const sorted = [...list].sort((a, b) => (a.reports && !a.cleared ? 1 : 0) - (b.reports && !b.cleared ? 1 : 0));
  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title="Pet Marketplace" crumbs={crumbs(base, 'Pet Marketplace')} sub="Pets for sale, free to a good home, or rehoming. For short paid stays, use Pet Borrow instead." actions={<button className="btn btn-primary" onClick={() => gate(() => nav('/user/ads/new'), 'post an ad')}><Megaphone size={16} /> Create ad</button>} />
      <div className="card pad-sm grid g5" style={{ alignItems: 'end' }}>
        <Field label="Search" htmlFor="mk-q"><input id="mk-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, breed or area" /></Field>
        <Field label="Species" htmlFor="mk-s"><select id="mk-s" className="select" value={species} onChange={(e) => setSpecies(e.target.value)}><option value="">All</option>{['Dog', 'Cat', 'Bird', 'Rabbit'].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Listing type" htmlFor="mk-t"><select id="mk-t" className="select" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option><option>For Sale</option><option>Free</option><option>Rehoming</option></select></Field>
        <Field label="Location" htmlFor="mk-a"><select id="mk-a" className="select" value={area} onChange={(e) => setArea(e.target.value)}><option value="">All areas</option>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
        <Field label={`Max price: ${money(max)}`} htmlFor="mk-m"><input id="mk-m" type="range" min="1000" max="30000" step="500" value={max} onChange={(e) => setMax(Number(e.target.value))} style={{ accentColor: 'var(--green)' }} /></Field>
      </div>
      <div className="alert alert-warn small"><ShieldCheck size={16} /> <span><strong>Stay safe:</strong> meet in a public place, see the pet in person, and never send advance payment to someone you haven’t met. Report anything suspicious.</span></div>
      {loading ? <div className="grid g4">{[1, 2, 3, 4].map((i) => <div className="skel" key={i} style={{ height: 280 }} />)}</div> : sorted.length === 0 ? <div className="card"><Empty icon={Megaphone} title="No ads match your filters" text="Try another species or area." /></div> : (
        <div className="grid g4">
          {sorted.map((a) => (
            <Link key={a.id} to={`${base}/marketplace/${a.id}`} className="media-card hover-card" style={{ color: 'inherit' }}>
              <div className="media"><Img src={a.img} alt={a.name} /><span className="tag"><Chip tone={typeTone(a.type)}>{a.type}</Chip></span>{a.status === 'Reserved' && <span className="chip chip-warn" style={{ position: 'absolute', top: 10, right: 10 }}>Reserved</span>}</div>
              <div className="body">
                <h3 style={{ fontSize: 16 }}>{a.name}</h3>
                <div className="small muted">{a.species} · {a.breed} · {a.age}</div>
                <div className="row between" style={{ marginTop: 'auto' }}>
                  <span className="small muted row" style={{ gap: 4 }}><MapPin size={13} /> {a.area}</span>
                  <span className="price">{a.type === 'For Sale' ? money(a.price) : 'Free'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdDetail({ base = '/user' }) {
  const { id } = useParams();
  const { db, set, toast } = useApp();
  const nav = useNavigate();
  const [gate, gateModal] = useAuthGate();
  const [inq, setInq] = useState(false);
  const [report, setReport] = useState(false);
  const [msg, setMsg] = useState('');
  const a = db.ads.find((x) => x.id === id);
  if (!a || a.status === 'Removed') return <div className="card"><Empty icon={Megaphone} title="This ad is no longer available" text="It may have been completed or removed for breaking listing guidelines." action={<Link to={`${base}/marketplace`} className="btn btn-primary">Browse other pets</Link>} /></div>;
  const mine = a.mine && db.auth && db.auth.name === a.owner;
  const send = () => {
    if (msg.trim().length < 5) return;
    set('threads', (t) => {
      const ex = t.find((x) => x.with === a.owner && x.about.includes(a.id));
      if (ex) return t.map((x) => (x === ex ? { ...x, messages: [...x.messages, { me: true, text: msg.trim(), at: 'Just now' }] } : x));
      return [{ id: newId('T'), with: a.owner, about: `Ad ${a.id} · ${a.name}`, messages: [{ me: true, text: msg.trim(), at: 'Just now' }] }, ...t];
    });
    set('ads', (ads) => ads.map((x) => (x.id === a.id ? { ...x, inquiries: x.inquiries + 1 } : x)));
    setInq(false); setMsg('');
    toast('Inquiry sent. Replies appear in Inquiries & Messages.');
  };
  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title={a.name} crumbs={[...crumbs(base, 'Pet Marketplace', `${base}/marketplace`), { label: a.name }]} actions={mine ? <Link to={`/user/ads/${a.id}/edit`} className="btn btn-outline">Edit my ad</Link> : null} />
      <div className="grid g2" style={{ gap: 28 }}>
        <div className="stack">
          <div className="banner-img" style={{ aspectRatio: '4/3' }}><Img src={a.img} alt={a.name} /></div>
          <div className="card stack sm">
            <h3>About {a.name}</h3>
            <p>{a.desc}</p>
            <dl className="kv" style={{ marginTop: 8 }}>
              <dt>Species / breed</dt><dd>{a.species} · {a.breed}</dd>
              <dt>Age</dt><dd>{a.age}</dd>
              <dt>Health</dt><dd>{a.health}</dd>
              <dt>Vaccination</dt><dd>{a.vacc}</dd>
              <dt>Temperament</dt><dd>{a.temperament}</dd>
              <dt>Care needs</dt><dd>{a.care}</dd>
            </dl>
          </div>
        </div>
        <div className="stack">
          <div className="card stack">
            <div className="row between"><Chip tone={typeTone(a.type)}>{a.type}</Chip><Chip status={a.status} /></div>
            <div className="price-lg" style={{ fontSize: 30 }}>{a.type === 'For Sale' ? money(a.price) : 'Free to a good home'}</div>
            <div className="small muted row" style={{ gap: 6 }}><MapPin size={14} /> {a.area}, Dhaka · Posted {fmtDate(a.posted)}</div>
            {!mine && (
              <div className="row">
                <button className="btn btn-primary" disabled={a.status !== 'Active'} onClick={() => gate(() => setInq(true), 'contact the advertiser')}><MessageSquare size={16} /> Send inquiry</button>
                <button className="btn btn-ghost" onClick={() => gate(() => setReport(true), 'report a listing')}><Flag size={15} /> Report listing</button>
              </div>
            )}
            {a.status === 'Reserved' && <div className="alert alert-warn small">This pet is reserved. The advertiser may reopen the ad if plans change.</div>}
          </div>
          <div className="card row" style={{ flexWrap: 'nowrap' }}>
            <Initials name={a.owner} />
            <div className="grow">
              <strong>{a.owner}</strong>
              <div className="tiny muted">Member since 2025 · Phone verified · Prefers {a.contact.toLowerCase()}</div>
            </div>
            {a.reports === 0 && <span className="verified"><BadgeCheck size={14} /> No reports</span>}
          </div>
          <div className="card stack sm" style={{ background: 'var(--bg)' }}>
            <div className="row"><ShieldCheck size={18} color="var(--green)" /><strong>Safe contact tips</strong></div>
            <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
              <li>Keep chats in PetPaw so our team can help if something goes wrong.</li>
              <li>Ask for vaccination records and meet the pet before paying.</li>
              <li>Never pay a “booking fee” or advance to an unknown seller.</li>
              <li>Protected wildlife can’t be sold. Report such ads.</li>
            </ul>
          </div>
        </div>
      </div>
      <Modal open={inq} onClose={() => setInq(false)} title={`Ask about ${a.name}`} footer={<><button className="btn btn-outline" onClick={() => setInq(false)}>Cancel</button><button className="btn btn-primary" disabled={msg.trim().length < 5} onClick={send}>Send inquiry</button></>}>
        <div className="stack">
          <p className="small muted">Your phone number stays hidden. {a.owner} will reply in your messages.</p>
          <textarea className="textarea" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={`Hi! Is ${a.name} still available? Could I see the vaccination card?`} aria-label="Message" />
        </div>
      </Modal>
      <ReportModal open={report} onClose={() => setReport(false)} category="Listing" target={`${a.id} · ${a.name}`} onReported={() => set('ads', (ads) => ads.map((x) => (x.id === a.id ? { ...x, reports: x.reports + 1, cleared: false } : x)))} />
    </div>
  );
}

export function AdForm() {
  const { id } = useParams();
  const { db, set, toast } = useApp();
  const nav = useNavigate();
  const editing = db.ads.find((a) => a.id === id);
  const [f, setF] = useState(editing || { name: '', species: 'Dog', breed: '', age: '', type: 'For Sale', price: '', area: 'Dhanmondi', desc: '', health: '', vacc: '', temperament: '', care: '', contact: 'In-app messages', img: '', photoName: '' });
  const [err, setErr] = useState({});
  const [preview, setPreview] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const validate = () => {
    const er = {};
    if (!f.name.trim()) er.name = 'Enter the pet’s name';
    if (!f.breed.trim()) er.breed = 'Enter the breed (or “Deshi / mixed”)';
    if (!f.age.trim()) er.age = 'Enter an approximate age';
    if (f.type === 'For Sale' && !(Number(f.price) > 0)) er.price = 'Enter a price in Taka';
    if (f.desc.trim().length < 20) er.desc = 'Describe the pet in at least 20 characters';
    if (!f.health.trim()) er.health = 'Share the pet’s health status honestly';
    if (!editing && !f.photoName) er.photo = 'Add at least one photo of the pet';
    setErr(er);
    return !Object.keys(er).length;
  };
  const publish = () => {
    const status = db.settings.adModeration.startsWith('Review') ? 'Pending' : 'Active';
    if (editing) {
      set('ads', (ads) => ads.map((a) => (a.id === editing.id ? { ...f, price: f.type === 'For Sale' ? Number(f.price) : 0 } : a)));
      toast('Ad updated');
    } else {
      const imgMap = { Dog: IMG.dog2, Cat: IMG.cat3, Bird: IMG.budgie, Rabbit: IMG.rabbit };
      set('ads', (ads) => [{ ...f, id: newId('AD'), owner: db.auth.name, mine: true, price: f.type === 'For Sale' ? Number(f.price) : 0, img: imgMap[f.species] || IMG.dog2, status, inquiries: 0, reports: 0, posted: day(0) }, ...ads]);
      toast(status === 'Pending' ? 'Ad submitted for moderation' : 'Ad published');
    }
    nav('/user/ads');
  };
  return (
    <div className="stack lg">
      <PageHeader title={editing ? `Edit ad — ${editing.name}` : 'Create a pet ad'} crumbs={[{ label: 'Dashboard', to: '/user/dashboard' }, { label: 'My Ads', to: '/user/ads' }, { label: editing ? 'Edit' : 'New ad' }]} sub="For selling, giving away for free, or rehoming. To offer short paid stays, use Pet Borrow." />
      <div className="split">
        <form className="card stack" noValidate onSubmit={(e) => { e.preventDefault(); if (validate()) setPreview(true); }}>
          <div className="field">
            <span className="label">Listing type <span className="req">*</span></span>
            <div className="choice-grid">
              {[{ v: 'For Sale', d: 'Set a price' }, { v: 'Free', d: 'Give away to a good home' }, { v: 'Rehoming', d: 'Find a new family, no fee' }].map((t) => (
                <button type="button" key={t.v} className={`choice ${f.type === t.v ? 'on' : ''}`} onClick={() => setF({ ...f, type: t.v })}><strong>{t.v}</strong><span className="tiny muted">{t.d}</span></button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Photos <span className="req">*</span></span>
            {f.photoName || editing ? <div className="doc-thumb"><Upload size={15} /> {f.photoName || 'Current photo'} <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, photoName: '' })}>Replace</button></div> : (
              <label className="upload"><input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && setF({ ...f, photoName: e.target.files[0].name })} /><Upload size={20} style={{ margin: '0 auto 4px' }} /> Upload clear, recent photos (your own)</label>
            )}
            {err.photo && <span className="error-text">{err.photo}</span>}
          </div>
          <div className="form-grid">
            <Field label="Pet name" required error={err.name} htmlFor="ad-n"><input id="ad-n" className={`input ${err.name ? 'invalid' : ''}`} value={f.name} onChange={up('name')} /></Field>
            <Field label="Species" required htmlFor="ad-s"><select id="ad-s" className="select" value={f.species} onChange={up('species')}>{['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Breed" required error={err.breed} htmlFor="ad-b"><input id="ad-b" className={`input ${err.breed ? 'invalid' : ''}`} value={f.breed} onChange={up('breed')} /></Field>
            <Field label="Age" required error={err.age} htmlFor="ad-a"><input id="ad-a" className={`input ${err.age ? 'invalid' : ''}`} value={f.age} onChange={up('age')} placeholder="e.g. 3 months" /></Field>
            {f.type === 'For Sale' && <Field label="Price (৳)" required error={err.price} htmlFor="ad-p"><input id="ad-p" type="number" min="0" className={`input ${err.price ? 'invalid' : ''}`} value={f.price} onChange={up('price')} /></Field>}
            <Field label="Location (area)" required htmlFor="ad-l"><select id="ad-l" className="select" value={f.area} onChange={up('area')}>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
            <Field label="Description" required error={err.desc} full htmlFor="ad-d"><textarea id="ad-d" className={`textarea ${err.desc ? 'invalid' : ''}`} value={f.desc} onChange={up('desc')} /></Field>
            <Field label="Health information" required error={err.health} htmlFor="ad-h"><input id="ad-h" className={`input ${err.health ? 'invalid' : ''}`} value={f.health} onChange={up('health')} placeholder="e.g. Dewormed, healthy" /></Field>
            <Field label="Vaccination details" htmlFor="ad-v"><input id="ad-v" className="input" value={f.vacc} onChange={up('vacc')} placeholder="e.g. Rabies, DHPPi" /></Field>
            <Field label="Temperament" htmlFor="ad-t"><input id="ad-t" className="input" value={f.temperament} onChange={up('temperament')} /></Field>
            <Field label="Care information" htmlFor="ad-c"><input id="ad-c" className="input" value={f.care} onChange={up('care')} /></Field>
            <Field label="Preferred safe contact method" full htmlFor="ad-ct"><select id="ad-ct" className="select" value={f.contact} onChange={up('contact')}><option>In-app messages</option><option>In-app messages, then phone after meeting</option></select></Field>
          </div>
          <div className="row end"><Link to="/user/ads" className="btn btn-outline">Cancel</Link><button className="btn btn-primary">Review & publish</button></div>
        </form>
        <div className="card stack sm" style={{ background: 'var(--bg)' }}>
          <h4>Listing guidelines</h4>
          <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
            <li>Only list pets you own or may rehome.</li>
            <li>Use your own, recent photos.</li>
            <li>Describe health honestly. Misleading ads are removed.</li>
            <li>Never ask for advance payment.</li>
            <li>Ads are {db.settings.adModeration.toLowerCase()}.</li>
          </ul>
        </div>
      </div>
      <Modal open={preview} onClose={() => setPreview(false)} title="Publish this ad?" footer={<><button className="btn btn-outline" onClick={() => setPreview(false)}>Keep editing</button><button className="btn btn-primary" onClick={publish}>{editing ? 'Save changes' : 'Publish ad'}</button></>}>
        <div className="stack sm">
          <div className="row between"><strong style={{ fontSize: 18 }}>{f.name}</strong><Chip tone={typeTone(f.type)}>{f.type}</Chip></div>
          <div className="small muted">{f.species} · {f.breed} · {f.age} · {f.area}</div>
          <div className="price-lg">{f.type === 'For Sale' ? money(f.price) : 'Free'}</div>
          <p className="small">{f.desc}</p>
          <div className="alert alert-info small">By publishing you confirm the information is accurate and follows the listing guidelines.</div>
        </div>
      </Modal>
    </div>
  );
}

/* ======================= PET BORROW ======================= */
function availableFor(l, start, end, reqs) {
  if (!start || !end) return true;
  if (start < l.availableFrom || end > l.availableTo) return false;
  return !findConflict(reqs, l.id, start, end);
}

export function BorrowBrowser({ base = '/user' }) {
  const { db } = useApp();
  const [view, setView] = useState('list');
  const [species, setSpecies] = useState('');
  const [area, setArea] = useState('');
  const [max, setMax] = useState(1000);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [sel, setSel] = useState(null);
  const loc = useUserLocation();
  const loading = useFakeLoad(450, [view]);
  const detailBase = base === '/borrow/browse' ? '/borrow/browse' : `${base}/borrow`;
  const list = db.borrowListings.filter((l) => l.status === 'Active' && (!species || l.species === species) && (!area || l.area === area) && l.daily <= max && availableFor(l, start, end, db.borrowRequests));
  const items = list.map((l) => ({
    id: l.id, type: 'borrow', approx: true, name: `${l.name} · ${l.breed}`, lat: l.lat, lng: l.lng, area: l.area, img: l.img,
    lines: [`${l.area} — general area only`, `${money(l.daily)}/day · ${l.minDays}–${l.maxDays} days`, `Available ${fmtDate(l.availableFrom)} – ${fmtDate(l.availableTo)}`],
    primary: { label: 'Request to Borrow', to: `${detailBase}/${l.id}?request=1` },
    secondary: { label: 'View Details', to: `${detailBase}/${l.id}` },
  }));
  const dateErr = start && end && end <= start ? 'End date must be after start date' : '';
  return (
    <div className="stack lg">
      <PageHeader title={base === '/borrow/browse' ? 'Browse Available Pets' : 'Pet Borrow'} crumbs={crumbs(base, 'Pet Borrow')} sub="Paid, temporary stays with a pet. Not a sale or adoption — the pet goes home after the agreed dates." actions={<>
        {base === '/user' && <Link to="/borrow/dashboard" className="btn btn-outline"><HeartHandshake size={16} /> Open Pet Borrow portal</Link>}
        <Seg value={view} onChange={setView} items={[{ value: 'list', label: 'List', icon: List }, { value: 'map', label: 'Map', icon: MapIcon }]} />
      </>} />
      <div className="card pad-sm">
        <div className="grid g5" style={{ alignItems: 'end' }}>
          <Field label="Pet type" htmlFor="bb-s"><select id="bb-s" className="select" value={species} onChange={(e) => setSpecies(e.target.value)}><option value="">All pets</option>{['Dog', 'Cat', 'Bird'].map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Location" htmlFor="bb-a"><select id="bb-a" className="select" value={area} onChange={(e) => setArea(e.target.value)}><option value="">All areas</option>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
          <Field label="From" htmlFor="bb-f"><input id="bb-f" type="date" className="input" min={today()} value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="To" error={dateErr} htmlFor="bb-t"><input id="bb-t" type="date" className={`input ${dateErr ? 'invalid' : ''}`} min={start || today()} value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
          <Field label={`Max daily price: ${money(max)}`} htmlFor="bb-m"><input id="bb-m" type="range" min="200" max="1000" step="50" value={max} onChange={(e) => setMax(Number(e.target.value))} style={{ accentColor: 'var(--green)' }} /></Field>
        </div>
        <div className="row between" style={{ marginTop: 12 }}>
          <span className="small muted">{list.length} pet{list.length === 1 ? '' : 's'} available{start && end && !dateErr ? ` for ${fmtDate(start)} – ${fmtDate(end)}` : ''}</span>
          <span className="small muted row" style={{ gap: 6 }}><Lock size={13} /> Only general areas are shown. Exact pickup is shared after a booking is confirmed.</span>
        </div>
      </div>
      {view === 'map' ? <MapView items={items} selectedId={sel} onSelect={setSel} loading={loading} emptyText="No pets are available for these filters." /> : loading ? (
        <div className="grid g4">{[1, 2, 3, 4].map((i) => <div className="skel" key={i} style={{ height: 300 }} />)}</div>
      ) : list.length === 0 ? <div className="card"><Empty icon={HeartHandshake} title="No pets available for these dates" text="Try different dates, a higher daily price, or another area." /></div> : (
        <div className="grid g4">
          {list.map((l) => (
            <div key={l.id} className="media-card">
              <Link to={`${detailBase}/${l.id}`} className="media"><Img src={l.img} alt={l.name} /></Link>
              <div className="body">
                <div className="row between"><Link to={`${detailBase}/${l.id}`} style={{ color: 'var(--ink)' }}><h3 style={{ fontSize: 16 }}>{l.name}</h3></Link><Stars value={l.rating} /></div>
                <div className="small muted">{l.species} · {l.breed}</div>
                <div className="small muted row" style={{ gap: 4 }}><MapPin size={13} /> {l.area} (approx.)</div>
                <div className="small muted row" style={{ gap: 4 }}><CalendarRange size={13} /> {fmtDate(l.availableFrom)} – {fmtDate(l.availableTo)}</div>
                {fmtKm(distanceTo(loc, l)) && <div className="tiny" style={{ color: 'var(--green)', fontWeight: 600 }}>~{fmtKm(distanceTo(loc, l))}</div>}
                <div className="row between" style={{ marginTop: 'auto' }}>
                  <span className="price">{money(l.daily)}<span className="small muted" style={{ fontWeight: 400 }}>/day</span></span>
                  <Link to={`${detailBase}/${l.id}?request=1`} className="btn btn-primary btn-sm">Request</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CostBreakdown({ daily, days, compact }) {
  const { db } = useApp();
  const rate = db.settings.commissionRate;
  const c = borrowCost(daily, days, rate);
  return (
    <div className="breakdown">
      <div className="line"><span>{money(daily)} × {days} day{days === 1 ? '' : 's'}</span><span className="num">{money(c.fee)}</span></div>
      <div className="line total"><span>Borrower pays</span><span className="num">{money(c.total)}</span></div>
      {!compact && <>
        <div className="line small muted"><span>Platform service commission ({rate}%{db.settings.commissionFinal ? '' : ' — example rate, not final'})</span><span className="num">− {money(c.commission)}</span></div>
        <div className="line small"><span>Owner receives</span><span className="num">{money(c.ownerNet)}</span></div>
      </>}
    </div>
  );
}

export function BorrowDetail({ base = '/user' }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { db, set, notify, toast } = useApp();
  const [gate, gateModal] = useAuthGate();
  const l = db.borrowListings.find((x) => x.id === id);
  const [f, setF] = useState({ start: '', end: '', message: '', carePlan: '', agree: false });
  const [err, setErr] = useState({});
  const [report, setReport] = useState(false);
  const formRef = React.useRef(null);
  useEffect(() => { if (params.get('request') && formRef.current) formRef.current.scrollIntoView({ behavior: 'smooth' }); }, [params]);
  if (!l) return <Empty title="Listing not found" />;
  const detailBase = base === '/borrow/browse' ? '/borrow/browse' : `${base}/borrow`;
  const mine = db.auth && l.owner === db.auth.name;
  const days = f.start && f.end ? daysBetween(f.start, f.end) : 0;
  const booked = db.borrowRequests.filter((r) => r.listingId === l.id && ['Confirmed', 'Active'].includes(r.status));

  const submit = (e) => {
    e.preventDefault();
    gate(() => {
      const er = {};
      if (!f.start) er.start = 'Choose a start date';
      if (!f.end) er.end = 'Choose an end date';
      if (f.start && f.end) {
        if (f.end <= f.start) er.end = 'End date must be after the start date';
        else if (days < l.minDays || days > l.maxDays) er.end = `This pet can be borrowed for ${l.minDays}–${l.maxDays} days`;
        else if (f.start < l.availableFrom || f.end > l.availableTo) er.end = `Available only between ${fmtDate(l.availableFrom)} and ${fmtDate(l.availableTo)}`;
        else if (findConflict(db.borrowRequests, l.id, f.start, f.end)) er.end = 'These dates overlap a confirmed booking. Choose other dates.';
      }
      if (f.carePlan.trim().length < 10) er.carePlan = 'Tell the owner how you’ll care for the pet';
      if (!f.agree) er.agree = 'Please accept the care rules';
      setErr(er);
      if (Object.keys(er).length) return;
      const reqId = newId('BR');
      set('borrowRequests', (r) => [{ id: reqId, listingId: l.id, borrower: db.auth.name, borrowerPhone: '+880 1712-345678', owner: l.owner, start: f.start, end: f.end, days, daily: l.daily, message: f.message, carePlan: f.carePlan, status: 'Pending Owner Approval', payment: 'Not started', refund: '—', payout: '—', created: day(0), direction: 'outgoing' }, ...r]);
      notify('borrow', `Request ${reqId} sent to ${l.owner} for ${l.name}. You’ll pay only after approval.`, `/borrow/bookings/${reqId}`);
      toast('Borrow request sent. No payment is taken until the owner approves.');
      nav(`/borrow/bookings/${reqId}`);
    }, 'request to borrow a pet');
  };

  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title={`${l.name} · ${l.breed}`} crumbs={[...crumbs(base, 'Pet Borrow', base === '/borrow/browse' ? '/borrow/browse' : `${base}/borrow`), { label: l.name }]} actions={mine && <Link to="/borrow/listed" className="btn btn-outline">Manage my listing</Link>} />
      <div className="split">
        <div className="stack lg">
          <div className="banner-img" style={{ aspectRatio: '16/8' }}><Img src={l.img} alt={l.name} /></div>
          <div className="card stack">
            <div className="row between"><div className="row"><Stars value={l.rating} count={l.borrows} /><span className="small muted">{l.borrows} completed stays</span></div><span className="price-lg">{money(l.daily)}<span className="small muted" style={{ fontWeight: 400 }}>/day</span></span></div>
            <dl className="kv">
              <dt>Species · age</dt><dd>{l.species} · {l.age}</dd>
              <dt>Temperament</dt><dd>{l.temperament}</dd>
              <dt>Care requirements</dt><dd>{l.care}</dd>
              <dt>Owner’s house rules</dt><dd>{l.rules}</dd>
              <dt>Permitted activities</dt><dd>{l.activities}</dd>
              <dt>Supplies provided</dt><dd>{l.supplies}</dd>
              <dt>Safety conditions</dt><dd>{l.safety}</dd>
              <dt>Duration</dt><dd>{l.minDays}–{l.maxDays} days · available {fmtDate(l.availableFrom)} – {fmtDate(l.availableTo)}</dd>
            </dl>
          </div>
          <div className="card stack sm">
            <h4>Pickup & return</h4>
            <div className="row small" style={{ gap: 8 }}><MapPin size={15} color="var(--green)" /> General area: <strong>{l.area}, Dhaka</strong></div>
            <div className="alert alert-info small"><Lock size={16} /> The exact pickup point is shared with you only after the owner approves and your payment succeeds. Return is to the {l.returnPlace.toLowerCase()} unless agreed otherwise in the booking.</div>
            <MapView side={false} height={240} items={[{ id: l.id, type: 'borrow', approx: true, name: l.name, lat: l.lat, lng: l.lng, area: l.area, img: l.img, lines: [`${l.area} — general area`] }]} />
          </div>
          <div className="card stack sm">
            <h4>Emergency guidance</h4>
            <p className="small">If {l.name} is unwell or injured, contact the owner right away through PetPaw messages and go to: <strong>{l.emergency}</strong>. Keep the owner’s emergency number from your confirmed booking.</p>
          </div>
          {booked.length > 0 && <div className="card stack sm"><h4>Already booked dates</h4>{booked.map((b) => <span key={b.id} className="small muted">{fmtDate(b.start)} – {fmtDate(b.end)}</span>)}</div>}
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--muted)' }} onClick={() => gate(() => setReport(true), 'report a listing')}><Flag size={14} /> Report this listing or an incorrect location</button>
        </div>
        <div className="stack" ref={formRef}>
          <div className="card stack">
            <div className="row"><Initials name={l.owner} /><div><strong>{l.owner}</strong><div className="tiny muted">Pet owner · phone verified</div></div></div>
            {mine ? <div className="alert alert-info small"><Info size={16} /> This is your listing. Manage requests in the Pet Borrow portal.</div> : (
              <form className="stack" onSubmit={submit} noValidate>
                <h3>Request to borrow</h3>
                <div className="form-grid">
                  <Field label="Start" required error={err.start} htmlFor="bd-s"><input id="bd-s" type="date" className={`input ${err.start ? 'invalid' : ''}`} min={l.availableFrom > today() ? l.availableFrom : today()} max={l.availableTo} value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></Field>
                  <Field label="Return" required htmlFor="bd-e"><input id="bd-e" type="date" className={`input ${err.end ? 'invalid' : ''}`} min={f.start || today()} max={l.availableTo} value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></Field>
                </div>
                {err.end && <span className="error-text">{err.end}</span>}
                <Field label="How will you care for the pet?" required error={err.carePlan} htmlFor="bd-c"><textarea id="bd-c" className={`textarea ${err.carePlan ? 'invalid' : ''}`} style={{ minHeight: 70 }} value={f.carePlan} onChange={(e) => setF({ ...f, carePlan: e.target.value })} placeholder="Home setup, walks, feeding, who else lives with you" /></Field>
                <Field label="Message to owner (optional)" htmlFor="bd-m"><input id="bd-m" className="input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
                {days > 0 && days >= l.minDays && days <= l.maxDays && <div className="card pad-sm" style={{ background: 'var(--bg)' }}><CostBreakdown daily={l.daily} days={days} compact /></div>}
                <label className="check small"><input type="checkbox" checked={f.agree} onChange={(e) => setF({ ...f, agree: e.target.checked })} /> I’ll follow the owner’s care rules and the <Link to="/policy/borrow" target="_blank">Pet Borrow Policy</Link>.</label>
                {err.agree && <span className="error-text">{err.agree}</span>}
                <button className="btn btn-primary btn-lg">Send borrow request</button>
                <p className="tiny muted">You won’t be charged now. If the owner approves, you’ll see the full cost breakdown and pay to confirm.</p>
              </form>
            )}
          </div>
        </div>
      </div>
      <ReportModal open={report} onClose={() => setReport(false)} category="Listing" target={`${l.id} · ${l.name} (Pet Borrow)`} />
    </div>
  );
}

/* ---------- Booking detail (owner & borrower) ---------- */
const FLOW = ['Pending Owner Approval', 'Approved — Payment Required', 'Confirmed', 'Active', 'Completed'];

export function useBorrowActions() {
  const { db, set, notify, toast, log } = useApp();
  const upd = (id, patch) => set('borrowRequests', (r) => r.map((x) => (x.id === id ? { ...x, ...(typeof patch === 'function' ? patch(x) : patch) } : x)));
  const approve = (r) => {
    const c = findConflict(db.borrowRequests, r.listingId, r.start, r.end, r.id);
    if (c) { toast(`Can’t approve: overlaps confirmed booking ${c.id}`, 'bad'); return false; }
    upd(r.id, { status: 'Approved — Payment Required', payment: 'Awaiting payment' });
    notify('borrow', `Request ${r.id} approved. ${r.borrower} must pay to confirm.`, `/borrow/bookings/${r.id}`);
    toast('Request approved. The borrower can now pay.');
    return true;
  };
  const reject = (r, reason) => { upd(r.id, { status: 'Rejected', rejectReason: reason }); toast('Request rejected. The borrower has been notified.', 'info'); };
  const pay = (r, method, fail) => {
    if (fail) { upd(r.id, { payment: 'Payment failed' }); toast('Payment failed. Your booking is not confirmed — try again.', 'bad'); return false; }
    const c = findConflict(db.borrowRequests, r.listingId, r.start, r.end, r.id);
    if (c) { toast('These dates were just booked by someone else. Payment was not taken.', 'bad'); return false; }
    const cost = borrowCost(r.daily, r.days, db.settings.commissionRate);
    upd(r.id, { status: 'Confirmed', payment: 'Paid', payout: 'Scheduled after return', commissionRate: db.settings.commissionRate, paidAt: day(0) });
    set('payments', (p) => [{ id: newId('PAY'), bookingId: r.id, date: day(0), amount: cost.total, method: `${method} (prototype)`, status: 'Paid', direction: r.borrower === db.auth?.name ? 'out' : 'in' }, ...p]);
    notify('borrow', `Booking ${r.id} confirmed after payment of ${money(cost.total)}.`, `/borrow/bookings/${r.id}`);
    toast('Payment successful. Booking confirmed!');
    return true;
  };
  const handover = (r, note) => { upd(r.id, { status: 'Active', handoverAt: day(0), handoverNote: note }); toast('Handover recorded. Borrowing is now active.'); };
  const giveBack = (r, note) => { upd(r.id, { status: 'Completed', returnAt: day(0), returnNote: note, payout: 'Payout processing' }); toast('Return recorded. Booking completed.'); };
  const cancel = (r) => {
    const hoursBefore = (new Date(`${r.start}T10:00:00`) - new Date()) / 36e5;
    const paid = r.payment === 'Paid';
    const refund = !paid ? '—' : hoursBefore >= 48 ? 'Full refund processing' : '50% refund processing';
    upd(r.id, { status: 'Cancelled', refund, payout: paid && hoursBefore < 48 ? '50% payout to owner' : '—' });
    toast(paid ? `Booking cancelled. ${refund}.` : 'Request cancelled.', 'info');
  };
  const dispute = (r, reason) => {
    upd(r.id, { status: 'Disputed', disputeReason: reason, prevStatus: r.status, refund: r.payment === 'Paid' ? 'On hold — under review' : '—', payout: 'On hold' });
    set('reports', (rp) => [{ id: newId('RP'), category: 'Pet Borrow', target: `${r.id} · dispute`, by: db.auth.name, date: day(0), status: 'Open', priority: 'High', detail: reason, notes: [], outcome: '' }, ...rp]);
    notify('admin', `Dispute opened on booking ${r.id}.`, '/admin/borrow');
    log(`Dispute opened on ${r.id}`);
    toast('Dispute submitted. Payments are on hold while our team reviews it.', 'info');
  };
  return { approve, reject, pay, handover, giveBack, cancel, dispute, upd };
}

export function PayModal({ req, onClose }) {
  const { db } = useApp();
  const { pay } = useBorrowActions();
  const [method, setMethod] = useState('bKash');
  const [fail, setFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const go = () => { setLoading(true); setTimeout(() => { setLoading(false); if (pay(req, method, fail)) onClose(); }, 900); };
  return (
    <Modal open onClose={onClose} title={`Pay to confirm ${req.id}`} footer={<><button className="btn btn-outline" onClick={onClose}>Not now</button><button className="btn btn-primary" onClick={go} disabled={loading}>{loading ? <><span className="spinner" /> Processing…</> : `Pay ${money(req.daily * req.days)}`}</button></>}>
      <div className="stack">
        <div className="card pad-sm" style={{ background: 'var(--bg)' }}><CostBreakdown daily={req.daily} days={req.days} /></div>
        <p className="small muted">The owner approved {fmtDate(req.start)} – {fmtDate(req.end)}. Your booking is confirmed only after this payment succeeds.</p>
        <div className="choice-grid">{['bKash', 'Nagad', 'Card'].map((m) => <button type="button" key={m} className={`choice ${method === m ? 'on' : ''}`} onClick={() => setMethod(m)}><Wallet size={18} /><strong>{m}</strong></button>)}</div>
        <label className="check small"><input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> Prototype: simulate a failed payment</label>
        <PrototypeNote>No real payment gateway is connected</PrototypeNote>
        {req.payment === 'Payment failed' && <div className="alert alert-bad small"><AlertTriangle size={16} /> Your last payment attempt failed. The booking is still unconfirmed.</div>}
      </div>
    </Modal>
  );
}

export function BookingDetail() {
  const { id } = useParams();
  const { db, set, toast } = useApp();
  const A = useBorrowActions();
  const [payOpen, setPayOpen] = useState(false);
  const [report, setReport] = useState(false);
  const [checks, setChecks] = useState({});
  const [note, setNote] = useState('');
  const [review, setReview] = useState({ open: false, rating: 5, text: '' });
  const { confirm } = useApp();
  const r = db.borrowRequests.find((x) => x.id === id);
  if (!r) return <Empty title="Booking not found" action={<Link to="/borrow/dashboard" className="btn btn-primary">Pet Borrow dashboard</Link>} />;
  const l = db.borrowListings.find((x) => x.id === r.listingId);
  const me = db.auth.name;
  const isOwner = r.owner === me;
  const isBorrower = r.borrower === me;
  const cost = borrowCost(r.daily, r.days, r.commissionRate ?? db.settings.commissionRate);
  const revealed = ['Confirmed', 'Active', 'Completed'].includes(r.status) || (r.status === 'Disputed' && r.payment === 'Paid');
  const overdue = r.status === 'Active' && r.end < today();
  const idx = FLOW.indexOf(r.status);
  const failed = ['Rejected', 'Cancelled', 'Disputed'].includes(r.status);
  const steps = [
    { title: 'Request sent', text: `${fmtDate(r.created)} by ${r.borrower}` },
    { title: r.status === 'Rejected' ? 'Owner declined' : 'Owner approval', text: r.status === 'Rejected' ? r.rejectReason || 'Request declined' : `${r.owner} reviews the request` },
    { title: 'Payment', text: r.payment === 'Payment failed' ? 'Last attempt failed — retry to confirm' : r.payment },
    { title: 'Confirmed', text: 'Exact pickup point shared' },
    { title: 'Handover', text: r.handoverAt ? `${fmtDate(r.handoverAt)} · ${r.handoverNote || ''}` : 'Both confirm the pet’s condition' },
    { title: 'Returned & completed', text: r.returnAt ? `${fmtDate(r.returnAt)} · ${r.returnNote || ''}` : `Due ${fmtDate(r.end)}` },
  ].map((s, i) => {
    const pos = r.status === 'Completed' ? 6 : r.status === 'Active' ? 5 : r.status === 'Confirmed' ? 4 : r.status === 'Approved — Payment Required' ? 2 : r.status === 'Pending Owner Approval' ? 1 : -1;
    if (r.status === 'Rejected') return { ...s, state: i === 0 ? 'done' : i === 1 ? 'fail' : '' };
    if (failed && pos === -1) return { ...s, state: i === 0 ? 'done' : '' };
    return { ...s, state: i < pos ? 'done' : i === pos ? (i === 2 && r.payment === 'Payment failed' ? 'fail' : 'now') : '' };
  });
  const allChecked = ['health', 'supplies', 'care', 'contact'].every((k) => checks[k]);
  const simulateOwner = (ok) => {
    if (ok) A.approve(r); else A.reject(r, 'Owner unavailable on these dates');
  };

  return (
    <div className="stack lg">
      <PageHeader title={`Booking ${r.id}`} crumbs={[{ label: 'Pet Borrow', to: '/borrow/dashboard' }, { label: isOwner ? 'Incoming Requests' : 'My Borrow Requests', to: isOwner ? '/borrow/incoming' : '/borrow/requests' }, { label: r.id }]} actions={<>{overdue ? <Chip status="Overdue">Return overdue</Chip> : <Chip status={r.status} />}</>} />
      {r.status === 'Disputed' && <div className="alert alert-bad"><AlertTriangle size={18} /> <span><strong>Disputed:</strong> {r.disputeReason}. Payments are on hold while PetPaw reviews it.</span></div>}
      {overdue && <div className="alert alert-warn"><AlertTriangle size={18} /> {l?.name} was due back on {fmtDate(r.end)}. {isBorrower ? 'Please return the pet or message the owner now.' : 'Message the borrower, and report a missed return if you can’t reach them.'}</div>}
      <div className="split">
        <div className="stack lg">
          <div className="card row" style={{ flexWrap: 'nowrap' }}>
            <div style={{ width: 96, height: 96, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}><Img src={l?.img} alt={l?.name} /></div>
            <div className="stack sm" style={{ minWidth: 0 }}>
              <h3>{l?.name} · {l?.breed}</h3>
              <div className="small muted">{fmtDate(r.start)} → {fmtDate(r.end)} · {r.days} day{r.days === 1 ? '' : 's'}</div>
              <div className="small">You are the <strong>{isOwner ? 'owner' : 'borrower'}</strong> · {isOwner ? `Borrower: ${r.borrower}` : `Owner: ${r.owner}`}</div>
            </div>
          </div>

          {/* Action area */}
          {isOwner && r.status === 'Pending Owner Approval' && (
            <div className="card stack">
              <h3>Review this request</h3>
              <dl className="kv"><dt>Borrower</dt><dd>{r.borrower} · phone verified</dd><dt>Message</dt><dd>{r.message || '—'}</dd><dt>Care plan</dt><dd>{r.carePlan}</dd></dl>
              <div className="row">
                <button className="btn btn-primary" onClick={() => A.approve(r)}><CheckCircle2 size={16} /> Approve</button>
                <button className="btn btn-danger-outline" onClick={() => confirm({ title: 'Reject this request?', body: `${r.borrower} will be told the request was declined.`, requireReason: true, reasonLabel: 'Reason (shared with the borrower)', confirmLabel: 'Reject', danger: true, warning: 'The borrower can send a new request for other dates.', onConfirm: (reason) => A.reject(r, reason) })}>Reject</button>
              </div>
              <p className="tiny muted">Approving doesn’t confirm the booking. It is confirmed only after the borrower pays.</p>
            </div>
          )}
          {isBorrower && r.status === 'Pending Owner Approval' && (
            <div className="card stack sm">
              <h3>Waiting for {r.owner}</h3>
              <p className="small muted">You’ll be notified when the owner responds. No payment is taken until they approve.</p>
              <div className="row">
                <span className="tiny muted">Prototype:</span>
                <button className="btn btn-outline btn-sm" onClick={() => simulateOwner(true)}>Simulate owner approval</button>
                <button className="btn btn-ghost btn-sm" onClick={() => simulateOwner(false)}>Simulate rejection</button>
              </div>
            </div>
          )}
          {isBorrower && r.status === 'Approved — Payment Required' && (
            <div className="card stack" style={{ borderColor: 'var(--orange)' }}>
              <h3>Approved — payment required</h3>
              <p className="small">{r.owner} approved your dates. Pay now to confirm the booking. {r.payment === 'Payment failed' && <strong style={{ color: 'var(--bad)' }}>Your last attempt failed.</strong>}</p>
              <button className="btn btn-secondary btn-lg" style={{ alignSelf: 'flex-start' }} onClick={() => setPayOpen(true)}>{r.payment === 'Payment failed' ? 'Retry payment' : 'Review & pay'} · {money(cost.total)}</button>
            </div>
          )}
          {isOwner && r.status === 'Approved — Payment Required' && <div className="card"><p className="small">Waiting for {r.borrower} to pay. The dates are not blocked until payment succeeds.</p></div>}

          {r.status === 'Confirmed' && (
            <div className="card stack">
              <h3>Handover checklist</h3>
              <p className="small muted">Go through this together at pickup. Either party can record the handover.</p>
              {[['health', `${l?.name} looks healthy (eyes, coat, appetite, no injuries)`], ['supplies', `Supplies handed over: ${l?.supplies}`], ['care', 'Care instructions and house rules reviewed'], ['contact', 'Emergency contact saved by the borrower']].map(([k, t]) => (
                <label key={k} className="check"><input type="checkbox" checked={!!checks[k]} onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} /> {t}</label>
              ))}
              <Field label="Pet condition notes" htmlFor="ho-note"><textarea id="ho-note" className="textarea" style={{ minHeight: 60 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Small scratch on left ear (existing)" /></Field>
              <button className="btn btn-primary" disabled={!allChecked} onClick={() => { A.handover(r, note || 'Healthy, all items handed over.'); setNote(''); setChecks({}); }}>Confirm handover</button>
            </div>
          )}
          {r.status === 'Active' && (
            <div className="card stack">
              <h3>Return {l?.name}</h3>
              <p className="small muted">Return due {fmtDate(r.end)} at the agreed return location. Record the pet’s condition on return.</p>
              <Field label="Condition on return" htmlFor="rt-note"><textarea id="rt-note" className="textarea" style={{ minHeight: 60 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Healthy, ate well, all supplies returned" /></Field>
              <button className="btn btn-primary" onClick={() => { A.giveBack(r, note || 'Returned in good condition.'); setNote(''); }}>Confirm return</button>
            </div>
          )}
          {r.status === 'Completed' && !r.reviewed && (
            <div className="card row between">
              <div><h3>How did it go?</h3><p className="small muted">Leave a review for {isOwner ? r.borrower : `${l?.name} and ${r.owner}`}.</p></div>
              <button className="btn btn-primary" onClick={() => setReview({ ...review, open: true })}><Star size={16} /> Write a review</button>
            </div>
          )}

          <div className="card"><h3 style={{ marginBottom: 14 }}>Status</h3><Timeline steps={steps} /></div>

          <div className="card stack sm">
            <h3>Care instructions</h3>
            <dl className="kv">
              <dt>Care</dt><dd>{l?.care}</dd>
              <dt>House rules</dt><dd>{l?.rules}</dd>
              <dt>Required supplies</dt><dd>{l?.supplies}</dd>
              <dt>Safety</dt><dd>{l?.safety}</dd>
              <dt>Emergency</dt><dd>{l?.emergency}{revealed && <> · Owner: {isOwner ? 'you' : '+880 17XX-XXX321 (shown to confirmed borrower)'}</>}</dd>
            </dl>
            <div className="alert alert-ok small"><ShieldCheck size={16} /> Animal welfare: never leave the pet alone longer than the owner allows, keep it on a leash outdoors, and contact a vet immediately if it seems unwell.</div>
          </div>
        </div>

        <div className="stack">
          <div className="card stack">
            <h3>Payment</h3>
            <div className="breakdown">
              <div className="line"><span>{money(r.daily)} × {r.days} days</span><span className="num">{money(cost.fee)}</span></div>
              <div className="line"><span>Borrower total</span><span className="num"><strong>{money(cost.total)}</strong></span></div>
              <div className="line small muted"><span>Service commission ({r.commissionRate ?? db.settings.commissionRate}%{db.settings.commissionFinal ? '' : ', example rate'})</span><span className="num">{money(cost.commission)}</span></div>
              <div className="line small"><span>Owner net earnings</span><span className="num">{money(cost.ownerNet)}</span></div>
            </div>
            <dl className="kv" style={{ gridTemplateColumns: '110px 1fr' }}>
              <dt>Payment</dt><dd><Chip status={r.payment === 'Not started' ? 'Not started' : r.payment}>{r.payment}</Chip></dd>
              <dt>Refund</dt><dd>{r.refund}</dd>
              <dt>Owner payout</dt><dd>{r.payout}</dd>
            </dl>
          </div>
          <div className="card stack sm">
            <h3>Pickup & return</h3>
            {revealed ? (
              <>
                <div className="small row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}><MapPin size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: 3 }} /><span><strong>Pickup:</strong> {l?.exactPickup}</span></div>
                <div className="small row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}><MapPin size={15} color="var(--orange-700)" style={{ flexShrink: 0, marginTop: 3 }} /><span><strong>Return:</strong> {l?.returnPlace === 'Same as pickup' ? l?.exactPickup : l?.returnPlace}</span></div>
                <span className="tiny muted">Visible only to you and the {isOwner ? 'borrower' : 'owner'}.</span>
              </>
            ) : (
              <div className="small row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}><Lock size={15} style={{ flexShrink: 0, marginTop: 3 }} /><span>General area: <strong>{l?.area}</strong>. The exact pickup point appears here after approval and successful payment.</span></div>
            )}
          </div>
          <div className="card stack sm">
            <Link to="/borrow/messages" className="btn btn-outline btn-block"><MessageSquare size={16} /> Message {isOwner ? r.borrower : r.owner}</Link>
            {['Pending Owner Approval', 'Approved — Payment Required', 'Confirmed'].includes(r.status) && (
              <button className="btn btn-ghost btn-block" onClick={() => confirm({ title: 'Cancel this booking?', body: <div className="stack sm small"><p><strong>Cancellation terms</strong></p><ul style={{ margin: 0, paddingLeft: 18 }}><li>Before payment: free.</li><li>48+ hours before start: full refund.</li><li>Less than 48 hours: 50% refund; 50% goes to the owner.</li></ul></div>, confirmLabel: 'Cancel booking', danger: true, warning: 'The other party will be notified.', onConfirm: () => A.cancel(r) })}>Cancel booking</button>
            )}
            {['Confirmed', 'Active', 'Completed'].includes(r.status) && (
              <button className="btn btn-danger-outline btn-block" onClick={() => confirm({ title: 'Open a dispute', body: 'Describe the problem. Payments and payouts are put on hold and a PetPaw admin will contact both parties.', requireReason: true, reasonLabel: 'What went wrong?', confirmLabel: 'Submit dispute', danger: true, warning: 'Use this for payment problems, missed returns, or safety concerns.', onConfirm: (reason) => A.dispute(r, reason) })}>Open dispute</button>
            )}
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--muted)' }} onClick={() => setReport(true)}><Flag size={14} /> Report mistreatment or unsafe arrangement</button>
          </div>
        </div>
      </div>
      {payOpen && <PayModal req={r} onClose={() => setPayOpen(false)} />}
      <ReportModal open={report} onClose={() => setReport(false)} category="Pet Borrow" target={`${r.id} · ${l?.name}`} />
      <Modal open={review.open} onClose={() => setReview({ ...review, open: false })} title="Write a review" footer={<><button className="btn btn-outline" onClick={() => setReview({ ...review, open: false })}>Cancel</button><button className="btn btn-primary" disabled={review.text.trim().length < 5} onClick={() => {
        set('reviews', (rv) => [{ id: newId('RV'), target: isOwner ? r.borrower : `${l.name} (Pet Borrow)`, targetType: 'borrow', targetId: l.id, by: me, rating: review.rating, text: review.text.trim(), date: day(0), status: 'Visible' }, ...rv]);
        A.upd(r.id, { reviewed: true });
        setReview({ open: false, rating: 5, text: '' });
        toast('Thanks for your review!');
      }}>Submit review</button></>}>
        <div className="stack"><StarInput value={review.rating} onChange={(v) => setReview({ ...review, rating: v })} /><textarea className="textarea" value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} placeholder="What went well? Anything others should know?" aria-label="Review" /></div>
      </Modal>
    </div>
  );
}
