import React, { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, FileHeart, FileText, Plus, Save, Share2, Star, Trash2, Video, X, Download, Users, PawPrint } from 'lucide-react';
import PortalLayout from '../components/PortalLayout.jsx';
import { BarChart, Chip, Empty, Field, Modal, PageHeader, StatCard, Table, PrototypeNote, Initials } from '../components/ui.jsx';
import { fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { day } from '../data/mock.js';
import { ApptManager, PatientsList } from './ApptManager.jsx';
import { NotificationsPage, ProviderReviewsPage, SettingsPage, VerifiedBadge } from './shared.jsx';

const DID = 'd1';
const crumbs = (label) => [{ label: 'Dashboard', to: '/doctor/dashboard' }, { label }];
const mine = (a) => a.doctorId === DID;
const petOf = (db, a) => a.petName || db.pets.find((p) => p.id === a.petId)?.name;

function Dashboard() {
  const { db } = useApp();
  const appts = db.appointments.filter(mine);
  const todays = appts.filter((a) => a.date === today() && ['Pending', 'Confirmed'].includes(a.status));
  const upcomingOnline = appts.filter((a) => a.online && a.date >= today() && a.status === 'Confirmed');
  return (
    <div className="stack lg">
      <PageHeader title={`Good day, ${db.auth.name}`} sub={<span className="row" style={{ gap: 8 }}><VerifiedBadge pending={db.auth.pending} /> · Small animal surgery</span>} actions={<><Link className="btn btn-outline" to="/doctor/prescriptions?new=1"><FileText size={16} /> New prescription</Link><Link className="btn btn-primary" to="/doctor/appointments"><CalendarDays size={16} /> Appointments</Link></>} />
      <div className="grid g4">
        <StatCard icon={CalendarDays} label="Today’s appointments" value={todays.length} to="/doctor/appointments" />
        <StatCard icon={Clock} label="Pending requests" value={appts.filter((a) => a.status === 'Pending').length} tone="orange" to="/doctor/appointments" />
        <StatCard icon={Video} label="Upcoming online consults" value={upcomingOnline.length} tone="teal" to="/doctor/consultations" />
        <StatCard icon={FileText} label="Active prescriptions" value={db.prescriptions.filter((r) => r.doctorId === DID && r.status === 'Active').length} tone="blue" to="/doctor/prescriptions" />
      </div>
      <div className="split">
        <div className="card">
          <div className="card-title"><h3>Today</h3><span className="small muted">{fmtDate(today())}</span></div>
          {todays.length === 0 ? <Empty icon={CalendarDays} title="No appointments today" /> : todays.map((a) => (
            <div key={a.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <div className="row" style={{ flexWrap: 'nowrap' }}><strong className="num" style={{ width: 80 }}>{a.time}</strong><div><strong className="small">{petOf(db, a)}</strong> <span className="tiny muted">· {a.owner}</span><div className="tiny muted">{a.reason}</div></div></div>
              <div className="row"><Chip status={a.status} />{a.online && <span className="pill"><Video size={11} /> Online</span>}</div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title"><h3>Recent activity</h3></div>
          <div className="stack sm">{(db.notifications.doctor || []).slice(0, 5).map((n) => <div key={n.id} className="small">{n.text}<div className="tiny muted">{n.at}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { db, set, toast } = useApp();
  const d = db.doctors.find((x) => x.id === DID);
  const [f, setF] = useState(d);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="stack lg">
      <PageHeader title="My Profile" crumbs={crumbs('My Profile')} actions={<button className="btn btn-primary" onClick={() => { if (!(Number(f.fee) > 0)) return toast('Enter a valid fee', 'bad'); set('doctors', (ds) => ds.map((x) => (x.id === DID ? { ...f, fee: Number(f.fee), exp: Number(f.exp) } : x))); toast('Profile saved'); }}><Save size={16} /> Save</button>} />
      <div className="card row between"><div className="row"><Initials name={f.name} img={f.img} size="lg" /><div><h3>{f.name}</h3><div className="small muted">{f.qual}</div></div></div><VerifiedBadge pending={db.auth.pending} /></div>
      <div className="grid g2">
        <div className="card form-grid">
          <Field label="Full name" full htmlFor="dp-n"><input id="dp-n" className="input" value={f.name} onChange={up('name')} /></Field>
          <Field label="Qualifications" full htmlFor="dp-q"><input id="dp-q" className="input" value={f.qual} onChange={up('qual')} /></Field>
          <Field label="Specialization" htmlFor="dp-s"><input id="dp-s" className="input" value={f.spec} onChange={up('spec')} /></Field>
          <Field label="Years of experience" htmlFor="dp-e"><input id="dp-e" type="number" className="input" value={f.exp} onChange={up('exp')} /></Field>
          <Field label="Consultation fee (৳)" htmlFor="dp-f"><input id="dp-f" type="number" className="input" value={f.fee} onChange={up('fee')} /></Field>
          <Field label="Affiliated hospital" htmlFor="dp-h"><select id="dp-h" className="select" value={f.hospitalId} onChange={up('hospitalId')}><option value="">Independent</option>{db.hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field>
          <Field label="About" full htmlFor="dp-a"><textarea id="dp-a" className="textarea" value={f.about} onChange={up('about')} /></Field>
          <label className="check full"><input type="checkbox" checked={f.online} onChange={(e) => setF({ ...f, online: e.target.checked })} /> Offer online consultations</label>
        </div>
        <div className="card stack">
          <h3>Registration & credentials</h3>
          <dl className="kv"><dt>BVC registration</dt><dd>{f.bvc}</dd><dt>Verification</dt><dd><VerifiedBadge pending={db.auth.pending} /></dd><dt>Documents</dt><dd>BVC card.pdf · DVM certificate.pdf</dd></dl>
          <p className="small muted">To change your registration number, contact support. A re-verification will be required.</p>
        </div>
      </div>
    </div>
  );
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
function Schedule() {
  const { db, set, toast } = useApp();
  const [s, setS] = useState(db.doctorSchedule);
  const [leave, setLeave] = useState({ from: '', to: '', reason: '' });
  return (
    <div className="stack lg">
      <PageHeader title="My Schedule" crumbs={crumbs('My Schedule')} actions={<button className="btn btn-primary" onClick={() => { set('doctorSchedule', s); toast('Schedule saved. Pet owners now see your updated slots.'); }}><Save size={16} /> Save schedule</button>} />
      <div className="split">
        <div className="card">
          <div className="row between" style={{ marginBottom: 10 }}><h3>Working hours</h3><Field label="Slot length" htmlFor="slot"><select id="slot" className="select" style={{ width: 120 }} value={s.slotMinutes} onChange={(e) => setS({ ...s, slotMinutes: Number(e.target.value) })}><option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option></select></Field></div>
          {DAYS.map((d) => {
            const v = s.days[d];
            return (
              <div key={d} className="week-row">
                <strong>{d}</strong>
                <label className="check small"><input type="checkbox" checked={!!v} onChange={(e) => setS({ ...s, days: { ...s.days, [d]: e.target.checked ? ['10:00', '13:00'] : null } })} /> Working</label>
                <input type="time" className="input" disabled={!v} value={v?.[0] || ''} onChange={(e) => setS({ ...s, days: { ...s.days, [d]: [e.target.value, v[1]] } })} aria-label={`${d} start`} />
                <input type="time" className="input" disabled={!v} value={v?.[1] || ''} onChange={(e) => setS({ ...s, days: { ...s.days, [d]: [v[0], e.target.value] } })} aria-label={`${d} end`} />
              </div>
            );
          })}
        </div>
        <div className="card stack">
          <h3>Leave & unavailable times</h3>
          {s.leave.map((l) => <div key={l.from} className="doc-thumb"><span className="grow small"><strong>{fmtDate(l.from)} – {fmtDate(l.to)}</strong> · {l.reason}</span><button className="btn btn-ghost btn-sm" onClick={() => setS({ ...s, leave: s.leave.filter((x) => x !== l) })} aria-label="Remove"><X size={14} /></button></div>)}
          <div className="form-grid">
            <Field label="From" htmlFor="lv-f"><input id="lv-f" type="date" min={today()} className="input" value={leave.from} onChange={(e) => setLeave({ ...leave, from: e.target.value })} /></Field>
            <Field label="To" htmlFor="lv-t"><input id="lv-t" type="date" min={leave.from || today()} className="input" value={leave.to} onChange={(e) => setLeave({ ...leave, to: e.target.value })} /></Field>
            <Field label="Reason (private)" full htmlFor="lv-r"><input id="lv-r" className="input" value={leave.reason} onChange={(e) => setLeave({ ...leave, reason: e.target.value })} /></Field>
          </div>
          <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} disabled={!leave.from || !leave.to || leave.to < leave.from} onClick={() => { setS({ ...s, leave: [...s.leave, leave] }); setLeave({ from: '', to: '', reason: '' }); }}><Plus size={14} /> Add leave</button>
        </div>
      </div>
    </div>
  );
}

function Records() {
  const { db, set, toast } = useApp();
  const [params] = useSearchParams();
  const appts = db.appointments.filter((a) => mine(a) && ['Confirmed', 'Completed'].includes(a.status));
  const [f, setF] = useState(params.get('appt') ? { apptId: params.get('appt'), symptoms: '', diagnosis: '', treatment: '', followUp: '' } : null);
  const [q, setQ] = useState('');
  const list = db.records.filter((r) => r.doctorId === DID && (!q || `${r.petName} ${r.owner} ${r.diagnosis}`.toLowerCase().includes(q.toLowerCase())));
  const save = () => {
    const a = db.appointments.find((x) => x.id === f.apptId);
    if (!a || !f.diagnosis.trim()) return toast('Choose an appointment and enter a diagnosis', 'bad');
    const rec = { id: newId('MR'), doctorId: DID, apptId: a.id, petName: petOf(db, a), owner: a.owner, date: a.date, symptoms: f.symptoms, diagnosis: f.diagnosis, treatment: f.treatment, followUp: f.followUp, author: db.auth.name, updated: today() };
    set('records', (r) => [rec, ...r]);
    if (a.petId) set('pets', (ps) => ps.map((p) => (p.id === a.petId ? { ...p, history: [{ date: a.date, title: f.diagnosis, by: db.auth.name, note: `${f.treatment}${f.followUp ? `. Follow-up: ${f.followUp}` : ''}` }, ...p.history] } : p)));
    toast('Medical record saved and shared to the pet’s history');
    setF(null);
  };
  return (
    <div className="stack lg">
      <PageHeader title="Medical Records" crumbs={crumbs('Medical Records')} actions={<button className="btn btn-primary" onClick={() => setF({ apptId: appts[0]?.id || '', symptoms: '', diagnosis: '', treatment: '', followUp: '' })}><Plus size={16} /> Add consultation notes</button>} />
      <div className="alert alert-info small"><FileHeart size={16} /> You can only see records you authored or for pets currently in your care. Every record keeps its author and last-updated date.</div>
      <input className="input" style={{ maxWidth: 340 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pet, owner or diagnosis" aria-label="Search records" />
      <Table rows={list} columns={[
        { label: 'Date', render: (r) => fmtDate(r.date) }, { label: 'Pet', render: (r) => <strong>{r.petName}</strong> }, { label: 'Owner', key: 'owner' },
        { label: 'Diagnosis', key: 'diagnosis' }, { label: 'Treatment', render: (r) => <span className="small">{r.treatment}</span> }, { label: 'Follow-up', render: (r) => <span className="small">{r.followUp}</span> },
        { label: 'Audit', render: (r) => <span className="tiny muted">{r.author}<br />updated {fmtDate(r.updated)}</span> },
      ]} />
      <Modal open={!!f} wide onClose={() => setF(null)} title="Consultation notes" footer={<><button className="btn btn-outline" onClick={() => setF(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save record</button></>}>
        {f && <div className="form-grid">
          <Field label="Appointment" required full htmlFor="mr-a"><select id="mr-a" className="select" value={f.apptId} onChange={(e) => setF({ ...f, apptId: e.target.value })}><option value="">Choose…</option>{appts.map((a) => <option key={a.id} value={a.id}>{a.id} · {petOf(db, a)} · {a.owner} · {fmtDate(a.date)}</option>)}</select></Field>
          <Field label="Symptoms" full htmlFor="mr-s"><textarea id="mr-s" className="textarea" style={{ minHeight: 60 }} value={f.symptoms} onChange={(e) => setF({ ...f, symptoms: e.target.value })} /></Field>
          <Field label="Diagnosis" required htmlFor="mr-d"><input id="mr-d" className="input" value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></Field>
          <Field label="Follow-up advice" htmlFor="mr-f"><input id="mr-f" className="input" value={f.followUp} onChange={(e) => setF({ ...f, followUp: e.target.value })} placeholder="e.g. Recheck in 7 days" /></Field>
          <Field label="Treatment plan" full htmlFor="mr-t"><textarea id="mr-t" className="textarea" style={{ minHeight: 60 }} value={f.treatment} onChange={(e) => setF({ ...f, treatment: e.target.value })} /></Field>
        </div>}
      </Modal>
    </div>
  );
}

const EMPTY_LINE = { med: '', dose: '', freq: 'Twice daily', duration: '', note: '' };
function Prescriptions() {
  const { db, set, toast, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const appts = db.appointments.filter((a) => mine(a) && ['Confirmed', 'Completed'].includes(a.status));
  const [f, setF] = useState(params.get('new') || params.get('appt') ? { apptId: params.get('appt') || appts[0]?.id || '', diagnosis: '', items: [{ ...EMPTY_LINE }], notes: '' } : null);
  const [view, setView] = useState(null);
  const [err, setErr] = useState('');
  const list = db.prescriptions.filter((r) => r.doctorId === DID);
  const meds = [...new Set(db.medicines.map((m) => m.name))];
  const save = () => {
    const a = db.appointments.find((x) => x.id === f.apptId);
    if (!a) return setErr('Link the prescription to a consultation');
    if (!f.diagnosis.trim()) return setErr('Enter the diagnosis');
    if (f.items.some((i) => !i.med.trim() || !i.dose.trim() || !i.duration.trim())) return setErr('Each medicine needs a name, dose and duration');
    const id = newId('RX');
    set('prescriptions', (r) => [{ id, doctorId: DID, apptId: a.id, petId: a.petId || null, petName: petOf(db, a), owner: a.owner, date: today(), status: 'Active', diagnosis: f.diagnosis, items: f.items, notes: f.notes }, ...r]);
    notify('user', `${db.auth.name} issued prescription ${id} for ${petOf(db, a)}. You can use it at checkout in Pharmacy.`, a.petId ? `/user/pets/${a.petId}` : '/user/notifications');
    toast(`Prescription ${id} created and shared with ${a.owner}`);
    setF(null); setErr(''); setParams({});
  };
  const line = (i, k, v) => setF({ ...f, items: f.items.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  return (
    <div className="stack lg">
      <PageHeader title="Prescriptions" crumbs={crumbs('Prescriptions')} actions={<button className="btn btn-primary" onClick={() => setF({ apptId: appts[0]?.id || '', diagnosis: '', items: [{ ...EMPTY_LINE }], notes: '' })}><Plus size={16} /> New prescription</button>} />
      <div className="alert alert-info small"><FileText size={16} /> Pharmacies verify prescriptions before dispensing Rx medicines. Owners can attach your prescription at checkout.</div>
      <Table rows={list} onRow={setView} empty={<Empty icon={FileText} title="No prescriptions yet" />} columns={[
        { label: 'ID', render: (r) => <strong>{r.id}</strong> }, { label: 'Date', render: (r) => fmtDate(r.date) }, { label: 'Pet', key: 'petName' }, { label: 'Owner', key: 'owner' },
        { label: 'Diagnosis', key: 'diagnosis' }, { label: 'Medicines', render: (r) => <span className="small">{r.items.map((i) => i.med).join(', ')}</span> }, { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
      <Modal open={!!f} wide onClose={() => { setF(null); setParams({}); }} title="New prescription" footer={<><button className="btn btn-outline" onClick={() => { setF(null); setParams({}); }}>Cancel</button><button className="btn btn-primary" onClick={save}>Issue prescription</button></>}>
        {f && <div className="stack">
          <div className="form-grid">
            <Field label="Linked consultation" required htmlFor="rx-a"><select id="rx-a" className="select" value={f.apptId} onChange={(e) => setF({ ...f, apptId: e.target.value })}><option value="">Choose…</option>{appts.map((a) => <option key={a.id} value={a.id}>{a.id} · {petOf(db, a)} · {a.owner}</option>)}</select></Field>
            <Field label="Diagnosis" required htmlFor="rx-d"><input id="rx-d" className="input" value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} /></Field>
          </div>
          <datalist id="med-list">{meds.map((m) => <option key={m} value={m} />)}</datalist>
          {f.items.map((it, i) => (
            <div key={i} className="card pad-sm" style={{ background: 'var(--bg)' }}>
              <div className="row between" style={{ marginBottom: 8 }}><strong className="small">Medicine {i + 1}</strong>{f.items.length > 1 && <button className="btn btn-ghost btn-sm" onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== i) })} aria-label="Remove medicine"><Trash2 size={14} /></button>}</div>
              <div className="grid g5">
                <Field label="Name" htmlFor={`rx-m${i}`}><input id={`rx-m${i}`} list="med-list" className="input" value={it.med} onChange={(e) => line(i, 'med', e.target.value)} /></Field>
                <Field label="Dosage" htmlFor={`rx-o${i}`}><input id={`rx-o${i}`} className="input" value={it.dose} onChange={(e) => line(i, 'dose', e.target.value)} placeholder="1 tablet" /></Field>
                <Field label="Frequency" htmlFor={`rx-f${i}`}><select id={`rx-f${i}`} className="select" value={it.freq} onChange={(e) => line(i, 'freq', e.target.value)}>{['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'As needed'].map((x) => <option key={x}>{x}</option>)}</select></Field>
                <Field label="Duration" htmlFor={`rx-u${i}`}><input id={`rx-u${i}`} className="input" value={it.duration} onChange={(e) => line(i, 'duration', e.target.value)} placeholder="7 days" /></Field>
                <Field label="Instructions" htmlFor={`rx-n${i}`}><input id={`rx-n${i}`} className="input" value={it.note} onChange={(e) => line(i, 'note', e.target.value)} placeholder="With food" /></Field>
              </div>
            </div>
          ))}
          <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => setF({ ...f, items: [...f.items, { ...EMPTY_LINE }] })}><Plus size={14} /> Add medicine</button>
          <Field label="Notes for owner and pharmacy" htmlFor="rx-nt"><textarea id="rx-nt" className="textarea" style={{ minHeight: 60 }} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
          {err && <span className="error-text">{err}</span>}
        </div>}
      </Modal>
      <Modal open={!!view} wide onClose={() => setView(null)} title={`Prescription ${view?.id}`} footer={<>
        {view?.status === 'Active' && <button className="btn btn-ghost" onClick={() => { set('prescriptions', (r) => r.map((x) => (x.id === view.id ? { ...x, status: 'Cancelled' } : x))); setView(null); toast('Prescription cancelled', 'info'); }}>Cancel prescription</button>}
        <button className="btn btn-outline" onClick={() => toast('PDF download is a prototype placeholder', 'info')}><Download size={15} /> Download PDF</button>
        <button className="btn btn-primary" onClick={() => toast(`Shared with ${view.owner} in their PetPaw account`)}><Share2 size={15} /> Share with owner</button>
      </>}>
        {view && (
          <div className="rx-paper stack">
            <div className="row between"><div><strong style={{ fontSize: 18 }}>{db.auth.name}</strong><div className="small muted">DVM (BAU), MS in Surgery · BVC-04712</div><div className="small muted">Dhanmondi Pet Care Hospital</div></div><div style={{ textAlign: 'right' }}><div className="small">{fmtDate(view.date)}</div><Chip status={view.status} /></div></div>
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%' }} />
            <dl className="kv"><dt>Patient</dt><dd>{view.petName}</dd><dt>Owner</dt><dd>{view.owner}</dd><dt>Diagnosis</dt><dd>{view.diagnosis}</dd></dl>
            <div style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--green)' }}>℞</div>
            {view.items.map((i, k) => <div key={k}><strong>{k + 1}. {i.med}</strong><div className="small">{i.dose} · {i.freq} · {i.duration}{i.note ? ` · ${i.note}` : ''}</div></div>)}
            {view.notes && <p className="small"><strong>Notes:</strong> {view.notes}</p>}
            <span className="tiny muted">Digitally issued on PetPaw · verify at pharmacy with ID {view.id}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Consultations() {
  const { db, toast } = useApp();
  const [call, setCall] = useState(null);
  const list = db.appointments.filter((a) => mine(a) && a.online);
  return (
    <div className="stack lg">
      <PageHeader title="Online Consultations" crumbs={crumbs('Online Consultations')} sub="Video consultations booked by pet owners." />
      <Table rows={list} empty={<Empty icon={Video} title="No online consultations" text="Turn on online consultations in My Profile to receive requests." />} columns={[
        { label: 'ID', key: 'id' }, { label: 'When', render: (a) => `${fmtDate(a.date)} · ${a.time}` }, { label: 'Pet', render: (a) => petOf(db, a) }, { label: 'Owner', key: 'owner' }, { label: 'Reason', render: (a) => <span className="small">{a.reason}</span> }, { label: 'Status', render: (a) => <Chip status={a.status} /> },
        { label: '', render: (a) => a.status === 'Confirmed' ? <button className="btn btn-primary btn-sm" onClick={() => setCall(a)}><Video size={14} /> Join</button> : null },
      ]} />
      <Modal open={!!call} onClose={() => setCall(null)} title="Secure consultation room" footer={<button className="btn btn-danger" onClick={() => { setCall(null); toast('Consultation ended', 'info'); }}>Leave room</button>}>
        <div className="stack">
          <div style={{ aspectRatio: '16/9', background: '#17221d', borderRadius: 14, display: 'grid', placeItems: 'center', color: '#c8d3cd' }}><div style={{ textAlign: 'center' }}><Video size={40} /><div className="small" style={{ marginTop: 8 }}>Waiting for {call?.owner}…</div></div></div>
          <PrototypeNote>Video calling is not connected — this is the UI only</PrototypeNote>
        </div>
      </Modal>
    </div>
  );
}

function Reports() {
  const { db } = useApp();
  const appts = db.appointments.filter(mine);
  const weekly = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w, i) => ({ label: w, value: 14 + i * 2 + (i % 2) * 3 }));
  const types = [{ label: 'In person', value: appts.filter((a) => !a.online).length + 40 }, { label: 'Online', value: appts.filter((a) => a.online).length + 12 }];
  return (
    <div className="stack lg">
      <PageHeader title="Reports" crumbs={crumbs('Reports')} />
      <div className="grid g3">
        <StatCard icon={Users} label="Consultations this month" value={86} />
        <StatCard icon={PawPrint} label="Unique patients" value={64} tone="teal" />
        <StatCard icon={Star} label="Average rating" value="4.9" tone="orange" />
      </div>
      <div className="grid g2">
        <div className="card"><div className="card-title"><h3>Consultations per week</h3></div><BarChart data={weekly} /></div>
        <div className="card"><div className="card-title"><h3>By type</h3></div><BarChart data={types} color="#45a88a" /></div>
      </div>
    </div>
  );
}

function DoctorAppointments() {
  const nav = useNavigate();
  return (
    <ApptManager portal="doctor" match={mine} crumbs={crumbs('Appointments')} extraActions={(a, close) => ['Confirmed', 'Completed'].includes(a.status) && <>
      <button className="btn btn-ghost" onClick={() => { close(); nav(`/doctor/records?appt=${a.id}`); }}><FileHeart size={15} /> Notes</button>
      <button className="btn btn-ghost" onClick={() => { close(); nav(`/doctor/prescriptions?appt=${a.id}`); }}><FileText size={15} /> Prescribe</button>
    </>} />
  );
}

export default function DoctorPortal() {
  const { db } = useApp();
  return (
    <Routes>
      <Route element={<PortalLayout portal="doctor" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<PatientsList portal="doctor" match={mine} crumbs={crumbs('Pet Patients')} recordsLink="/doctor/records" />} />
        <Route path="records" element={<Records />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="reviews" element={<ProviderReviewsPage portal="doctor" type="doctor" id={DID} name={db.auth?.name || 'you'} />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<NotificationsPage portal="doctor" />} />
        <Route path="settings" element={<SettingsPage portal="doctor" />} />
        <Route path="*" element={<Empty title="Page not found" />} />
      </Route>
    </Routes>
  );
}
