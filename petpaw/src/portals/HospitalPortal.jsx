import React, { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { CalendarDays, Clock, Edit3, Plus, Save, Star, Stethoscope, Tags, Trash2, Upload, Users, X, PawPrint, Banknote } from 'lucide-react';
import PortalLayout from '../components/PortalLayout.jsx';
import { BarChart, Chip, Empty, Field, Img, Modal, PageHeader, StatCard, Table, Stars } from '../components/ui.jsx';
import { fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { ApptManager, PatientsList } from './ApptManager.jsx';
import { LocationEditor, NotificationsPage, ProviderReviewsPage, SettingsPage, VerifiedBadge } from './shared.jsx';

const HID = 'h1';
const crumbs = (label) => [{ label: 'Dashboard', to: '/hospital/dashboard' }, { label }];
const mine = (a) => a.kind === 'hospital' && a.providerId === HID;

function Dashboard() {
  const { db } = useApp();
  const h = db.hospitals.find((x) => x.id === HID);
  const appts = db.appointments.filter(mine);
  const todays = appts.filter((a) => a.date === today() && ['Pending', 'Confirmed'].includes(a.status));
  const upcoming = appts.filter((a) => a.date >= today() && ['Confirmed', 'Pending', 'Rescheduled'].includes(a.status)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const svc = db.hospitalServices.filter((s) => s.hospitalId === HID);
  const reviews = db.reviews.filter((r) => r.targetType === 'hospital' && r.targetId === HID && r.status === 'Visible');
  return (
    <div className="stack lg">
      <PageHeader title={db.auth.name} sub={<span className="row" style={{ gap: 8 }}><VerifiedBadge pending={db.auth.pending} /> · {h.address}</span>} actions={<Link to="/hospital/appointments" className="btn btn-primary"><CalendarDays size={16} /> Manage appointments</Link>} />
      <div className="grid g4">
        <StatCard icon={CalendarDays} label="Today’s appointments" value={todays.length} to="/hospital/appointments" />
        <StatCard icon={Clock} label="Pending requests" value={appts.filter((a) => a.status === 'Pending').length} tone="orange" to="/hospital/appointments" />
        <StatCard icon={Tags} label="Active services" value={svc.filter((s) => s.active).length} tone="teal" to="/hospital/services" />
        <StatCard icon={Star} label="Average rating" value={h.rating} tone="blue" hint={`${h.reviews} reviews`} to="/hospital/reviews" />
      </div>
      <div className="split">
        <div className="card">
          <div className="card-title"><h3>Upcoming appointments</h3><Link to="/hospital/appointments" className="small">All</Link></div>
          <Table rows={upcoming} pageSize={5} empty={<Empty icon={CalendarDays} title="No upcoming appointments" />} columns={[{ label: 'When', render: (a) => <span className="num small">{fmtDate(a.date)} · {a.time}</span> }, { label: 'Pet', render: (a) => a.petName || db.pets.find((p) => p.id === a.petId)?.name }, { label: 'Service', key: 'service' }, { label: 'Status', render: (a) => <Chip status={a.status} /> }]} />
        </div>
        <div className="stack lg">
          <div className="card">
            <div className="card-title"><h3>Service summary</h3></div>
            <div className="stack sm">{svc.slice(0, 5).map((s) => <div key={s.id} className="row between small"><span>{s.name}</span><span className="price">{money(s.price)}</span></div>)}</div>
          </div>
          <div className="card">
            <div className="card-title"><h3>Latest review</h3></div>
            {reviews[0] ? <div className="stack sm"><Stars value={reviews[0].rating} /><p className="small">“{reviews[0].text}”</p><span className="tiny muted">{reviews[0].by}</span></div> : <p className="small muted">No reviews yet.</p>}
          </div>
          <div className="card">
            <div className="card-title"><h3>Recent activity</h3></div>
            <div className="stack sm">{(db.notifications.hospital || []).slice(0, 4).map((n) => <div key={n.id} className="small">{n.text}<div className="tiny muted">{n.at}</div></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { db, set, toast } = useApp();
  const h = db.hospitals.find((x) => x.id === HID);
  const [f, setF] = useState(h);
  const [err, setErr] = useState('');
  const [fac, setFac] = useState('');
  const save = () => {
    if (f.address.trim().length < 10) { setErr('Enter a complete address with house and road number'); return; }
    if (!f.lat) { setErr('Set the map pin'); return; }
    setErr('');
    set('hospitals', (hs) => hs.map((x) => (x.id === HID ? f : x)));
    toast('Hospital profile saved. Map pin updated for pet owners.');
  };
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="stack lg">
      <PageHeader title="Hospital Profile" crumbs={crumbs('Hospital Profile')} actions={<button className="btn btn-primary" onClick={save}><Save size={16} /> Save profile</button>} />
      <div className="card row between"><div className="row"><div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden' }}><Img src={f.img} alt="" /></div><div><strong>{f.name}</strong><div className="small muted">Licence documents on file · Verified {fmtDate('2025-09-24')}</div></div></div><VerifiedBadge pending={db.auth.pending} /></div>
      <div className="grid g2">
        <div className="card stack">
          <h3>Details</h3>
          <div className="form-grid">
            <Field label="Hospital name" full htmlFor="hp-n"><input id="hp-n" className="input" value={f.name} onChange={up('name')} /></Field>
            <Field label="Phone" htmlFor="hp-p"><input id="hp-p" className="input" value={f.phone} onChange={up('phone')} /></Field>
            <Field label="Email" htmlFor="hp-e"><input id="hp-e" className="input" value={f.email} onChange={up('email')} /></Field>
            <Field label="Operating hours (shown publicly)" full htmlFor="hp-h"><input id="hp-h" className="input" value={f.hours} onChange={up('hours')} /></Field>
            <Field label="Description" full htmlFor="hp-d"><textarea id="hp-d" className="textarea" value={f.desc} onChange={up('desc')} /></Field>
          </div>
          <label className="upload"><input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && toast(`Logo “${e.target.files[0].name}” uploaded (prototype)`)} /><Upload size={18} style={{ margin: '0 auto 4px' }} /> Upload logo or cover photo</label>
          <div className="field">
            <span className="label">Facilities</span>
            <div className="row" style={{ gap: 6 }}>{f.facilities.map((x) => <span key={x} className="pill">{x} <button style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex' }} onClick={() => setF({ ...f, facilities: f.facilities.filter((y) => y !== x) })} aria-label={`Remove ${x}`}><X size={12} /></button></span>)}</div>
            <div className="row"><input className="input grow" value={fac} onChange={(e) => setFac(e.target.value)} placeholder="Add facility" aria-label="Add facility" /><button className="btn btn-outline btn-sm" disabled={!fac.trim()} onClick={() => { setF({ ...f, facilities: [...f.facilities, fac.trim()] }); setFac(''); }}>Add</button></div>
          </div>
        </div>
        <div className="card stack">
          <h3>Address & map location</h3>
          <p className="small muted">Pet owners see this pin on the Find Pet Hospitals map and use it for directions.</p>
          <LocationEditor value={f} onChange={setF} error={err} />
        </div>
      </div>
    </div>
  );
}

function Services() {
  const { db, set, toast, confirm } = useApp();
  const list = db.hospitalServices.filter((s) => s.hospitalId === HID);
  const [edit, setEdit] = useState(null);
  const [err, setErr] = useState('');
  const save = () => {
    if (!edit.name.trim() || !(Number(edit.price) > 0)) { setErr('Enter a name and a price above ৳0'); return; }
    if (edit.id) set('hospitalServices', (s) => s.map((x) => (x.id === edit.id ? { ...edit, price: Number(edit.price) } : x)));
    else set('hospitalServices', (s) => [...s, { ...edit, id: newId('sv'), hospitalId: HID, price: Number(edit.price) }]);
    toast('Service saved'); setEdit(null); setErr('');
  };
  return (
    <div className="stack lg">
      <PageHeader title="Services & Pricing" crumbs={crumbs('Services & Pricing')} actions={<button className="btn btn-primary" onClick={() => setEdit({ name: '', price: '', duration: '30 min', desc: '', active: true })}><Plus size={16} /> Add service</button>} />
      <Table rows={list} columns={[
        { label: 'Service', render: (s) => <div><strong>{s.name}</strong><div className="tiny muted">{s.desc}</div></div> }, { label: 'Duration', key: 'duration' }, { label: 'Price', num: true, render: (s) => money(s.price) },
        { label: 'Availability', render: (s) => <label className="check small" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={s.active} onChange={() => { set('hospitalServices', (x) => x.map((y) => (y.id === s.id ? { ...y, active: !y.active } : y))); toast(s.active ? `${s.name} paused` : `${s.name} available`); }} /> {s.active ? 'Available' : 'Paused'}</label> },
        { label: '', render: (s) => <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><button className="btn btn-ghost btn-sm" onClick={() => setEdit(s)} aria-label="Edit"><Edit3 size={14} /></button><button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} aria-label="Delete" onClick={() => confirm({ title: `Delete ${s.name}?`, body: 'Pet owners will no longer be able to book this service. Existing bookings are not affected.', danger: true, confirmLabel: 'Delete', onConfirm: () => { set('hospitalServices', (x) => x.filter((y) => y.id !== s.id)); toast('Service deleted', 'info'); } })}><Trash2 size={14} /></button></div> },
      ]} />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit service' : 'Add service'} footer={<><button className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
        {edit && <div className="form-grid">
          <Field label="Service name" required full htmlFor="sv-n"><input id="sv-n" className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="Price (৳)" required htmlFor="sv-p"><input id="sv-p" type="number" min="0" className="input" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></Field>
          <Field label="Estimated duration" htmlFor="sv-d"><input id="sv-d" className="input" value={edit.duration} onChange={(e) => setEdit({ ...edit, duration: e.target.value })} /></Field>
          <Field label="Description" full htmlFor="sv-x"><textarea id="sv-x" className="textarea" value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} /></Field>
          {err && <span className="error-text full">{err}</span>}
        </div>}
      </Modal>
    </div>
  );
}

function Staff() {
  const { db, set, toast, confirm } = useApp();
  const [edit, setEdit] = useState(null);
  return (
    <div className="stack lg">
      <PageHeader title="Doctors & Staff" crumbs={crumbs('Doctors & Staff')} actions={<button className="btn btn-primary" onClick={() => setEdit({ name: '', role: 'Vet nurse', phone: '', status: 'Active' })}><Plus size={16} /> Add staff member</button>} />
      <div className="alert alert-info small"><Stethoscope size={16} /> Linked doctors manage their own consultations, records and prescriptions in the Pet Doctor portal. Here you manage hospital affiliation and staff records only.</div>
      <Table rows={db.staff} columns={[
        { label: 'Name', render: (s) => <strong>{s.name}</strong> }, { label: 'Role', key: 'role' },
        { label: 'Doctor account', render: (s) => s.linkedDoctorId ? <span className="verified">Linked · verified vet</span> : <span className="muted small">—</span> },
        { label: 'Phone', key: 'phone' }, { label: 'Status', render: (s) => <Chip status={s.status === 'Active' ? 'Active' : 'Paused'}>{s.status}</Chip> },
        { label: '', render: (s) => <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><button className="btn btn-ghost btn-sm" onClick={() => setEdit(s)} aria-label="Edit"><Edit3 size={14} /></button><button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} aria-label="Remove" onClick={() => confirm({ title: `Remove ${s.name}?`, body: s.linkedDoctorId ? 'The doctor’s account stays active but will no longer show this hospital as an affiliation.' : 'The staff record will be removed.', danger: true, confirmLabel: 'Remove', onConfirm: () => { set('staff', (x) => x.filter((y) => y.id !== s.id)); toast('Staff member removed', 'info'); } })}><Trash2 size={14} /></button></div> },
      ]} />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit staff member' : 'Add staff member'} footer={<><button className="btn btn-outline" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-primary" disabled={!edit?.name?.trim()} onClick={() => { if (edit.id) set('staff', (s) => s.map((x) => (x.id === edit.id ? edit : x))); else set('staff', (s) => [...s, { ...edit, id: newId('st') }]); setEdit(null); toast('Staff saved'); }}>Save</button></>}>
        {edit && <div className="form-grid">
          <Field label="Full name" required htmlFor="st-n"><input id="st-n" className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
          <Field label="Role" htmlFor="st-r"><select id="st-r" className="select" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>{['Vet nurse', 'Front desk', 'Groomer', 'Lab technician', 'Surgeon', 'General vet'].map((r) => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Phone" htmlFor="st-p"><input id="st-p" className="input" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
          <Field label="Status" htmlFor="st-s"><select id="st-s" className="select" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}><option>Active</option><option>On leave</option></select></Field>
          <Field label="Link a PetPaw doctor account (invite by email)" full htmlFor="st-l" hint="The doctor must accept the invite from their portal"><input id="st-l" className="input" placeholder="doctor@email.com" /></Field>
        </div>}
      </Modal>
    </div>
  );
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
function Hours() {
  const { db, set, toast } = useApp();
  const [h, setH] = useState(db.hospitalHours);
  const [hol, setHol] = useState({ date: '', label: '' });
  return (
    <div className="stack lg">
      <PageHeader title="Opening Hours & Availability" crumbs={crumbs('Opening Hours & Availability')} actions={<button className="btn btn-primary" onClick={() => { set('hospitalHours', h); toast('Hours and capacity saved. Booking slots updated.'); }}><Save size={16} /> Save</button>} />
      <div className="split">
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Weekly hours</h3>
          {DAYS.map((d) => {
            const v = h.days[d];
            return (
              <div key={d} className="week-row">
                <strong>{d}</strong>
                <label className="check small"><input type="checkbox" checked={!!v} onChange={(e) => setH({ ...h, days: { ...h.days, [d]: e.target.checked ? ['09:00', '21:00'] : null } })} /> Open</label>
                <input type="time" className="input" disabled={!v} value={v?.[0] || ''} onChange={(e) => setH({ ...h, days: { ...h.days, [d]: [e.target.value, v[1]] } })} aria-label={`${d} opening time`} />
                <input type="time" className="input" disabled={!v} value={v?.[1] || ''} onChange={(e) => setH({ ...h, days: { ...h.days, [d]: [v[0], e.target.value] } })} aria-label={`${d} closing time`} />
              </div>
            );
          })}
        </div>
        <div className="stack lg">
          <div className="card stack">
            <h3>Appointment capacity</h3>
            <Field label="Bookings per hourly slot" hint="Slots become unavailable when full" htmlFor="cap"><input id="cap" type="number" min="1" max="20" className="input" value={h.capacity} onChange={(e) => setH({ ...h, capacity: Number(e.target.value) })} /></Field>
          </div>
          <div className="card stack">
            <h3>Holidays & closures</h3>
            {h.holidays.map((x) => <div key={x.date} className="doc-thumb"><span className="grow small"><strong>{fmtDate(x.date)}</strong> · {x.label}</span><button className="btn btn-ghost btn-sm" onClick={() => setH({ ...h, holidays: h.holidays.filter((y) => y !== x) })} aria-label="Remove"><X size={14} /></button></div>)}
            <div className="form-grid">
              <Field label="Date" htmlFor="hol-d"><input id="hol-d" type="date" min={today()} className="input" value={hol.date} onChange={(e) => setHol({ ...hol, date: e.target.value })} /></Field>
              <Field label="Label" htmlFor="hol-l"><input id="hol-l" className="input" value={hol.label} onChange={(e) => setHol({ ...hol, label: e.target.value })} placeholder="e.g. Eid-ul-Fitr" /></Field>
            </div>
            <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} disabled={!hol.date || !hol.label} onClick={() => { setH({ ...h, holidays: [...h.holidays, hol] }); setHol({ date: '', label: '' }); }}><Plus size={14} /> Add closure</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const { db } = useApp();
  const appts = db.appointments.filter(mine);
  const byStatus = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map((s) => ({ label: s, value: appts.filter((a) => a.status === s).length }));
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({ label: m, value: 62 + i * 9 + (i % 2) * 7 }));
  const revenue = appts.filter((a) => a.status === 'Completed').reduce((s, a) => s + a.price, 0);
  return (
    <div className="stack lg">
      <PageHeader title="Reports" crumbs={crumbs('Reports')} />
      <div className="grid g3">
        <StatCard icon={CalendarDays} label="Appointments (all time)" value={appts.length + 398} />
        <StatCard icon={Banknote} label="Completed visit value (demo)" value={money(revenue + 284500)} tone="orange" />
        <StatCard icon={PawPrint} label="Unique pets served" value={312} tone="teal" />
      </div>
      <div className="grid g2">
        <div className="card"><div className="card-title"><h3>Appointments per month</h3></div><BarChart data={months} /></div>
        <div className="card"><div className="card-title"><h3>Current bookings by status</h3></div><BarChart data={byStatus} color="#45a88a" /></div>
      </div>
    </div>
  );
}

export default function HospitalPortal() {
  const { db } = useApp();
  return (
    <Routes>
      <Route element={<PortalLayout portal="hospital" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="services" element={<Services />} />
        <Route path="appointments" element={<ApptManager portal="hospital" match={mine} crumbs={crumbs('Appointments')} />} />
        <Route path="staff" element={<Staff />} />
        <Route path="patients" element={<PatientsList portal="hospital" match={mine} crumbs={crumbs('Pet Patients')} />} />
        <Route path="hours" element={<Hours />} />
        <Route path="reviews" element={<ProviderReviewsPage portal="hospital" type="hospital" id={HID} name={db.auth?.name || 'your hospital'} />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<NotificationsPage portal="hospital" />} />
        <Route path="settings" element={<SettingsPage portal="hospital" />} />
        <Route path="*" element={<Empty title="Page not found" />} />
      </Route>
    </Routes>
  );
}
