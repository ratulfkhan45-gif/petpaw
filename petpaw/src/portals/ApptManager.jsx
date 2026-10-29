import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2, FileText, Phone, Video, XCircle } from 'lucide-react';
import { Chip, Empty, Field, Modal, PageHeader, Table, Tabs } from '../components/ui.jsx';
import { fmtDate, money, today, useApp } from '../context/AppContext.jsx';

/** Appointment list + detail with confirm / reject / reschedule / complete, used by Hospital and Doctor portals. */
export function ApptManager({ portal, match, title = 'Appointments', crumbs, extraActions }) {
  const { db, set, notify, toast, confirm } = useApp();
  const [tab, setTab] = useState('Pending');
  const [open, setOpen] = useState(null);
  const [resched, setResched] = useState(null);
  const all = db.appointments.filter(match).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const list = all.filter((a) => tab === 'All' || (tab === 'Upcoming' ? ['Confirmed', 'Rescheduled'].includes(a.status) && a.date >= today() : a.status === tab));
  const a = open && db.appointments.find((x) => x.id === open);
  const petName = (x) => x.petName || db.pets.find((p) => p.id === x.petId)?.name;
  const pet = a && (db.pets.find((p) => p.id === a.petId) || { name: a.petName, species: a.petSpecies, breed: a.petBreed });
  const setStatus = (x, status, extra = {}, msg) => {
    set('appointments', (as) => as.map((y) => (y.id === x.id ? { ...y, status, ...extra } : y)));
    notify('user', msg || `Your appointment ${x.id} is now ${status.toLowerCase()}.`, '/user/appointments');
    toast(`${x.id}: ${status}`);
  };
  return (
    <div className="stack lg">
      <PageHeader title={title} crumbs={crumbs} />
      <Tabs value={tab} onChange={setTab} items={['Pending', 'Upcoming', 'Completed', 'Cancelled', 'Rejected', 'All'].map((s) => ({ value: s, label: s, count: s === 'All' ? all.length : s === 'Upcoming' ? all.filter((x) => ['Confirmed', 'Rescheduled'].includes(x.status) && x.date >= today()).length : all.filter((x) => x.status === s).length }))} />
      <Table rows={list} onRow={(r) => setOpen(r.id)} empty={<Empty icon={CalendarClock} title={`No ${tab.toLowerCase()} appointments`} />} columns={[
        { label: 'ID', render: (r) => <strong>{r.id}</strong> },
        { label: 'Date & time', render: (r) => <span className="num">{fmtDate(r.date)} · {r.time}{r.date === today() && <span className="pill" style={{ marginLeft: 6 }}>Today</span>}</span> },
        { label: 'Pet', render: (r) => <div>{petName(r)}<div className="tiny muted">{r.petSpecies || db.pets.find((p) => p.id === r.petId)?.species}</div></div> },
        { label: 'Owner', key: 'owner' },
        { label: 'Service', render: (r) => <span>{r.service}{r.online && <span className="pill" style={{ marginLeft: 6 }}><Video size={11} /> Online</span>}</span> },
        { label: 'Status', render: (r) => <Chip status={r.status} /> },
        { label: '', render: (r) => r.status === 'Pending' ? <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }} onClick={(e) => e.stopPropagation()}><button className="btn btn-primary btn-sm" onClick={() => setStatus(r, 'Confirmed', {}, `Your appointment ${r.id} on ${fmtDate(r.date)} at ${r.time} is confirmed.`)}>Confirm</button></div> : null },
      ]} />
      {a && (
        <Modal open wide onClose={() => setOpen(null)} title={`Appointment ${a.id}`} footer={<>
          {extraActions?.(a, () => setOpen(null))}
          {a.status === 'Pending' && <>
            <button className="btn btn-danger-outline" onClick={() => confirm({ title: 'Reject this booking?', body: 'The pet owner will be notified with your reason.', requireReason: true, reasonLabel: 'Reason for the owner', confirmLabel: 'Reject', danger: true, warning: 'The owner may book another provider.', onConfirm: (why) => { setStatus(a, 'Rejected', { providerNote: why }, `Your booking ${a.id} was declined: ${why}`); setOpen(null); } })}><XCircle size={15} /> Reject</button>
            <button className="btn btn-outline" onClick={() => setResched({ date: a.date, time: a.time, note: '' })}><CalendarClock size={15} /> Reschedule</button>
            <button className="btn btn-primary" onClick={() => { setStatus(a, 'Confirmed', {}, `Your appointment ${a.id} on ${fmtDate(a.date)} at ${a.time} is confirmed.`); setOpen(null); }}><CheckCircle2 size={15} /> Confirm</button>
          </>}
          {['Confirmed', 'Rescheduled'].includes(a.status) && <>
            <button className="btn btn-ghost" onClick={() => confirm({ title: 'Cancel this appointment?', body: 'The owner will be notified.', requireReason: true, confirmLabel: 'Cancel appointment', danger: true, onConfirm: (why) => { setStatus(a, 'Cancelled', { providerNote: why }); setOpen(null); } })}>Cancel</button>
            <button className="btn btn-outline" onClick={() => setResched({ date: a.date, time: a.time, note: '' })}>Reschedule</button>
            <button className="btn btn-primary" onClick={() => { setStatus(a, 'Completed', {}, `Your visit ${a.id} is complete. You can now leave a review.`); setOpen(null); }}><CheckCircle2 size={15} /> Mark completed</button>
          </>}
        </>}>
          <div className="split">
            <div className="stack">
              <Chip status={a.status} />
              <dl className="kv">
                <dt>When</dt><dd>{fmtDate(a.date)} at {a.time}</dd>
                <dt>Service</dt><dd>{a.service}{a.online ? ' (online)' : ''}</dd>
                <dt>Reason</dt><dd>{a.reason}</dd>
                {a.notes && <><dt>Owner notes</dt><dd>{a.notes}</dd></>}
                <dt>Fee</dt><dd>{money(a.price)}</dd>
                {a.providerNote && <><dt>Provider note</dt><dd>{a.providerNote}</dd></>}
              </dl>
            </div>
            <div className="card pad-sm stack sm" style={{ background: 'var(--bg)' }}>
              <h4>Pet & owner</h4>
              <dl className="kv" style={{ gridTemplateColumns: '90px 1fr' }}>
                <dt>Pet</dt><dd>{pet?.name}</dd><dt>Species</dt><dd>{pet?.species} · {pet?.breed}</dd>
                {pet?.allergies && <><dt>Allergies</dt><dd>{pet.allergies}</dd></>}
                <dt>Owner</dt><dd>{a.owner}</dd><dt>Contact</dt><dd className="row" style={{ gap: 6 }}><Phone size={13} /> {a.ownerPhone}</dd>
              </dl>
              <span className="tiny muted">Shown only because this owner booked with you.</span>
            </div>
          </div>
        </Modal>
      )}
      <Modal open={!!resched} onClose={() => setResched(null)} title="Propose a new time" footer={<><button className="btn btn-outline" onClick={() => setResched(null)}>Cancel</button><button className="btn btn-primary" disabled={!resched?.date || resched?.date < today() || !resched?.time} onClick={() => { setStatus(a, 'Rescheduled', { date: resched.date, time: resched.time, providerNote: resched.note || 'New time proposed by provider' }, `${a.id} was rescheduled to ${fmtDate(resched.date)} at ${resched.time}.`); setResched(null); setOpen(null); }}>Send new time</button></>}>
        {resched && <div className="form-grid">
          <Field label="New date" htmlFor="rs-d"><input id="rs-d" type="date" min={today()} className="input" value={resched.date} onChange={(e) => setResched({ ...resched, date: e.target.value })} /></Field>
          <Field label="New time" htmlFor="rs-t"><select id="rs-t" className="select" value={resched.time} onChange={(e) => setResched({ ...resched, time: e.target.value })}>{['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '04:30 PM', '05:00 PM', '06:00 PM', '07:00 PM'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Message to owner" full htmlFor="rs-n"><input id="rs-n" className="input" value={resched.note} onChange={(e) => setResched({ ...resched, note: e.target.value })} placeholder="e.g. The surgeon is in theatre at the original time" /></Field>
        </div>}
      </Modal>
    </div>
  );
}

