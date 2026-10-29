import React, { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, AlertTriangle, CalendarRange, CheckCircle2, CreditCard, Edit3, Eye, Flag, HeartHandshake, Inbox, Lock, MapPin,
  PauseCircle, PawPrint, PlayCircle, Plus, RotateCcw, Send, Star, Trash2, Upload, Wallet, XCircle,
} from 'lucide-react';
import PortalLayout from '../components/PortalLayout.jsx';
import MapView from '../components/MapView.jsx';
import { Chip, Empty, Field, Img, Modal, PageHeader, StatCard, Stars, Table, Tabs } from '../components/ui.jsx';
import { borrowCost, fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { AREAS, IMG } from '../data/mock.js';
import { BookingDetail, BorrowBrowser, BorrowDetail, CostBreakdown, PayModal, useBorrowActions } from '../features/community.jsx';
import { ReportModal } from '../features/common.jsx';
import { MessagesPage, NotificationsPage, SettingsPage } from './shared.jsx';

const crumbs = (label) => [{ label: 'Pet Borrow', to: '/borrow/dashboard' }, { label }];
const useMe = () => useApp().db.auth?.name;
const petName = (db, r) => db.borrowListings.find((l) => l.id === r.listingId)?.name;

function Dashboard() {
  const { db } = useApp();
  const me = useMe();
  const listed = db.borrowListings.filter((l) => l.owner === me);
  const incoming = db.borrowRequests.filter((r) => r.owner === me);
  const outgoing = db.borrowRequests.filter((r) => r.borrower === me);
  const earnings = incoming.filter((r) => ['Completed', 'Active', 'Confirmed'].includes(r.status)).reduce((s, r) => s + borrowCost(r.daily, r.days, r.commissionRate ?? db.settings.commissionRate).ownerNet, 0);
  const due = outgoing.filter((r) => r.status === 'Approved — Payment Required');
  const actives = [...incoming, ...outgoing].filter((r) => ['Active', 'Confirmed'].includes(r.status));
  return (
    <div className="stack lg">
      <PageHeader title="Pet Borrow" sub="List your pets for short paid stays, or borrow someone else’s. Owners approve first, then borrowers pay to confirm." actions={<><Link to="/borrow/browse" className="btn btn-outline">Browse pets</Link><Link to="/borrow/list" className="btn btn-primary"><Plus size={16} /> List a pet</Link></>} />
      {due.length > 0 && <div className="alert alert-warn"><CreditCard size={18} /> <span>{due.length} approved request{due.length > 1 ? 's' : ''} waiting for your payment. <Link to={`/borrow/bookings/${due[0].id}`}>Pay now</Link> to confirm before someone else books those dates.</span></div>}
      <div className="grid g4">
        <StatCard icon={PawPrint} label="Listed pets" value={listed.length} to="/borrow/listed" />
        <StatCard icon={Inbox} label="Pending incoming requests" value={incoming.filter((r) => r.status === 'Pending Owner Approval').length} tone="orange" to="/borrow/incoming" />
        <StatCard icon={Send} label="My outgoing requests" value={outgoing.filter((r) => !['Completed', 'Cancelled', 'Rejected'].includes(r.status)).length} tone="blue" to="/borrow/requests" />
        <StatCard icon={Wallet} label="Owner earnings (net)" value={money(earnings)} tone="teal" to="/borrow/earnings" />
      </div>
      <div className="split">
        <div className="card">
          <div className="card-title"><h3>Upcoming & active bookings</h3><Link to="/borrow/active" className="small">All</Link></div>
          <Table rows={actives} pageSize={5} onRow={null} empty={<Empty icon={HeartHandshake} title="No upcoming bookings" />} columns={[
            { label: 'Booking', render: (r) => <Link to={`/borrow/bookings/${r.id}`}><strong>{r.id}</strong></Link> }, { label: 'Pet', render: (r) => petName(db, r) },
            { label: 'Role', render: (r) => (r.owner === me ? 'Owner' : 'Borrower') }, { label: 'Dates', render: (r) => <span className="small">{fmtDate(r.start)} – {fmtDate(r.end)}</span> }, { label: 'Status', render: (r) => <Chip status={r.status} /> },
          ]} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Payment status</h3><Link to="/borrow/payments" className="small">History</Link></div>
          <div className="stack sm">{db.payments.slice(0, 4).map((p) => <div key={p.id} className="row between small"><span>{p.id} · {p.bookingId}<br /><span className="tiny muted">{fmtDate(p.date)} · {p.direction === 'in' ? 'Received' : 'Paid'}</span></span><span className="num"><strong>{money(p.amount)}</strong></span></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function MyListed() {
  const { db, set, toast, confirm } = useApp();
  const me = useMe();
  const nav = useNavigate();
  const list = db.borrowListings.filter((l) => l.owner === me);
  const blocking = (l) => db.borrowRequests.filter((r) => r.listingId === l.id && ['Confirmed', 'Active'].includes(r.status));
  const upd = (l, patch, msg) => { set('borrowListings', (ls) => ls.map((x) => (x.id === l.id ? { ...x, ...patch } : x))); toast(msg); };
  return (
    <div className="stack lg">
      <PageHeader title="My Listed Pets" crumbs={crumbs('My Listed Pets')} actions={<Link to="/borrow/list" className="btn btn-primary"><Plus size={16} /> List a pet</Link>} />
      {list.length === 0 ? <div className="card"><Empty icon={PawPrint} title="You haven’t listed any pets" action={<Link className="btn btn-primary" to="/borrow/list">List a pet</Link>} /></div> : list.map((l) => {
        const b = blocking(l);
        return (
          <div key={l.id} className="card row" style={{ alignItems: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}><Img src={l.img} alt={l.name} /></div>
            <div className="grow stack sm" style={{ minWidth: 200 }}>
              <div className="row"><strong>{l.name}</strong><Chip status={l.status} /><Stars value={l.rating} count={l.borrows} /></div>
              <div className="small muted">{l.breed} · {money(l.daily)}/day · {l.minDays}–{l.maxDays} days · {l.area}</div>
              <div className="small muted row" style={{ gap: 4 }}><CalendarRange size={13} /> {fmtDate(l.availableFrom)} – {fmtDate(l.availableTo)}</div>
              {b.length > 0 && <div className="tiny" style={{ color: 'var(--warn)' }}>{b.length} confirmed/active booking(s): {b.map((x) => x.id).join(', ')}</div>}
            </div>
            <div className="row" style={{ gap: 6 }}>
              <Link to={`/borrow/browse/${l.id}`} className="btn btn-ghost btn-sm"><Eye size={14} /> View</Link>
              <button className="btn btn-outline btn-sm" onClick={() => nav(`/borrow/list?edit=${l.id}`)}><Edit3 size={14} /> Edit</button>
              {l.status === 'Active' && <button className="btn btn-outline btn-sm" onClick={() => upd(l, { status: 'Paused' }, 'Listing paused. Existing bookings stay confirmed.')}><PauseCircle size={14} /> Pause</button>}
              {l.status === 'Paused' && <button className="btn btn-outline btn-sm" onClick={() => upd(l, { status: 'Active' }, 'Listing is live again')}><PlayCircle size={14} /> Resume</button>}
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} disabled={b.length > 0} title={b.length ? 'Can’t remove while there are confirmed or active bookings' : ''} onClick={() => confirm({ title: `Remove ${l.name}’s listing?`, body: 'Pending requests will be declined automatically.', danger: true, confirmLabel: 'Remove listing', onConfirm: () => { set('borrowListings', (ls) => ls.filter((x) => x.id !== l.id)); set('borrowRequests', (rs) => rs.map((r) => (r.listingId === l.id && ['Pending Owner Approval', 'Approved — Payment Required'].includes(r.status) ? { ...r, status: 'Rejected', rejectReason: 'Listing removed by owner' } : r))); toast('Listing removed', 'info'); } })}><Trash2 size={14} /></button>
            </div>
          </div>
        );
      })}
      <p className="tiny muted">Listings with confirmed or active bookings can be paused or edited, but not removed until those bookings finish.</p>
    </div>
  );
}

function ListPet() {
  const { db, set, toast } = useApp();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const editing = db.borrowListings.find((l) => l.id === params.get('edit'));
  const base = editing || { petId: '', name: '', species: 'Dog', breed: '', age: '', temperament: '', care: '', rules: '', activities: '', supplies: '', safety: '', emergency: '', daily: 500, minDays: 1, maxDays: 5, availableFrom: today(), availableTo: '', area: 'Dhanmondi', lat: null, lng: null, exactPickup: '', returnPlace: 'Same as pickup', vacc: '', photo: '' };
  const [f, setF] = useState(base);
  const [err, setErr] = useState({});
  const [preview, setPreview] = useState(false);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (id) => {
    const p = db.pets.find((x) => x.id === id);
    if (!p) return setF({ ...f, petId: '' });
    const age = p.dob ? `${Math.max(1, new Date().getFullYear() - new Date(p.dob).getFullYear())} years` : '';
    setF({ ...f, petId: id, name: p.name, species: p.species, breed: p.breed, age, care: f.care || p.notes, img: p.img, vacc: p.vaccinations.map((v) => v.name).join(', ') });
  };
  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Enter the pet’s name';
    if (!f.breed.trim()) e.breed = 'Enter breed';
    if (!(Number(f.daily) > 0)) e.daily = 'Set a daily price in Taka';
    if (Number(f.minDays) < 1 || Number(f.maxDays) < Number(f.minDays)) e.days = 'Maximum days must be at least the minimum';
    if (!f.availableTo || f.availableTo <= f.availableFrom) e.avail = 'Choose an end date after the start date';
    if (f.temperament.trim().length < 5) e.temperament = 'Describe the pet’s temperament';
    if (f.care.trim().length < 10) e.care = 'Add feeding and care requirements';
    if (!f.lat) e.loc = 'Click the map to set an approximate pickup area';
    if (f.exactPickup.trim().length < 8) e.exact = 'Enter the exact pickup point (kept private until booking is confirmed)';
    if (f.emergency.trim().length < 5) e.emergency = 'Add an emergency vet or contact';
    if (!editing && !f.photo && !f.petId) e.photo = 'Upload at least one photo';
    setErr(e);
    return !Object.keys(e).length;
  };
  const publish = () => {
    const rec = { ...f, daily: Number(f.daily), minDays: Number(f.minDays), maxDays: Number(f.maxDays) };
    if (editing) set('borrowListings', (ls) => ls.map((x) => (x.id === editing.id ? rec : x)));
    else set('borrowListings', (ls) => [{ ...rec, id: newId('BL'), owner: db.auth.name, mine: true, img: f.img || ({ Dog: IMG.dog5, Cat: IMG.cat2, Bird: IMG.bird }[f.species] || IMG.dog5), status: 'Active', rating: 0, borrows: 0 }, ...ls]);
    toast(editing ? 'Listing updated' : `${f.name} is now listed for borrowing`);
    nav('/borrow/listed');
  };
  return (
    <div className="stack lg">
      <PageHeader title={editing ? `Edit listing — ${editing.name}` : 'List a Pet'} crumbs={crumbs(editing ? 'Edit listing' : 'List a Pet')} sub="Paid temporary stays only. To sell, give away or rehome, post in the Pet Marketplace instead." />
      <form className="split" noValidate onSubmit={(e) => { e.preventDefault(); if (validate()) setPreview(true); }}>
        <div className="stack lg">
          <div className="card stack">
            <h3>Pet details</h3>
            {!editing && db.pets.length > 0 && (
              <Field label="Start from one of my registered pets" htmlFor="lp-pet"><select id="lp-pet" className="select" value={f.petId} onChange={(e) => pick(e.target.value)}><option value="">Enter details manually</option>{db.pets.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.species} · {p.breed}</option>)}</select></Field>
            )}
            {f.photo ? <div className="doc-thumb"><Upload size={15} /> {f.photo}</div> : <label className="upload"><input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && setF({ ...f, photo: e.target.files[0].name })} /><Upload size={18} style={{ margin: '0 auto 4px' }} /> Upload pet photos {f.petId && '(optional — profile photo used)'}</label>}
            {err.photo && <span className="error-text">{err.photo}</span>}
            <div className="form-grid">
              <Field label="Name" required error={err.name} htmlFor="lp-n"><input id="lp-n" className="input" value={f.name} onChange={up('name')} /></Field>
              <Field label="Species" htmlFor="lp-s"><select id="lp-s" className="select" value={f.species} onChange={up('species')}>{['Dog', 'Cat', 'Bird', 'Rabbit'].map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Breed" required error={err.breed} htmlFor="lp-b"><input id="lp-b" className="input" value={f.breed} onChange={up('breed')} /></Field>
              <Field label="Age" htmlFor="lp-a"><input id="lp-a" className="input" value={f.age} onChange={up('age')} /></Field>
              <Field label="Temperament" required error={err.temperament} full htmlFor="lp-t"><input id="lp-t" className="input" value={f.temperament} onChange={up('temperament')} placeholder="e.g. Gentle, good with kids, shy with cats" /></Field>
              <Field label="Care requirements" required error={err.care} full htmlFor="lp-c"><textarea id="lp-c" className="textarea" value={f.care} onChange={up('care')} placeholder="Food amounts and times, walks, medication" /></Field>
              <Field label="Vaccination / health" full htmlFor="lp-v"><input id="lp-v" className="input" value={f.vacc} onChange={up('vacc')} /></Field>
            </div>
          </div>
          <div className="card stack">
            <h3>Rules & safety</h3>
            <div className="form-grid">
              <Field label="House rules" full htmlFor="lp-r"><textarea id="lp-r" className="textarea" style={{ minHeight: 60 }} value={f.rules} onChange={up('rules')} /></Field>
              <Field label="Permitted activities" htmlFor="lp-ac"><input id="lp-ac" className="input" value={f.activities} onChange={up('activities')} /></Field>
              <Field label="Supplies you provide" htmlFor="lp-su"><input id="lp-su" className="input" value={f.supplies} onChange={up('supplies')} /></Field>
              <Field label="Safety conditions" full htmlFor="lp-sa"><input id="lp-sa" className="input" value={f.safety} onChange={up('safety')} placeholder="e.g. Never off-leash near roads" /></Field>
              <Field label="Emergency contact & special instructions" required error={err.emergency} full htmlFor="lp-e"><input id="lp-e" className="input" value={f.emergency} onChange={up('emergency')} placeholder="Preferred vet hospital and what to do" /></Field>
            </div>
          </div>
          <div className="card stack">
            <h3>Pickup & return</h3>
            <div className="alert alert-info small"><Lock size={16} /> Borrowers only see the general area before booking. The exact pickup point is shown after you approve and they pay. Never use your home address unless you’re comfortable sharing it.</div>
            <div className="form-grid">
              <Field label="General area (public)" htmlFor="lp-ar"><select id="lp-ar" className="select" value={f.area} onChange={(e) => { const a = AREAS.find((x) => x.name === e.target.value); setF({ ...f, area: e.target.value, lat: a.lat, lng: a.lng }); }}>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
              <Field label="Return location" htmlFor="lp-rt"><input id="lp-rt" className="input" value={f.returnPlace} onChange={up('returnPlace')} /></Field>
              <Field label="Exact pickup / meeting point (private)" required error={err.exact} full htmlFor="lp-x"><input id="lp-x" className="input" value={f.exactPickup} onChange={up('exactPickup')} placeholder="e.g. Dhanmondi Lake gate, Road 8 side" /></Field>
            </div>
            <span className="small muted">Click the map to set the approximate pickup area.</span>
            <MapView picker value={f} onPick={(p) => setF({ ...f, ...p })} height={280} />
            {err.loc && <span className="error-text">{err.loc}</span>}
          </div>
        </div>
        <div className="stack lg">
          <div className="card stack">
            <h3>Price & availability</h3>
            <Field label="Daily price (৳)" required error={err.daily} htmlFor="lp-d"><input id="lp-d" type="number" min="0" className="input" value={f.daily} onChange={up('daily')} /></Field>
            <div className="form-grid">
              <Field label="Min days" htmlFor="lp-mi"><input id="lp-mi" type="number" min="1" className="input" value={f.minDays} onChange={up('minDays')} /></Field>
              <Field label="Max days" htmlFor="lp-ma"><input id="lp-ma" type="number" min="1" className="input" value={f.maxDays} onChange={up('maxDays')} /></Field>
            </div>
            {err.days && <span className="error-text">{err.days}</span>}
            <div className="form-grid">
              <Field label="Available from" htmlFor="lp-af"><input id="lp-af" type="date" className="input" value={f.availableFrom} onChange={up('availableFrom')} /></Field>
              <Field label="Available until" htmlFor="lp-at"><input id="lp-at" type="date" className="input" min={f.availableFrom} value={f.availableTo} onChange={up('availableTo')} /></Field>
            </div>
            {err.avail && <span className="error-text">{err.avail}</span>}
            <div className="card pad-sm" style={{ background: 'var(--bg)' }}>
              <div className="small muted" style={{ marginBottom: 6 }}>Example for a 2-day stay</div>
              <CostBreakdown daily={Number(f.daily) || 0} days={2} />
            </div>
          </div>
          <button className="btn btn-primary btn-lg">Preview listing</button>
        </div>
      </form>
      <Modal open={preview} wide onClose={() => setPreview(false)} title="Preview listing" footer={<><button className="btn btn-outline" onClick={() => setPreview(false)}>Keep editing</button><button className="btn btn-primary" onClick={publish}>{editing ? 'Save changes' : 'Publish listing'}</button></>}>
        <div className="split">
          <div className="stack sm">
            <div className="banner-img" style={{ aspectRatio: '4/3' }}><Img src={f.img || IMG.dog5} alt={f.name} /></div>
            <div className="row between"><strong style={{ fontSize: 18 }}>{f.name}</strong><span className="price-lg">{money(f.daily)}/day</span></div>
            <div className="small muted">{f.species} · {f.breed} · {f.age} · <MapPin size={12} /> {f.area} (approx.)</div>
          </div>
          <dl className="kv"><dt>Temperament</dt><dd>{f.temperament}</dd><dt>Care</dt><dd>{f.care}</dd><dt>Rules</dt><dd>{f.rules || '—'}</dd><dt>Duration</dt><dd>{f.minDays}–{f.maxDays} days</dd><dt>Available</dt><dd>{fmtDate(f.availableFrom)} – {fmtDate(f.availableTo)}</dd><dt>Emergency</dt><dd>{f.emergency}</dd><dt>Exact pickup</dt><dd><Lock size={12} /> Hidden until confirmed</dd></dl>
        </div>
      </Modal>
    </div>
  );
}

function RequestsTable({ incoming }) {
  const { db, confirm } = useApp();
  const me = useMe();
  const nav = useNavigate();
  const A = useBorrowActions();
  const [tab, setTab] = useState('Open');
  const [pay, setPay] = useState(null);
  const all = db.borrowRequests.filter((r) => (incoming ? r.owner === me : r.borrower === me));
  const isOpen = (r) => ['Pending Owner Approval', 'Approved — Payment Required'].includes(r.status);
  const list = all.filter((r) => (tab === 'Open' ? isOpen(r) : tab === 'Confirmed' ? ['Confirmed', 'Active'].includes(r.status) : tab === 'Closed' ? !isOpen(r) && !['Confirmed', 'Active'].includes(r.status) : true));
  return (
    <div className="stack lg">
      <PageHeader title={incoming ? 'Incoming Requests' : 'My Borrow Requests'} crumbs={crumbs(incoming ? 'Incoming Requests' : 'My Borrow Requests')} sub={incoming ? 'You decide who borrows your pet. Approving asks the borrower to pay; the booking is confirmed only after payment.' : 'You pay only after an owner approves. Your booking is confirmed once payment succeeds.'} actions={!incoming && <Link to="/borrow/browse" className="btn btn-primary">Find a pet</Link>} />
      <Tabs value={tab} onChange={setTab} items={['Open', 'Confirmed', 'Closed', 'All'].map((t) => ({ value: t, label: t }))} />
      <Table rows={list} onRow={(r) => nav(`/borrow/bookings/${r.id}`)} empty={<Empty icon={incoming ? Inbox : Send} title={incoming ? 'No requests here' : 'No requests here'} />} columns={[
        { label: 'Request', render: (r) => <strong>{r.id}</strong> }, { label: 'Pet', render: (r) => petName(db, r) },
        { label: incoming ? 'Borrower' : 'Owner', render: (r) => <div>{incoming ? r.borrower : r.owner}{incoming && r.carePlan && <div className="tiny muted" style={{ maxWidth: 260 }}>{r.carePlan}</div>}</div> },
        { label: 'Dates', render: (r) => <span className="small">{fmtDate(r.start)} – {fmtDate(r.end)} · {r.days}d</span> },
        { label: 'Total', num: true, render: (r) => money(r.daily * r.days) }, { label: 'Status', render: (r) => <div><Chip status={r.status} />{r.payment === 'Payment failed' && <div className="tiny" style={{ color: 'var(--bad)' }}>Payment failed</div>}</div> },
        { label: '', render: (r) => <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
          {incoming && r.status === 'Pending Owner Approval' && <>
            <button className="btn btn-primary btn-sm" onClick={() => A.approve(r)}><CheckCircle2 size={14} /> Approve</button>
            <button className="btn btn-ghost btn-sm" onClick={() => confirm({ title: 'Reject request?', body: `${r.borrower} will be notified.`, requireReason: true, danger: true, confirmLabel: 'Reject', onConfirm: (why) => A.reject(r, why) })}><XCircle size={14} /></button>
          </>}
          {!incoming && r.status === 'Approved — Payment Required' && <button className="btn btn-secondary btn-sm" onClick={() => setPay(r)}><CreditCard size={14} /> {r.payment === 'Payment failed' ? 'Retry payment' : 'Pay'}</button>}
        </div> },
      ]} />
      {pay && <PayModal req={pay} onClose={() => setPay(null)} />}
    </div>
  );
}

function ActiveBorrowings({ returns }) {
  const { db } = useApp();
  const me = useMe();
  const nav = useNavigate();
  const list = db.borrowRequests.filter((r) => (r.owner === me || r.borrower === me) && (returns ? r.status === 'Active' || (r.status === 'Completed' && r.returnAt) : ['Confirmed', 'Active'].includes(r.status)));
  return (
    <div className="stack lg">
      <PageHeader title={returns ? 'Return Management' : 'Active Borrowings'} crumbs={crumbs(returns ? 'Return Management' : 'Active Borrowings')} sub={returns ? 'Track return due dates and record each return with the pet’s condition.' : 'Confirmed bookings waiting for handover, and pets currently with a borrower.'} />
      {list.length === 0 ? <div className="card"><Empty icon={returns ? RotateCcw : Activity} title={returns ? 'No returns to manage' : 'No active borrowings'} /></div> : (
        <div className="grid g2">
          {list.map((r) => {
            const l = db.borrowListings.find((x) => x.id === r.listingId);
            const overdue = r.status === 'Active' && r.end < today();
            const revealed = true;
            return (
              <div key={r.id} className="card stack sm" style={{ borderColor: overdue ? 'var(--bad)' : undefined }}>
                <div className="row between"><div className="row"><div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden' }}><Img src={l?.img} alt="" /></div><div><strong>{l?.name}</strong><div className="tiny muted">{r.id} · you are the {r.owner === me ? 'owner' : 'borrower'}</div></div></div>{overdue ? <Chip status="Overdue">Return overdue</Chip> : <Chip status={r.status} />}</div>
                <div className="small"><CalendarRange size={13} style={{ verticalAlign: -2 }} /> {fmtDate(r.start)} → <strong>{r.status === 'Completed' ? `returned ${fmtDate(r.returnAt)}` : `due ${fmtDate(r.end)}`}</strong></div>
                <div className="small muted"><MapPin size={13} style={{ verticalAlign: -2 }} /> Pickup: {revealed ? l?.exactPickup : l?.area} · Return: {l?.returnPlace === 'Same as pickup' ? 'same place' : l?.returnPlace}</div>
                {r.handoverNote && <div className="tiny muted">Handover: {r.handoverNote}</div>}
                {r.returnNote && <div className="tiny muted">Return: {r.returnNote}</div>}
                <div className="row" style={{ marginTop: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => nav(`/borrow/bookings/${r.id}`)}>{r.status === 'Confirmed' ? 'Record handover' : r.status === 'Active' ? 'Record return' : 'View booking'}</button>
                  {overdue && <button className="btn btn-danger-outline btn-sm" onClick={() => nav(`/borrow/bookings/${r.id}`)}><AlertTriangle size={14} /> Report missed return</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Payments() {
  const { db } = useApp();
  return (
    <div className="stack lg">
      <PageHeader title="Payment History" crumbs={crumbs('Payment History')} sub="Prototype payments — no real gateway is connected." />
      <Table rows={db.payments} columns={[
        { label: 'Transaction', render: (p) => <strong>{p.id}</strong> }, { label: 'Booking', render: (p) => <Link to={`/borrow/bookings/${p.bookingId}`}>{p.bookingId}</Link> }, { label: 'Date', render: (p) => fmtDate(p.date) },
        { label: 'Type', render: (p) => (p.direction === 'in' ? 'Received (as owner)' : 'Paid (as borrower)') }, { label: 'Method', key: 'method' }, { label: 'Amount', num: true, render: (p) => money(p.amount) }, { label: 'Status', render: (p) => <Chip status={p.status} /> },
      ]} />
      <h3>Refunds</h3>
      <Table rows={db.borrowRequests.filter((r) => r.refund && r.refund !== '—')} empty={<Empty title="No refunds" />} columns={[{ label: 'Booking', key: 'id' }, { label: 'Pet', render: (r) => petName(db, r) }, { label: 'Status', render: (r) => <Chip status={r.status} /> }, { label: 'Refund', key: 'refund' }]} />
    </div>
  );
}

function Earnings() {
  const { db } = useApp();
  const me = useMe();
  const rows = db.borrowRequests.filter((r) => r.owner === me && ['Confirmed', 'Active', 'Completed', 'Disputed'].includes(r.status)).map((r) => ({ ...r, ...borrowCost(r.daily, r.days, r.commissionRate ?? db.settings.commissionRate) }));
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
  return (
    <div className="stack lg">
      <PageHeader title="Owner Earnings" crumbs={crumbs('Owner Earnings')} />
      <div className="grid g3">
        <StatCard icon={Wallet} label="Gross bookings" value={money(sum('fee'))} />
        <StatCard icon={CreditCard} label={`Platform commission (${db.settings.commissionRate}%${db.settings.commissionFinal ? '' : ', example'})`} value={money(sum('commission'))} tone="orange" />
        <StatCard icon={HeartHandshake} label="Your net earnings" value={money(sum('ownerNet'))} tone="teal" />
      </div>
      {!db.settings.commissionFinal && <div className="alert alert-warn small"><AlertTriangle size={16} /> The platform commission rate is not final yet. The {db.settings.commissionRate}% shown is a configurable example.</div>}
      <Table rows={rows} empty={<Empty icon={Wallet} title="No earnings yet" />} columns={[
        { label: 'Booking', render: (r) => <Link to={`/borrow/bookings/${r.id}`}>{r.id}</Link> }, { label: 'Pet', render: (r) => petName(db, r) }, { label: 'Borrower', key: 'borrower' },
        { label: 'Fee', num: true, render: (r) => money(r.fee) }, { label: 'Commission', num: true, render: (r) => `− ${money(r.commission)}` }, { label: 'Net', num: true, render: (r) => <strong>{money(r.ownerNet)}</strong> }, { label: 'Payout', key: 'payout' },
      ]} />
    </div>
  );
}

function ReviewsReports() {
  const { db } = useApp();
  const me = useMe();
  const [report, setReport] = useState(false);
  const mineIds = db.borrowListings.filter((l) => l.owner === me).map((l) => l.id);
  const reviews = db.reviews.filter((r) => r.targetType === 'borrow' && (mineIds.includes(r.targetId) || r.by === me));
  const reports = db.reports.filter((r) => r.category === 'Pet Borrow' && r.by === me);
  return (
    <div className="stack lg">
      <PageHeader title="Reviews & Reports" crumbs={crumbs('Reviews & Reports')} actions={<button className="btn btn-danger-outline" onClick={() => setReport(true)}><Flag size={16} /> Report a safety issue</button>} />
      <div className="grid g2">
        <div className="stack">
          <h3>Reviews</h3>
          {reviews.length ? reviews.map((r) => <div key={r.id} className="card pad-sm stack sm"><div className="row between"><strong className="small">{r.by} → {r.target}</strong><Stars value={r.rating} /></div><p className="small">{r.text}</p><span className="tiny muted">{fmtDate(r.date)}</span></div>) : <div className="card"><Empty icon={Star} title="No reviews yet" text="Reviews open after a booking is completed." /></div>}
        </div>
        <div className="stack">
          <h3>My safety reports</h3>
          {reports.length ? reports.map((r) => <div key={r.id} className="card pad-sm stack sm"><div className="row between"><strong className="small">{r.id} · {r.target}</strong><Chip status={r.status} /></div><p className="small">{r.detail}</p>{r.outcome && <span className="tiny" style={{ color: 'var(--ok)' }}>Outcome: {r.outcome}</span>}</div>) : <div className="card"><Empty icon={Flag} title="No reports submitted" text="Report mistreatment, unsafe arrangements, missed returns or payment problems." /></div>}
        </div>
      </div>
      <ReportModal open={report} onClose={() => setReport(false)} category="Pet Borrow" target="General Pet Borrow safety issue" />
    </div>
  );
}

export default function BorrowPortal() {
  return (
    <Routes>
      <Route element={<PortalLayout portal="borrow" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="browse" element={<BorrowBrowser base="/borrow/browse" />} />
        <Route path="browse/:id" element={<BorrowDetail base="/borrow/browse" />} />
        <Route path="listed" element={<MyListed />} />
        <Route path="list" element={<ListPet />} />
        <Route path="incoming" element={<RequestsTable incoming />} />
        <Route path="requests" element={<RequestsTable />} />
        <Route path="active" element={<ActiveBorrowings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="returns" element={<ActiveBorrowings returns />} />
        <Route path="messages" element={<MessagesPage portal="borrow" filter={(t) => /borrow/i.test(t.about)} />} />
        <Route path="reviews" element={<ReviewsReports />} />
        <Route path="notifications" element={<NotificationsPage portal="borrow" />} />
        <Route path="settings" element={<SettingsPage portal="borrow" />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="*" element={<Empty title="Page not found" />} />
      </Route>
    </Routes>
  );
}
