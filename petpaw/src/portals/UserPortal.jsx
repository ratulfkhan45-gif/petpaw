import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Bell, CalendarDays, CalendarPlus, ClipboardList, Edit3, Eye, FileText, HeartHandshake, Hospital, LifeBuoy, Megaphone,
  Package, PauseCircle, PawPrint, Plus, PlayCircle, RotateCcw, Search, ShoppingBag, Star, Stethoscope, Syringe, Trash2,
  Upload, X, CheckCircle2, AlertTriangle, MapPin,
} from 'lucide-react';
import PortalLayout from '../components/PortalLayout.jsx';
import { Chip, Empty, Field, Img, Initials, Modal, PageHeader, StarInput, StatCard, Table, Tabs, Timeline } from '../components/ui.jsx';
import { ageFrom, fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { IMG, day, faqs } from '../data/mock.js';
import { HospitalDetail, HospitalFinder, DoctorDetail, DoctorFinder } from '../features/care.jsx';
import { Cart, PharmacyBrowser, ProductDetail, ShopBrowser, StoreDetail } from '../features/shopping.jsx';
import { AdDetail, AdForm, BorrowBrowser, BorrowDetail, MarketplaceBrowser } from '../features/community.jsx';
import { ReportModal } from '../features/common.jsx';
import { MessagesPage, NotificationsPage, SettingsPage } from './shared.jsx';

const crumbs = (label) => [{ label: 'Dashboard', to: '/user/dashboard' }, { label }];
const providerName = (db, a) => (a.kind === 'doctor' ? db.doctors.find((d) => d.id === a.providerId)?.name : db.hospitals.find((h) => h.id === a.providerId)?.name);
const myAppts = (db) => db.appointments.filter((a) => a.owner === db.auth.name);
const myOrders = (db) => db.orders.filter((o) => o.customer === db.auth.name);

/* ---------- Dashboard ---------- */
function Dashboard() {
  const { db } = useApp();
  const [params] = useSearchParams();
  const appts = myAppts(db);
  const upcoming = appts.filter((a) => ['Pending', 'Confirmed'].includes(a.status) && a.date >= today()).sort((a, b) => a.date.localeCompare(b.date));
  const orders = myOrders(db);
  const activeOrders = orders.filter((o) => !['Completed', 'Cancelled', 'Rejected', 'Delivered'].includes(o.status));
  const ads = db.ads.filter((a) => a.owner === db.auth.name && a.status === 'Active');
  const borrows = db.borrowRequests.filter((r) => (r.borrower === db.auth.name || r.owner === db.auth.name) && ['Confirmed', 'Active', 'Approved — Payment Required', 'Pending Owner Approval'].includes(r.status));
  const notifs = (db.notifications.user || []).slice(0, 4);
  const first = db.auth.name.split(' ')[0];
  return (
    <div className="stack lg">
      <PageHeader title={`Hello, ${first}`} sub="Here’s what’s happening with your pets today." />
      {params.get('welcome') && <div className="alert alert-ok"><CheckCircle2 size={18} /> <span>Welcome to PetPaw! Start by adding your pet so hospitals and vets can see its profile when you book.</span></div>}
      <div className="grid g5">
        <StatCard icon={PawPrint} label="Registered pets" value={db.pets.length} to="/user/pets" />
        <StatCard icon={CalendarDays} label="Upcoming appointments" value={upcoming.length} tone="teal" to="/user/appointments" />
        <StatCard icon={Package} label="Active orders" value={activeOrders.length} tone="orange" to="/user/orders" />
        <StatCard icon={Megaphone} label="Active ads" value={ads.length} tone="blue" to="/user/ads" />
        <StatCard icon={HeartHandshake} label="Active borrowings" value={borrows.length} tone="red" to="/user/borrowings" />
      </div>
      <div className="card">
        <div className="card-title"><h3>Quick actions</h3></div>
        <div className="row">
          <Link to="/user/pets?add=1" className="btn btn-outline"><Plus size={16} /> Add a pet</Link>
          <Link to="/user/hospitals" className="btn btn-outline"><Hospital size={16} /> Find a hospital</Link>
          <Link to="/user/doctors" className="btn btn-outline"><Stethoscope size={16} /> Book a doctor</Link>
          <Link to="/user/shop" className="btn btn-outline"><ShoppingBag size={16} /> Browse products</Link>
          <Link to="/user/ads/new" className="btn btn-outline"><Megaphone size={16} /> Create an ad</Link>
          <Link to="/user/borrow" className="btn btn-outline"><HeartHandshake size={16} /> Borrow a pet</Link>
        </div>
      </div>
      <div className="split">
        <div className="stack lg">
          <div className="card">
            <div className="card-title"><h3>Upcoming appointments</h3><Link to="/user/appointments" className="small">View all</Link></div>
            {upcoming.length === 0 ? <Empty icon={CalendarDays} title="No upcoming appointments" action={<Link to="/user/hospitals" className="btn btn-primary btn-sm">Book now</Link>} /> : (
              <div className="stack sm">
                {upcoming.slice(0, 3).map((a) => {
                  const pet = db.pets.find((p) => p.id === a.petId);
                  return (
                    <div key={a.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                      <div className="row" style={{ flexWrap: 'nowrap' }}>
                        <div className="stat" style={{ padding: 0, border: 0 }}><div className="ico tone-green" style={{ flexDirection: 'column', width: 52, height: 52, lineHeight: 1 }}><strong style={{ fontSize: 17 }}>{new Date(`${a.date}T12:00`).getDate()}</strong><span className="tiny">{new Date(`${a.date}T12:00`).toLocaleString('en', { month: 'short' })}</span></div></div>
                        <div><strong className="small">{a.service} · {pet?.name || a.petName}</strong><div className="tiny muted">{providerName(db, a)} · {a.time}</div></div>
                      </div>
                      <Chip status={a.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-title"><h3>Recent orders</h3><Link to="/user/orders" className="small">View all</Link></div>
            {orders.length === 0 ? <Empty icon={Package} title="No orders yet" /> : (
              <div className="stack sm">{orders.slice(0, 3).map((o) => (
                <div key={o.id} className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <div><strong className="small">{o.id}</strong> <span className="tiny muted">· {o.items.length} item(s) · {o.source === 'shop' ? 'Pet Shop' : 'Pharmacy'}</span><div className="tiny muted">{fmtDate(o.date)}</div></div>
                  <div className="row"><span className="price small">{money(o.total)}</span><Chip status={o.status} /></div>
                </div>
              ))}</div>
            )}
          </div>
        </div>
        <div className="stack lg">
          <div className="card">
            <div className="card-title"><h3>Notifications</h3><Link to="/user/notifications" className="small">All</Link></div>
            <div className="stack sm">{notifs.map((n) => <Link to={n.link || '/user/notifications'} key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} style={{ color: 'inherit' }}><Bell size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: 3 }} /><span className="small">{n.text}<br /><span className="tiny muted">{n.at}</span></span></Link>)}</div>
          </div>
          <div className="card">
            <div className="card-title"><h3>My pets</h3><Link to="/user/pets" className="small">Manage</Link></div>
            <div className="stack sm">{db.pets.map((p) => <Link key={p.id} to={`/user/pets/${p.id}`} className="row" style={{ color: 'inherit' }}><Initials name={p.name} img={p.img} /><div><strong className="small">{p.name}</strong><div className="tiny muted">{p.species} · {p.breed} · {ageFrom(p.dob)}</div></div></Link>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- My Pets ---------- */
const EMPTY_PET = { name: '', species: 'Dog', breed: '', dob: '', sex: 'Male', weight: '', allergies: '', notes: '', history: [], vaccinations: [] };
function PetForm({ pet, onClose }) {
  const { set, toast } = useApp();
  const [f, setF] = useState(pet || EMPTY_PET);
  const [photo, setPhoto] = useState('');
  const [err, setErr] = useState({});
  const save = () => {
    const er = {};
    if (!f.name.trim()) er.name = 'Enter your pet’s name';
    if (!f.breed.trim()) er.breed = 'Enter a breed (or “Deshi / mixed”)';
    if (f.dob && f.dob > today()) er.dob = 'Birth date can’t be in the future';
    setErr(er);
    if (Object.keys(er).length) return;
    const imgMap = { Dog: IMG.dog2, Cat: IMG.cat2, Bird: IMG.budgie, Rabbit: IMG.rabbit };
    if (pet) set('pets', (ps) => ps.map((p) => (p.id === pet.id ? { ...f } : p)));
    else set('pets', (ps) => [...ps, { ...f, id: newId('pet'), img: imgMap[f.species] || IMG.dog2 }]);
    toast(pet ? 'Pet profile updated' : `${f.name} added to your pets`);
    onClose();
  };
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open wide onClose={onClose} title={pet ? `Edit ${pet.name}` : 'Add a pet'} footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>{pet ? 'Save changes' : 'Add pet'}</button></>}>
      <div className="form-grid">
        <div className="full">
          {photo ? <div className="doc-thumb"><Upload size={15} /> {photo}</div> : <label className="upload"><input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && setPhoto(e.target.files[0].name)} /><Upload size={18} style={{ margin: '0 auto 4px' }} /> Upload a photo (optional)</label>}
        </div>
        <Field label="Pet name" required error={err.name} htmlFor="pf-n"><input id="pf-n" className={`input ${err.name ? 'invalid' : ''}`} value={f.name} onChange={up('name')} /></Field>
        <Field label="Species" required htmlFor="pf-s"><select id="pf-s" className="select" value={f.species} onChange={up('species')}>{['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Breed" required error={err.breed} htmlFor="pf-b"><input id="pf-b" className={`input ${err.breed ? 'invalid' : ''}`} value={f.breed} onChange={up('breed')} /></Field>
        <Field label="Date of birth" error={err.dob} hint="Approximate is fine" htmlFor="pf-d"><input id="pf-d" type="date" max={today()} className="input" value={f.dob} onChange={up('dob')} /></Field>
        <Field label="Sex" htmlFor="pf-x"><select id="pf-x" className="select" value={f.sex} onChange={up('sex')}><option>Male</option><option>Female</option><option>Unknown</option></select></Field>
        <Field label="Weight" htmlFor="pf-w"><input id="pf-w" className="input" value={f.weight} onChange={up('weight')} placeholder="e.g. 12 kg" /></Field>
        <Field label="Allergies" full htmlFor="pf-a"><input id="pf-a" className="input" value={f.allergies} onChange={up('allergies')} placeholder="Foods or medicines your pet reacts to" /></Field>
        <Field label="Care notes" full htmlFor="pf-c"><textarea id="pf-c" className="textarea" value={f.notes} onChange={up('notes')} placeholder="Diet, routine, behaviour" /></Field>
      </div>
    </Modal>
  );
}

function MyPets() {
  const { db, set, confirm, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const [edit, setEdit] = useState(params.get('add') ? 'new' : null);
  const remove = (p) => confirm({ title: `Remove ${p.name}?`, body: `${p.name}’s profile, vaccination timeline and medical history will be deleted from your account. Past appointments stay in your history.`, danger: true, confirmLabel: 'Remove pet', onConfirm: () => { set('pets', (ps) => ps.filter((x) => x.id !== p.id)); toast(`${p.name} removed`, 'info'); } });
  return (
    <div className="stack lg">
      <PageHeader title="My Pets" crumbs={crumbs('My Pets')} actions={<button className="btn btn-primary" onClick={() => setEdit('new')}><Plus size={16} /> Add pet</button>} />
      {db.pets.length === 0 ? <div className="card"><Empty icon={PawPrint} title="No pets yet" text="Add your first pet to book appointments and keep vaccination records." action={<button className="btn btn-primary" onClick={() => setEdit('new')}>Add a pet</button>} /></div> : (
        <div className="grid g3">
          {db.pets.map((p) => {
            const due = p.vaccinations.filter((v) => v.next < today()).length;
            return (
              <div key={p.id} className="media-card">
                <Link to={`/user/pets/${p.id}`} className="media"><Img src={p.img} alt={p.name} />{due > 0 && <span className="tag chip chip-bad">Vaccine overdue</span>}</Link>
                <div className="body">
                  <h3>{p.name}</h3>
                  <div className="small muted">{p.species} · {p.breed} · {p.sex} · {ageFrom(p.dob)}{p.weight && ` · ${p.weight}`}</div>
                  <div className="row" style={{ marginTop: 'auto', paddingTop: 8, gap: 8 }}>
                    <Link to={`/user/pets/${p.id}`} className="btn btn-primary btn-sm"><Eye size={14} /> View</Link>
                    <button className="btn btn-outline btn-sm" onClick={() => setEdit(p)}><Edit3 size={14} /> Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} onClick={() => remove(p)}><Trash2 size={14} /> Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {edit && <PetForm pet={edit === 'new' ? null : edit} onClose={() => { setEdit(null); setParams({}); }} />}
    </div>
  );
}

function PetDetail() {
  const { id } = useParams();
  const { db, set, toast } = useApp();
  const [tab, setTab] = useState('profile');
  const [edit, setEdit] = useState(false);
  const [vac, setVac] = useState(null);
  const p = db.pets.find((x) => x.id === id);
  if (!p) return <Empty title="Pet not found" action={<Link to="/user/pets" className="btn btn-primary">Back to My Pets</Link>} />;
  const rx = db.prescriptions.filter((r) => r.petId === p.id);
  const appts = db.appointments.filter((a) => a.petId === p.id);
  const vaccSorted = [...p.vaccinations].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="stack lg">
      <PageHeader title={p.name} crumbs={[{ label: 'Dashboard', to: '/user/dashboard' }, { label: 'My Pets', to: '/user/pets' }, { label: p.name }]} actions={<><button className="btn btn-outline" onClick={() => setEdit(true)}><Edit3 size={16} /> Edit</button><Link className="btn btn-primary" to="/user/hospitals"><CalendarPlus size={16} /> Book care</Link></>} />
      <div className="card row" style={{ flexWrap: 'nowrap', gap: 20 }}>
        <div style={{ width: 120, height: 120, borderRadius: 18, overflow: 'hidden', flexShrink: 0 }}><Img src={p.img} alt={p.name} /></div>
        <div className="grid g4 grow">
          {[['Species', p.species], ['Breed', p.breed], ['Age', `${ageFrom(p.dob)}${p.dob ? ` (${fmtDate(p.dob)})` : ''}`], ['Sex', p.sex], ['Weight', p.weight || '—'], ['Allergies', p.allergies || 'None known'], ['Vaccines', `${p.vaccinations.length} recorded`], ['Visits', `${appts.length} booked`]].map(([k, v]) => (
            <div key={k}><div className="tiny muted">{k}</div><div className="small" style={{ fontWeight: 600 }}>{v}</div></div>
          ))}
        </div>
      </div>
      <Tabs value={tab} onChange={setTab} items={[{ value: 'profile', label: 'Care notes' }, { value: 'history', label: 'Medical history', count: p.history.length }, { value: 'vacc', label: 'Vaccination timeline', count: p.vaccinations.length }, { value: 'rx', label: 'Prescriptions', count: rx.length }]} />
      {tab === 'profile' && <div className="card"><p>{p.notes || 'No care notes yet.'}</p></div>}
      {tab === 'history' && (p.history.length ? <div className="card"><Timeline steps={p.history.map((h) => ({ title: `${fmtDate(h.date)} · ${h.title}`, text: `${h.by} — ${h.note}`, state: 'done' }))} /></div> : <div className="card"><Empty icon={FileText} title="No medical history yet" text="Records added by PetPaw doctors after a consultation appear here." /></div>)}
      {tab === 'vacc' && (
        <div className="card stack">
          <div className="row between"><h3>Vaccinations</h3><button className="btn btn-outline btn-sm" onClick={() => setVac({ name: '', date: today(), next: '' })}><Syringe size={14} /> Add vaccination</button></div>
          {vaccSorted.length ? <Timeline steps={vaccSorted.map((v) => ({ title: `${v.name} — given ${fmtDate(v.date)}`, text: v.next ? `Next due ${fmtDate(v.next)}${v.next < today() ? ' · OVERDUE' : ''}` : 'No booster needed', state: v.next && v.next < today() ? 'fail' : 'done' }))} /> : <Empty icon={Syringe} title="No vaccinations recorded" />}
        </div>
      )}
      {tab === 'rx' && (rx.length ? rx.map((r) => (
        <div key={r.id} className="card stack sm">
          <div className="row between"><strong>{r.id} · {r.diagnosis}</strong><Chip status={r.status} /></div>
          <div className="small muted">{fmtDate(r.date)} · {db.doctors.find((d) => d.id === r.doctorId)?.name}</div>
          {r.items.map((i) => <div key={i.med} className="small">• <strong>{i.med}</strong> — {i.dose}, {i.freq}, {i.duration}{i.note ? ` (${i.note})` : ''}</div>)}
          <Link to="/user/pharmacy" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>Order from pharmacy</Link>
        </div>
      )) : <div className="card"><Empty icon={FileText} title="No prescriptions" /></div>)}
      {edit && <PetForm pet={p} onClose={() => setEdit(false)} />}
      <Modal open={!!vac} onClose={() => setVac(null)} title="Add vaccination" footer={<><button className="btn btn-outline" onClick={() => setVac(null)}>Cancel</button><button className="btn btn-primary" disabled={!vac?.name} onClick={() => { set('pets', (ps) => ps.map((x) => (x.id === p.id ? { ...x, vaccinations: [...x.vaccinations, vac] } : x))); setVac(null); toast('Vaccination added'); }}>Save</button></>}>
        {vac && <div className="form-grid">
          <Field label="Vaccine" full htmlFor="v-n"><input id="v-n" className="input" value={vac.name} onChange={(e) => setVac({ ...vac, name: e.target.value })} placeholder="e.g. Rabies" /></Field>
          <Field label="Date given" htmlFor="v-d"><input id="v-d" type="date" className="input" max={today()} value={vac.date} onChange={(e) => setVac({ ...vac, date: e.target.value })} /></Field>
          <Field label="Next due (optional)" htmlFor="v-x"><input id="v-x" type="date" className="input" value={vac.next} onChange={(e) => setVac({ ...vac, next: e.target.value })} /></Field>
        </div>}
      </Modal>
    </div>
  );
}

/* ---------- Appointments ---------- */
function MyAppointments() {
  const { db, set, confirm, toast, notify } = useApp();
  const [tab, setTab] = useState('All');
  const [open, setOpen] = useState(null);
  const [review, setReview] = useState(null);
  const [report, setReport] = useState(null);
  const all = myAppts(db);
  const list = all.filter((a) => tab === 'All' || a.status === tab);
  const canCancel = (a) => ['Pending', 'Confirmed'].includes(a.status) && (new Date(`${a.date}T12:00`) - new Date()) / 36e5 > -12;
  const cancel = (a) => confirm({ title: `Cancel ${a.id}?`, body: `Cancellations are free up to ${db.settings.cancellationHours} hours before the appointment. ${providerName(db, a)} will be notified.`, confirmLabel: 'Cancel appointment', danger: true, warning: 'The time slot will be released to other pet owners.', onConfirm: () => { set('appointments', (x) => x.map((y) => (y.id === a.id ? { ...y, status: 'Cancelled' } : y))); notify(a.kind === 'doctor' ? 'doctor' : 'hospital', `${a.owner} cancelled ${a.id}.`, `/${a.kind === 'doctor' ? 'doctor' : 'hospital'}/appointments`); setOpen(null); toast('Appointment cancelled', 'info'); } });
  return (
    <div className="stack lg">
      <PageHeader title="My Appointments" crumbs={crumbs('My Appointments')} actions={<><Link className="btn btn-outline" to="/user/doctors"><Stethoscope size={16} /> Book doctor</Link><Link className="btn btn-primary" to="/user/hospitals"><CalendarPlus size={16} /> Book hospital</Link></>} />
      <div className="alert alert-info small"><Bell size={16} /> Reminders are sent 24 hours and 2 hours before each confirmed appointment.</div>
      <Tabs value={tab} onChange={setTab} items={['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map((s) => ({ value: s, label: s, count: s === 'All' ? all.length : all.filter((a) => a.status === s).length }))} />
      <Table rows={list} onRow={setOpen} empty={<Empty icon={CalendarDays} title={`No ${tab === 'All' ? '' : tab.toLowerCase()} appointments`} />} columns={[
        { key: 'id', label: 'ID', render: (a) => <strong>{a.id}</strong> },
        { label: 'Pet', render: (a) => db.pets.find((p) => p.id === a.petId)?.name || a.petName },
        { label: 'Provider', render: (a) => <div><div>{providerName(db, a)}</div><div className="tiny muted">{a.kind === 'doctor' ? 'Doctor' : 'Hospital'} · {a.service}</div></div> },
        { label: 'Date & time', render: (a) => <span className="num">{fmtDate(a.date)} · {a.time}</span> },
        { label: 'Fee', num: true, render: (a) => money(a.price) },
        { label: 'Status', render: (a) => <Chip status={a.status} /> },
      ]} />
      {open && (
        <Modal open onClose={() => setOpen(null)} title={`Appointment ${open.id}`} footer={<>
          {open.status === 'Completed' && !open.reviewed && <button className="btn btn-primary" onClick={() => { setReview({ appt: open, rating: 5, text: '' }); setOpen(null); }}><Star size={15} /> Leave review</button>}
          <button className="btn btn-ghost" onClick={() => { setReport(open); setOpen(null); }}>Report a problem</button>
          {canCancel(open) && <button className="btn btn-danger-outline" onClick={() => cancel(open)}>Cancel appointment</button>}
        </>}>
          <div className="stack">
            <Chip status={open.status} />
            <dl className="kv">
              <dt>Provider</dt><dd>{providerName(db, open)}</dd>
              <dt>Service</dt><dd>{open.service}{open.online ? ' (online)' : ''}</dd>
              <dt>Pet</dt><dd>{db.pets.find((p) => p.id === open.petId)?.name || open.petName}</dd>
              <dt>When</dt><dd>{fmtDate(open.date)} at {open.time}</dd>
              <dt>Reason</dt><dd>{open.reason}</dd>
              <dt>Fee</dt><dd>{money(open.price)} (pay at visit)</dd>
              {open.providerNote && <><dt>Provider note</dt><dd>{open.providerNote}</dd></>}
            </dl>
            {open.status === 'Pending' && <div className="alert alert-warn small">Waiting for the provider to confirm. You’ll get a notification.</div>}
            {open.status === 'Rescheduled' && <div className="alert alert-info small">The provider proposed a new time. Check the date above.</div>}
            <p className="tiny muted">Cancellation policy: free up to {db.settings.cancellationHours} hours before. Late cancellations may be charged by the provider.</p>
          </div>
        </Modal>
      )}
      <Modal open={!!review} onClose={() => setReview(null)} title="Review your visit" footer={<><button className="btn btn-outline" onClick={() => setReview(null)}>Cancel</button><button className="btn btn-primary" disabled={!review?.text.trim()} onClick={() => {
        const a = review.appt;
        set('reviews', (rv) => [{ id: newId('RV'), target: providerName(db, a), targetType: a.kind === 'doctor' ? 'doctor' : 'hospital', targetId: a.providerId, by: db.auth.name, rating: review.rating, text: review.text.trim(), date: day(0), status: 'Visible' }, ...rv]);
        set('appointments', (x) => x.map((y) => (y.id === a.id ? { ...y, reviewed: true } : y)));
        setReview(null); toast('Thanks for your review!');
      }}>Submit review</button></>}>
        {review && <div className="stack"><p className="small muted">{providerName(db, review.appt)} · {review.appt.service}</p><StarInput value={review.rating} onChange={(v) => setReview({ ...review, rating: v })} /><textarea className="textarea" value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} placeholder="How was the care?" aria-label="Review text" /></div>}
      </Modal>
      <ReportModal open={!!report} onClose={() => setReport(null)} category="Appointment" target={report ? `${report.id} · ${providerName(db, report)}` : ''} />
    </div>
  );
}

/* ---------- Orders ---------- */
const ORDER_STEPS = {
  shop: ['New', 'Processing', 'Out for delivery', 'Delivered', 'Completed'],
  pharmacy: ['Prescription review', 'Approved — awaiting payment', 'Preparing', 'Out for delivery', 'Delivered'],
};
function MyOrders() {
  const { db, set, toast } = useApp();
  const [tab, setTab] = useState('All');
  const [open, setOpen] = useState(null);
  const [report, setReport] = useState(null);
  const all = myOrders(db);
  const list = all.filter((o) => tab === 'All' || (tab === 'Pet Shop' ? o.source === 'shop' : o.source === 'pharmacy'));
  const o = open && db.orders.find((x) => x.id === open);
  const steps = o ? (o.source === 'pharmacy' && !o.items.some((i) => i.rx) ? ['New', 'Preparing', 'Out for delivery', 'Delivered'] : ORDER_STEPS[o.source]).filter((s) => !(o.delivery === 'Store pickup' && s === 'Out for delivery')) : [];
  const pos = o ? steps.indexOf(o.status === 'Ready for pickup' ? 'Delivered' : o.status) : -1;
  return (
    <div className="stack lg">
      <PageHeader title="My Orders" crumbs={crumbs('My Orders')} actions={<Link to="/user/cart" className="btn btn-outline">Go to cart</Link>} />
      <Tabs value={tab} onChange={setTab} items={['All', 'Pet Shop', 'Pharmacy'].map((t) => ({ value: t, label: t }))} />
      <Table rows={list} onRow={(r) => setOpen(r.id)} empty={<Empty icon={Package} title="No orders yet" action={<Link className="btn btn-primary" to="/user/shop">Start shopping</Link>} />} columns={[
        { label: 'Order', render: (r) => <strong>{r.id}</strong> },
        { label: 'Seller', render: (r) => <div>{(r.source === 'shop' ? db.shops : db.pharmacies).find((x) => x.id === r.providerId)?.name}<div className="tiny muted">{r.source === 'shop' ? 'Pet Shop' : 'Pharmacy'}</div></div> },
        { label: 'Date', render: (r) => fmtDate(r.date) },
        { label: 'Items', render: (r) => r.items.reduce((s, i) => s + i.qty, 0) },
        { label: 'Total', num: true, render: (r) => money(r.total) },
        { label: 'Payment', render: (r) => <span className="small">{r.payment}</span> },
        { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
      {o && (
        <Modal open wide onClose={() => setOpen(null)} title={`Order ${o.id}`} footer={<>
          {o.status === 'Approved — awaiting payment' && <button className="btn btn-primary" onClick={() => { set('orders', (x) => x.map((y) => (y.id === o.id ? { ...y, status: 'Preparing', payment: 'Paid (bKash — prototype)' } : y))); toast('Payment received (prototype). Pharmacy is preparing your order.'); }}>Pay {money(o.total)} now</button>}
          {['Delivered', 'Completed'].includes(o.status) && !o.reviewed && <button className="btn btn-outline" onClick={() => { set('orders', (x) => x.map((y) => (y.id === o.id ? { ...y, reviewed: true } : y))); set('reviews', (rv) => [{ id: newId('RV'), target: (o.source === 'shop' ? db.shops : db.pharmacies).find((x) => x.id === o.providerId)?.name, targetType: o.source, targetId: o.providerId, by: db.auth.name, rating: 5, text: 'Smooth order, arrived as described.', date: day(0), status: 'Visible' }, ...rv]); toast('Thanks! 5★ review posted.'); }}><Star size={15} /> Rate 5★</button>}
          <button className="btn btn-ghost" onClick={() => { setReport(o); setOpen(null); }}>Report a problem</button>
        </>}>
          <div className="split">
            <div className="stack">
              {o.status === 'Rejected' ? <div className="alert alert-bad"><AlertTriangle size={16} /> <span>The pharmacy could not dispense this order: {o.rejectReason || 'prescription not valid'}. You were not charged.</span></div> : (
                <Timeline steps={steps.map((s, i) => ({ title: s, state: i < pos ? 'done' : i === pos ? (i === steps.length - 1 ? 'done' : 'now') : '' }))} />
              )}
            </div>
            <div className="stack sm">
              {o.items.map((i) => <div key={i.id} className="row between small"><span>{i.qty} × {i.name} {i.rx && <span className="rx">Rx</span>}</span><span className="num">{money(i.qty * i.price)}</span></div>)}
              <div className="row between" style={{ borderTop: '1px dashed var(--line)', paddingTop: 8 }}><strong>Total</strong><strong className="num">{money(o.total)}</strong></div>
              <dl className="kv" style={{ gridTemplateColumns: '90px 1fr', marginTop: 8 }}>
                <dt>Delivery</dt><dd>{o.delivery}</dd><dt>Address</dt><dd>{o.address}</dd><dt>Payment</dt><dd>{o.payment}</dd>
                {o.rxFile && <><dt>Prescription</dt><dd>{o.rxId || o.rxFile}</dd></>}
              </dl>
            </div>
          </div>
        </Modal>
      )}
      <ReportModal open={!!report} onClose={() => setReport(null)} category="Order" target={report ? `${report.id}` : ''} />
    </div>
  );
}

/* ---------- My Ads ---------- */
function MyAds() {
  const { db, set, confirm, toast } = useApp();
  const mine = db.ads.filter((a) => a.owner === db.auth.name);
  const upd = (a, patch, msg) => { set('ads', (ads) => ads.map((x) => (x.id === a.id ? { ...x, ...patch } : x))); toast(msg); };
  return (
    <div className="stack lg">
      <PageHeader title="My Ads" crumbs={crumbs('My Ads')} sub="Pets you’re selling, giving away, or rehoming." actions={<Link to="/user/ads/new" className="btn btn-primary"><Plus size={16} /> Create ad</Link>} />
      {mine.length === 0 ? <div className="card"><Empty icon={Megaphone} title="You haven’t posted any ads" action={<Link to="/user/ads/new" className="btn btn-primary">Create your first ad</Link>} /></div> : (
        <div className="stack">
          {mine.map((a) => (
            <div key={a.id} className="card row" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><Img src={a.img} alt={a.name} /></div>
              <div className="grow stack sm" style={{ minWidth: 200 }}>
                <div className="row"><strong>{a.name}</strong><Chip status={a.status} />{a.paused && <Chip status="Paused" />}<span className="pill">{a.type}</span></div>
                <div className="small muted">{a.breed} · {a.area} · Posted {fmtDate(a.posted)} · {a.type === 'For Sale' ? money(a.price) : 'Free'}</div>
                <div className="small"><Link to="/user/messages">{a.inquiries} inquiries</Link></div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <Link to={`/user/marketplace/${a.id}`} className="btn btn-ghost btn-sm"><Eye size={14} /> View</Link>
                {a.status !== 'Removed' && a.status !== 'Completed' && <Link to={`/user/ads/${a.id}/edit`} className="btn btn-outline btn-sm"><Edit3 size={14} /> Edit</Link>}
                {a.status === 'Active' && <button className="btn btn-outline btn-sm" onClick={() => upd(a, { status: 'Paused' }, 'Ad paused')}><PauseCircle size={14} /> Pause</button>}
                {a.status === 'Paused' && <button className="btn btn-outline btn-sm" onClick={() => upd(a, { status: 'Active' }, 'Ad reactivated')}><PlayCircle size={14} /> Resume</button>}
                {a.status === 'Active' && <button className="btn btn-outline btn-sm" onClick={() => upd(a, { status: 'Reserved' }, 'Marked as reserved')}>Mark reserved</button>}
                {a.status === 'Reserved' && <button className="btn btn-outline btn-sm" onClick={() => upd(a, { status: 'Active' }, 'Ad reopened')}>Reopen</button>}
                {['Active', 'Reserved'].includes(a.status) && <button className="btn btn-primary btn-sm" onClick={() => upd(a, { status: 'Completed' }, 'Marked as completed. Congratulations!')}><CheckCircle2 size={14} /> Completed</button>}
                {a.status !== 'Removed' && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} onClick={() => confirm({ title: `Remove ad for ${a.name}?`, body: 'The ad will no longer be visible. Existing conversations stay in your messages.', danger: true, confirmLabel: 'Remove ad', onConfirm: () => upd(a, { status: 'Removed', modReason: 'Removed by owner' }, 'Ad removed') })}><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- My Borrowings ---------- */
function MyBorrowings() {
  const { db } = useApp();
  const nav = useNavigate();
  const me = db.auth.name;
  const [tab, setTab] = useState('borrowing');
  const list = db.borrowRequests.filter((r) => (tab === 'borrowing' ? r.borrower === me : r.owner === me));
  return (
    <div className="stack lg">
      <PageHeader title="My Borrowings" crumbs={crumbs('My Borrowings')} sub="Pet Borrow history. Manage listings and requests in the Pet Borrow portal." actions={<Link to="/borrow/dashboard" className="btn btn-primary"><HeartHandshake size={16} /> Open Pet Borrow portal</Link>} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'borrowing', label: 'Pets I borrowed', count: db.borrowRequests.filter((r) => r.borrower === me).length }, { value: 'lending', label: 'My pets lent out', count: db.borrowRequests.filter((r) => r.owner === me).length }]} />
      <Table rows={list} onRow={(r) => nav(`/borrow/bookings/${r.id}`)} empty={<Empty icon={RotateCcw} title="No borrowings yet" action={<Link to="/user/borrow" className="btn btn-primary">Browse pets</Link>} />} columns={[
        { label: 'Booking', render: (r) => <strong>{r.id}</strong> },
        { label: 'Pet', render: (r) => db.borrowListings.find((l) => l.id === r.listingId)?.name },
        { label: tab === 'borrowing' ? 'Owner' : 'Borrower', render: (r) => (tab === 'borrowing' ? r.owner : r.borrower) },
        { label: 'Dates', render: (r) => `${fmtDate(r.start)} – ${fmtDate(r.end)}` },
        { label: 'Total', num: true, render: (r) => money(r.daily * r.days) },
        { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
    </div>
  );
}

/* ---------- Profile & Help ---------- */
function ProfileSettings() {
  const { db, set, toast } = useApp();
  const [p, setP] = useState({ name: db.auth.name, phone: '+880 1712-345678', area: 'Dhanmondi', address: 'Road 4, House 22, Dhanmondi, Dhaka 1209' });
  return (
    <SettingsPage portal="user" extra={
      <div className="card stack">
        <h3>Profile & contact details</h3>
        <div className="row"><Initials name={p.name} size="lg" /><div className="small muted">Your phone and address are shared only with providers you book or order from, and with confirmed Pet Borrow parties.</div></div>
        <div className="form-grid">
          <Field label="Full name" htmlFor="pr-n"><input id="pr-n" className="input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></Field>
          <Field label="Email" htmlFor="pr-e"><input id="pr-e" className="input" value={db.auth.email} disabled /></Field>
          <Field label="Phone" htmlFor="pr-p"><input id="pr-p" className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
          <Field label="Default delivery address" htmlFor="pr-a"><input id="pr-a" className="input" value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></Field>
        </div>
        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => { if (!p.name.trim()) return; set('auth', (a) => ({ ...a, name: a.name })); toast('Profile saved'); }}>Save profile</button>
      </div>
    } />
  );
}

function Help() {
  const { db, set, notify, toast } = useApp();
  const [f, setF] = useState({ category: 'Provider', subject: '', detail: '' });
  const [err, setErr] = useState('');
  const mine = db.reports.filter((r) => r.by === db.auth.name);
  const submit = (e) => {
    e.preventDefault();
    if (f.subject.trim().length < 4 || f.detail.trim().length < 15) { setErr('Add a subject and at least 15 characters of detail'); return; }
    const id = newId('RP');
    set('reports', (r) => [{ id, category: f.category, target: f.subject.trim(), by: db.auth.name, date: day(0), status: 'Open', priority: 'Medium', detail: f.detail.trim(), notes: [], outcome: '' }, ...r]);
    notify('admin', `New complaint ${id}: ${f.subject.trim()}`, '/admin/reports');
    setF({ category: 'Provider', subject: '', detail: '' }); setErr('');
    toast(`Complaint ${id} submitted`);
  };
  return (
    <div className="stack lg">
      <PageHeader title="Help & Support" crumbs={crumbs('Help & Support')} />
      <div className="split">
        <div className="stack">
          <div className="card faq">
            <h3 style={{ marginBottom: 12 }}>Common questions</h3>
            {faqs.map((q) => <details key={q.q}><summary>{q.q}</summary><p>{q.a}</p></details>)}
          </div>
          <div className="card stack">
            <h3>My complaints</h3>
            <Table rows={mine} pageSize={5} empty={<Empty icon={LifeBuoy} title="No complaints submitted" />} columns={[{ label: 'ID', key: 'id' }, { label: 'About', key: 'target' }, { label: 'Date', render: (r) => fmtDate(r.date) }, { label: 'Status', render: (r) => <Chip status={r.status} /> }, { label: 'Outcome', render: (r) => <span className="small">{r.outcome || '—'}</span> }]} />
          </div>
        </div>
        <form className="card stack" onSubmit={submit} noValidate>
          <h3>Submit a complaint</h3>
          <Field label="About" htmlFor="h-c"><select id="h-c" className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{['Provider', 'Order', 'Appointment', 'Listing', 'Pet Borrow'].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Subject" htmlFor="h-s"><input id="h-s" className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. Order ORD-5521 arrived damaged" /></Field>
          <Field label="Details" htmlFor="h-d"><textarea id="h-d" className="textarea" value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} /></Field>
          {err && <span className="error-text">{err}</span>}
          <button className="btn btn-primary">Submit</button>
          <p className="tiny muted">Our team responds within one working day. Urgent animal welfare issues are prioritised.</p>
        </form>
      </div>
    </div>
  );
}

export default function UserPortal() {
  return (
    <Routes>
      <Route element={<PortalLayout portal="user" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pets" element={<MyPets />} />
        <Route path="pets/:id" element={<PetDetail />} />
        <Route path="hospitals" element={<HospitalFinder base="/user" />} />
        <Route path="hospitals/:id" element={<HospitalDetail base="/user" />} />
        <Route path="doctors" element={<DoctorFinder base="/user" />} />
        <Route path="doctors/:id" element={<DoctorDetail base="/user" />} />
        <Route path="pharmacy" element={<PharmacyBrowser base="/user" />} />
        <Route path="shop" element={<ShopBrowser base="/user" />} />
        <Route path="shop/product/:id" element={<ProductDetail base="/user" />} />
        <Route path="shop/store/:id" element={<StoreDetail base="/user" />} />
        <Route path="cart" element={<Cart />} />
        <Route path="marketplace" element={<MarketplaceBrowser base="/user" />} />
        <Route path="marketplace/:id" element={<AdDetail base="/user" />} />
        <Route path="borrow" element={<BorrowBrowser base="/user" />} />
        <Route path="borrow/:id" element={<BorrowDetail base="/user" />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="ads" element={<MyAds />} />
        <Route path="ads/new" element={<AdForm />} />
        <Route path="ads/:id/edit" element={<AdForm />} />
        <Route path="borrowings" element={<MyBorrowings />} />
        <Route path="messages" element={<MessagesPage portal="user" />} />
        <Route path="notifications" element={<NotificationsPage portal="user" />} />
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="help" element={<Help />} />
        <Route path="*" element={<Empty title="Page not found" action={<Link className="btn btn-primary" to="/user/dashboard">Dashboard</Link>} />} />
      </Route>
    </Routes>
  );
}