export function PatientsList({ portal, match, crumbs, recordsLink }) {
  const { db } = useApp();
  const [open, setOpen] = useState(null);
  const appts = db.appointments.filter(match);
  const map = {};
  appts.forEach((a) => {
    const name = a.petName || db.pets.find((p) => p.id === a.petId)?.name;
    const key = `${name}-${a.owner}`;
    const pet = db.pets.find((p) => p.id === a.petId);
    map[key] = map[key] || { id: key, name, species: a.petSpecies || pet?.species, breed: a.petBreed || pet?.breed, owner: a.owner, phone: a.ownerPhone, allergies: pet?.allergies, visits: [], pet };
    map[key].visits.push(a);
  });
  const rows = Object.values(map);
  const p = open && map[open];
  return (
    <div className="stack lg">
      <PageHeader title="Pet Patients" crumbs={crumbs} sub="You can see a pet only if its owner has booked with you. Records outside your care are not shown." />
      <Table rows={rows} onRow={(r) => setOpen(r.id)} empty={<Empty title="No patients yet" />} columns={[
        { label: 'Pet', render: (r) => <strong>{r.name}</strong> }, { label: 'Species', render: (r) => `${r.species} · ${r.breed}` }, { label: 'Owner', key: 'owner' },
        { label: 'Visits', num: true, render: (r) => r.visits.length }, { label: 'Last visit', render: (r) => fmtDate(r.visits.map((v) => v.date).sort().pop()) },
      ]} />
      {p && (
        <Modal open wide onClose={() => setOpen(null)} title={p.name} footer={recordsLink && <Link className="btn btn-primary" to={recordsLink}><FileText size={15} /> Medical records</Link>}>
          <div className="stack">
            <dl className="kv"><dt>Species</dt><dd>{p.species} · {p.breed}</dd><dt>Owner</dt><dd>{p.owner} · {p.phone}</dd>{p.allergies && <><dt>Allergies</dt><dd>{p.allergies}</dd></>}</dl>
            <h4>Visits with you</h4>
            {p.visits.map((v) => <div key={v.id} className="doc-thumb"><span className="grow small">{fmtDate(v.date)} · {v.service} — {v.reason}</span><Chip status={v.status} /></div>)}
            {p.pet?.vaccinations?.length > 0 && <><h4>Vaccinations (shared by owner)</h4>{p.pet.vaccinations.map((v) => <div key={v.name} className="small">• {v.name} — {fmtDate(v.date)}{v.next && `, next ${fmtDate(v.next)}`}</div>)}</>}
          </div>
        </Modal>
      )}
    </div>
  );
}
