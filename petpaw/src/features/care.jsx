import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BadgeCheck, CalendarPlus, Clock, Flag, Hospital, List, Map as MapIcon, MapPin, Navigation, Phone, Stethoscope, Video, Mail,
} from 'lucide-react';
import MapView, { directionsUrl, distanceTo, fmtKm, useUserLocation, LocationButton } from '../components/MapView.jsx';
import { Chip, Empty, Field, Img, Initials, PageHeader, Seg, Stars, Tabs } from '../components/ui.jsx';
import { fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { AREAS, day } from '../data/mock.js';
import { ReportModal, useAuthGate, useFakeLoad } from './common.jsx';

const crumbsFor = (base, label, to) => [{ label: base === '/explore' ? 'Home' : 'Dashboard', to: base === '/explore' ? '/' : '/user/dashboard' }, ...(to ? [{ label, to }] : [{ label }])];

/* ======================= HOSPITALS ======================= */
export function HospitalFinder({ base = '/user' }) {
  const { db } = useApp();
  const [params] = useSearchParams();
  const [view, setView] = useState(params.get('view') === 'map' ? 'map' : 'list');
  const [q, setQ] = useState(params.get('q') || '');
  const [area, setArea] = useState('');
  const [service, setService] = useState('');
  const [rating, setRating] = useState(0);
  const [avail, setAvail] = useState('');
  const [sel, setSel] = useState(null);
  const loc = useUserLocation();
  const loading = useFakeLoad(500, [view]);
  const services = [...new Set(db.hospitals.flatMap((h) => h.services))].sort();

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    let r = db.hospitals.filter((h) =>
      (!t || `${h.name} ${h.area} ${h.address}`.toLowerCase().includes(t)) &&
      (!area || h.area === area) && (!service || h.services.includes(service)) && h.rating >= rating &&
      (!avail || (avail === '24h' ? h.open24 : h.emergency)));
    if (loc.status === 'granted') r = [...r].sort((a, b) => distanceTo(loc, a) - distanceTo(loc, b));
    return r;
  }, [db.hospitals, q, area, service, rating, avail, loc]);

  const items = list.map((h) => ({
    id: h.id, type: 'hospital', name: h.name, lat: h.lat, lng: h.lng, area: h.area, address: h.address, img: h.img,
    lines: [h.address, `${h.hours} · ${h.phone}`, h.services.slice(0, 3).join(' · ')],
    primary: { label: 'Book Appointment', to: `${base}/hospitals/${h.id}?tab=book` },
    secondary: { label: 'View Details', to: `${base}/hospitals/${h.id}` },
  }));

  return (
    <div className="stack lg">
      <PageHeader title="Find Pet Hospitals" crumbs={crumbsFor(base, 'Find Pet Hospitals')} sub="Search verified hospitals by area, service, rating and availability." actions={<Seg value={view} onChange={setView} items={[{ value: 'list', label: 'List', icon: List }, { value: 'map', label: 'Map', icon: MapIcon }]} />} />
      <div className="card pad-sm">
        <div className="grid g5" style={{ alignItems: 'end' }}>
          <Field label="Search" htmlFor="hf-q"><input id="hf-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, area or address" /></Field>
          <Field label="Area" htmlFor="hf-a"><select id="hf-a" className="select" value={area} onChange={(e) => setArea(e.target.value)}><option value="">All areas</option>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
          <Field label="Service" htmlFor="hf-s"><select id="hf-s" className="select" value={service} onChange={(e) => setService(e.target.value)}><option value="">Any service</option>{services.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Rating" htmlFor="hf-r"><select id="hf-r" className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))}><option value={0}>Any rating</option><option value={4.5}>4.5★ & up</option><option value={4}>4★ & up</option></select></Field>
          <Field label="Availability" htmlFor="hf-v"><select id="hf-v" className="select" value={avail} onChange={(e) => setAvail(e.target.value)}><option value="">Any time</option><option value="24h">Open 24 hours</option><option value="em">Emergency care</option></select></Field>
        </div>
        <div className="row between" style={{ marginTop: 12 }}>
          <span className="small muted">{list.length} hospital{list.length === 1 ? '' : 's'} found{loc.status === 'granted' ? ' · sorted by distance' : ''}</span>
          <div className="row"><LocationButton compact />{(q || area || service || rating || avail) && <button className="btn btn-ghost btn-sm" onClick={() => { setQ(''); setArea(''); setService(''); setRating(0); setAvail(''); }}>Clear filters</button>}</div>
        </div>
      </div>

      {view === 'map' ? (
        <MapView items={items} selectedId={sel} onSelect={setSel} loading={loading} />
      ) : loading ? (
        <div className="grid g3">{[1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 320 }} />)}</div>
      ) : list.length === 0 ? (
        <div className="card"><Empty icon={Hospital} title="No hospitals match these filters" text="Try another area, remove the service filter, or search by address." action={<button className="btn btn-outline" onClick={() => { setQ(''); setArea(''); setService(''); setRating(0); setAvail(''); }}>Clear filters</button>} /></div>
      ) : (
        <div className="grid g3">
          {list.map((h) => (
            <div key={h.id} className="media-card">
              <div className="media" style={{ aspectRatio: '16/9' }}><Img src={h.img} alt={h.name} />{h.open24 && <span className="tag chip chip-green plain">Open 24h</span>}</div>
              <div className="body">
                <div className="row between"><Stars value={h.rating} count={h.reviews} />{h.verified && <span className="verified"><BadgeCheck size={14} /> Verified</span>}</div>
                <Link to={`${base}/hospitals/${h.id}`} style={{ color: 'var(--ink)' }}><h3 style={{ fontSize: 17 }}>{h.name}</h3></Link>
                <div className="small muted row" style={{ gap: 6, flexWrap: 'nowrap', alignItems: 'flex-start' }}><MapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} /> {h.address}</div>
                <div className="small muted row" style={{ gap: 6 }}><Clock size={14} /> {h.hours}</div>
                <div className="small muted row" style={{ gap: 6 }}><Phone size={14} /> {h.phone}</div>
                {fmtKm(distanceTo(loc, h)) && <div className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>{fmtKm(distanceTo(loc, h))}</div>}
                <div className="row" style={{ gap: 6 }}>{h.services.slice(0, 4).map((s) => <span key={s} className="pill">{s}</span>)}</div>
                <div className="row" style={{ marginTop: 'auto', paddingTop: 8, gap: 8 }}>
                  <Link className="btn btn-primary btn-sm" to={`${base}/hospitals/${h.id}?tab=book`}><CalendarPlus size={14} /> Book</Link>
                  <Link className="btn btn-outline btn-sm" to={`${base}/hospitals/${h.id}`}>View Details</Link>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setSel(h.id); setView('map'); }}><MapIcon size={14} /> View on Map</button>
                  <a className="btn btn-ghost btn-sm" href={directionsUrl(h)} target="_blank" rel="noreferrer"><Navigation size={14} /> Directions</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="tiny muted">Map and directions are prototype interactions: the map is a simplified drawing of Dhaka, and “Directions” opens Google Maps in a new tab.</p>
    </div>
  );
}

function timeSlots(open = '09:00', close = '21:00', step = 60) {
  const out = [];
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  for (let m = oh * 60 + om; m + step <= ch * 60 + cm; m += step) {
    const h = Math.floor(m / 60); const mm = m % 60;
    const h12 = ((h + 11) % 12) + 1;
    out.push(`${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`);
  }
  return out;
}
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BookingForm({ kind, provider, services, doctorsList, slotsFor, onDone, presetDoctor }) {
  const { db, set, notify, toast } = useApp();
  const myPets = db.pets;
  const [f, setF] = useState({ petId: myPets[0]?.id || '', service: services?.[0]?.name || 'Consultation', doctorId: presetDoctor || '', date: day(1), time: '', reason: '', notes: '', online: false });
  const [err, setErr] = useState({});
  const [loading, setLoading] = useState(false);
  const slots = slotsFor(f.date, f.doctorId);
  const taken = db.appointments.filter((a) => a.providerId === provider.id && a.date === f.date && ['Pending', 'Confirmed'].includes(a.status)).map((a) => a.time);
  const svc = services?.find((s) => s.name === f.service);
  const price = kind === 'doctor' ? provider.fee : svc?.price || 0;

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.petId) er.petId = 'Add a pet first, then book';
    if (!f.date || f.date < today()) er.date = 'Choose today or a future date';
    if (!f.time) er.time = 'Choose an available time';
    if (f.reason.trim().length < 5) er.reason = 'Briefly describe the reason for the visit';
    setErr(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => {
      const id = newId('A');
      const pet = myPets.find((p) => p.id === f.petId);
      set('appointments', (a) => [{
        id, kind, providerId: provider.id, doctorId: kind === 'doctor' ? provider.id : f.doctorId || null, petId: f.petId, petName: pet.name, petSpecies: pet.species, petBreed: pet.breed,
        service: kind === 'doctor' ? (f.online ? 'Online consultation' : 'Consultation') : f.service, date: f.date, time: f.time, reason: f.reason.trim(), notes: f.notes, status: 'Pending', price, owner: db.auth.name, ownerPhone: '+880 1712-345678', created: day(0), online: f.online,
      }, ...a]);
      notify(kind === 'doctor' ? 'doctor' : 'hospital', `New booking request ${id} from ${db.auth.name} for ${pet.name} on ${fmtDate(f.date)} at ${f.time}.`, kind === 'doctor' ? '/doctor/appointments' : '/hospital/appointments');
      notify('user', `Booking ${id} sent to ${provider.name}. You’ll be notified when it’s confirmed.`, '/user/appointments');
      toast(`Request sent. ${provider.name} will confirm shortly.`);
      setLoading(false);
      onDone(id);
    }, 600);
  };

  if (!myPets.length) return <Empty title="Add a pet to book" text="Bookings are linked to a pet profile so the vet can see its history." action={<Link to="/user/pets?add=1" className="btn btn-primary">Add a pet</Link>} />;

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="field">
        <span className="label">Which pet? <span className="req">*</span></span>
        <div className="choice-grid">
          {myPets.map((p) => (
            <button type="button" key={p.id} className={`choice ${f.petId === p.id ? 'on' : ''}`} onClick={() => setF({ ...f, petId: p.id })} aria-pressed={f.petId === p.id}>
              <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><Initials name={p.name} img={p.img} /><div><strong>{p.name}</strong><div className="tiny muted">{p.species} · {p.breed}</div></div></div>
            </button>
          ))}
        </div>
        {err.petId && <span className="error-text">{err.petId}</span>}
      </div>
      <div className="form-grid">
        {kind === 'hospital' && (
          <>
            <Field label="Service" required htmlFor="bk-svc"><select id="bk-svc" className="select" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}>{services.filter((s) => s.active !== false).map((s) => <option key={s.id} value={s.name}>{s.name} — {money(s.price)}</option>)}</select></Field>
            <Field label="Preferred doctor (optional)" htmlFor="bk-doc"><select id="bk-doc" className="select" value={f.doctorId} onChange={(e) => setF({ ...f, doctorId: e.target.value, time: '' })}><option value="">Any available doctor</option>{doctorsList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          </>
        )}
        {kind === 'doctor' && provider.online && (
          <div className="full field">
            <span className="label">Consultation type</span>
            <Seg value={f.online ? 'online' : 'clinic'} onChange={(v) => setF({ ...f, online: v === 'online' })} items={[{ value: 'clinic', label: 'In person' }, { value: 'online', label: 'Online (video)', icon: Video }]} />
          </div>
        )}
        <Field label="Date" required error={err.date} htmlFor="bk-date"><input id="bk-date" type="date" className={`input ${err.date ? 'invalid' : ''}`} min={today()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value, time: '' })} /></Field>
        <div className="field full">
          <span className="label">Available times <span className="req">*</span></span>
          {slots.length ? (
            <div className="slot-grid">
              {slots.map((s) => <button type="button" key={s} className={`slot ${f.time === s ? 'on' : ''}`} disabled={taken.includes(s)} onClick={() => setF({ ...f, time: s })} title={taken.includes(s) ? 'Already booked' : ''}>{s}</button>)}
            </div>
          ) : <div className="alert alert-warn small">No slots on this day (closed or on leave). Try another date.</div>}
          {err.time && <span className="error-text">{err.time}</span>}
        </div>
        <Field label="Reason for visit" required error={err.reason} full htmlFor="bk-reason"><textarea id="bk-reason" className={`textarea ${err.reason ? 'invalid' : ''}`} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Symptoms, how long, any medicines given" /></Field>
        <Field label="Notes for the provider (optional)" full htmlFor="bk-notes"><input id="bk-notes" className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="e.g. My dog is nervous with other dogs" /></Field>
      </div>
      <div className="row between card pad-sm" style={{ background: 'var(--bg)' }}>
        <div><div className="small muted">Estimated fee (pay at the {kind === 'doctor' && f.online ? 'consultation' : 'visit'})</div><div className="price-lg">{money(price)}</div></div>
        <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? <><span className="spinner" /> Sending…</> : 'Submit booking request'}</button>
      </div>
      <p className="tiny muted">Free cancellation up to {db.settings.cancellationHours} hours before the appointment. The provider may confirm, suggest a new time, or decline.</p>
    </form>
  );
}

function ProviderReviews({ type, id }) {
  const { db } = useApp();
  const list = db.reviews.filter((r) => r.targetType === type && r.targetId === id && r.status === 'Visible');
  if (!list.length) return <Empty title="No reviews yet" text="Reviews appear after completed appointments." />;
  return (
    <div className="stack">
      {list.map((r) => (
        <div key={r.id} className="card pad-sm stack sm">
          <div className="row between"><div className="row" style={{ gap: 8 }}><Initials name={r.by} /><strong className="small">{r.by}</strong></div><Stars value={r.rating} /></div>
          <p className="small">{r.text}</p>
          <span className="tiny muted">{fmtDate(r.date)}</span>
        </div>
      ))}
    </div>
  );
}

export function HospitalDetail({ base = '/user' }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { db } = useApp();
  const h = db.hospitals.find((x) => x.id === id);
  const [tab, setTab] = useState(params.get('tab') === 'book' ? 'book' : 'overview');
  const [gate, gateModal] = useAuthGate();
  const [report, setReport] = useState(false);
  if (!h) return <Empty title="Hospital not found" action={<Link to={`${base}/hospitals`} className="btn btn-primary">Back to hospitals</Link>} />;
  const services = db.hospitalServices.filter((s) => s.hospitalId === h.id).length ? db.hospitalServices.filter((s) => s.hospitalId === h.id) : [{ id: 'g1', name: 'General check-up', price: 700, duration: '30 min', active: true }, { id: 'g2', name: 'Vaccination', price: 600, duration: '15 min', active: true }];
  const docs = db.doctors.filter((d) => d.hospitalId === h.id);
  const hours = db.hospitalHours.days;
  const slotsFor = (date) => {
    const dow = DOW[new Date(`${date}T12:00:00`).getDay()];
    const r = h.id === 'h1' ? hours[dow] : ['09:00', '20:00'];
    if (!r) return [];
    if (db.hospitalHours.holidays.some((x) => x.date === date) && h.id === 'h1') return [];
    return timeSlots(r[0], r[1], 60);
  };

  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title={h.name} crumbs={[...crumbsFor(base, 'Find Pet Hospitals', `${base}/hospitals`), { label: h.name }]} actions={<>
        <a className="btn btn-outline" href={directionsUrl(h)} target="_blank" rel="noreferrer"><Navigation size={16} /> Get Directions</a>
        <button className="btn btn-primary" onClick={() => gate(() => setTab('book'), 'book an appointment')}><CalendarPlus size={16} /> Book Appointment</button>
      </>} />
      <div className="banner-img"><Img src={h.img} alt={h.name} /></div>
      <div className="split">
        <div className="stack lg">
          <Tabs value={tab} onChange={(t) => (t === 'book' ? gate(() => setTab('book'), 'book an appointment') : setTab(t))} items={[{ value: 'overview', label: 'Overview' }, { value: 'services', label: 'Services & Pricing' }, { value: 'doctors', label: 'Doctors & Staff', count: docs.length }, { value: 'reviews', label: 'Reviews' }, { value: 'book', label: 'Book' }]} />
          {tab === 'overview' && (
            <div className="card stack">
              <div className="row">{h.verified && <span className="verified"><BadgeCheck size={15} /> Verified by PetPaw</span>}<Stars value={h.rating} count={h.reviews} />{h.emergency && <Chip tone="bad">Emergency care</Chip>}</div>
              <p>{h.desc}</p>
              <h4>Facilities</h4>
              <div className="row" style={{ gap: 6 }}>{h.facilities.map((f) => <span key={f} className="pill">{f}</span>)}</div>
              <h4>Services</h4>
              <div className="row" style={{ gap: 6 }}>{h.services.map((f) => <span key={f} className="pill">{f}</span>)}</div>
            </div>
          )}
          {tab === 'services' && (
            <div className="table-wrap"><table className="table"><thead><tr><th>Service</th><th>Duration</th><th className="num">Price</th><th>Status</th></tr></thead><tbody>
              {services.map((s) => <tr key={s.id}><td><strong>{s.name}</strong>{s.desc && <div className="tiny muted">{s.desc}</div>}</td><td>{s.duration}</td><td className="num">{money(s.price)}</td><td><Chip status={s.active === false ? 'Paused' : 'Active'}>{s.active === false ? 'Not available' : 'Available'}</Chip></td></tr>)}
            </tbody></table></div>
          )}
          {tab === 'doctors' && (docs.length ? (
            <div className="grid g2">{docs.map((d) => (
              <Link key={d.id} to={`${base}/doctors/${d.id}`} className="card hover-card row" style={{ color: 'inherit', flexWrap: 'nowrap' }}>
                <Initials name={d.name} img={d.img} size="lg" />
                <div><strong>{d.name}</strong><div className="small" style={{ color: 'var(--green)' }}>{d.spec}</div><div className="small muted">{d.exp} yrs · {money(d.fee)}</div></div>
              </Link>
            ))}</div>
          ) : <div className="card"><Empty icon={Stethoscope} title="No doctors listed yet" /></div>)}
          {tab === 'reviews' && <ProviderReviews type="hospital" id={h.id} />}
          {tab === 'book' && db.auth && (
            <div className="card">
              <h3 style={{ marginBottom: 14 }}>Book an appointment</h3>
              <BookingForm kind="hospital" provider={h} services={services} doctorsList={docs} slotsFor={slotsFor} onDone={() => nav('/user/appointments')} />
            </div>
          )}
        </div>
        <div className="stack">
          <div className="card stack sm">
            <h4>Contact & hours</h4>
            <div className="small row" style={{ gap: 8, flexWrap: 'nowrap', alignItems: 'flex-start' }}><MapPin size={15} style={{ flexShrink: 0, marginTop: 3 }} /> {h.address}</div>
            <div className="small row" style={{ gap: 8 }}><Phone size={15} /> {h.phone}</div>
            <div className="small row" style={{ gap: 8 }}><Mail size={15} /> {h.email}</div>
            <div className="small row" style={{ gap: 8 }}><Clock size={15} /> {h.hours}</div>
          </div>
          <MapView side={false} height={260} items={[{ id: h.id, type: 'hospital', name: h.name, lat: h.lat, lng: h.lng, area: h.area, img: h.img, lines: [h.address] }]} selectedId={null} onSelect={() => {}} />
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--muted)' }} onClick={() => gate(() => setReport(true), 'report this provider')}><Flag size={14} /> Report this hospital or its location</button>
        </div>
      </div>
      <ReportModal open={report} onClose={() => setReport(false)} category="Provider" target={h.name} />
    </div>
  );
}

/* ======================= DOCTORS ======================= */
export function DoctorFinder({ base = '/user' }) {
  const { db } = useApp();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [spec, setSpec] = useState('');
  const [area, setArea] = useState('');
  const [hosp, setHosp] = useState('');
  const [maxFee, setMaxFee] = useState(2000);
  const [online, setOnline] = useState(false);
  const loading = useFakeLoad(400);
  const specs = [...new Set(db.doctors.map((d) => d.spec))];
  const list = db.doctors.filter((d) => (!q || `${d.name} ${d.spec} ${d.area}`.toLowerCase().includes(q.toLowerCase())) && (!spec || d.spec === spec) && (!area || d.area === area) && (!hosp || d.hospitalId === hosp) && d.fee <= maxFee && (!online || d.online));
  return (
    <div className="stack lg">
      <PageHeader title="Find Pet Doctors" crumbs={crumbsFor(base, 'Find Pet Doctors')} sub="Registered vets by specialization, location, hospital, fee and availability." />
      <div className="card pad-sm">
        <div className="grid g5" style={{ alignItems: 'end' }}>
          <Field label="Search" htmlFor="df-q"><input id="df-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doctor name or specialty" /></Field>
          <Field label="Specialization" htmlFor="df-s"><select id="df-s" className="select" value={spec} onChange={(e) => setSpec(e.target.value)}><option value="">All</option>{specs.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Location" htmlFor="df-a"><select id="df-a" className="select" value={area} onChange={(e) => setArea(e.target.value)}><option value="">All areas</option>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
          <Field label="Hospital" htmlFor="df-h"><select id="df-h" className="select" value={hosp} onChange={(e) => setHosp(e.target.value)}><option value="">Any</option>{db.hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field>
          <Field label={`Max fee: ${money(maxFee)}`} htmlFor="df-f"><input id="df-f" type="range" min="500" max="2000" step="100" value={maxFee} onChange={(e) => setMaxFee(Number(e.target.value))} style={{ accentColor: 'var(--green)' }} /></Field>
        </div>
        <label className="check" style={{ marginTop: 12 }}><input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} /> Offers online consultation</label>
      </div>
      {loading ? <div className="grid g3">{[1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 240 }} />)}</div> : list.length === 0 ? (
        <div className="card"><Empty icon={Stethoscope} title="No doctors match" text="Raise the fee limit or choose another specialization." /></div>
      ) : (
        <div className="grid g3">
          {list.map((d) => {
            const h = db.hospitals.find((x) => x.id === d.hospitalId);
            return (
              <div key={d.id} className="card stack">
                <div className="row" style={{ flexWrap: 'nowrap' }}>
                  <Initials name={d.name} img={d.img} size="lg" />
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 16 }}>{d.name}</h3>
                    <div className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>{d.spec}</div>
                    <div className="tiny muted">{d.qual}</div>
                  </div>
                </div>
                <div className="small muted">{d.exp} years experience · {h?.name || 'Independent'}</div>
                <div className="row between"><Stars value={d.rating} count={d.reviews} />{d.online && <span className="pill"><Video size={12} /> Online</span>}</div>
                <div className="small"><span className="muted">Next available: </span><strong>{d.slots[0]}</strong>, {d.slots.slice(1, 3).join(', ')}</div>
                <div className="row between" style={{ marginTop: 'auto' }}>
                  <span className="price">{money(d.fee)}</span>
                  <div className="row" style={{ gap: 6 }}>
                    <Link to={`${base}/doctors/${d.id}`} className="btn btn-outline btn-sm">Profile</Link>
                    <Link to={`${base}/doctors/${d.id}?tab=book`} className="btn btn-primary btn-sm">Book</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DoctorDetail({ base = '/user' }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { db } = useApp();
  const d = db.doctors.find((x) => x.id === id);
  const [tab, setTab] = useState(params.get('tab') === 'book' ? 'book' : 'about');
  const [gate, gateModal] = useAuthGate();
  if (!d) return <Empty title="Doctor not found" />;
  const h = db.hospitals.find((x) => x.id === d.hospitalId);
  const sched = db.doctorSchedule;
  const slotsFor = (date) => {
    if (d.id !== 'd1') return new Date(`${date}T12:00:00`).getDay() === 5 ? [] : d.slots;
    const dow = DOW[new Date(`${date}T12:00:00`).getDay()];
    if (sched.leave.some((l) => date >= l.from && date <= l.to)) return [];
    const r = sched.days[dow];
    return r ? timeSlots(r[0], r[1], sched.slotMinutes) : [];
  };
  const week = Array.from({ length: 7 }, (_, i) => day(i));
  return (
    <div className="stack lg">
      {gateModal}
      <PageHeader title={d.name} crumbs={[...crumbsFor(base, 'Find Pet Doctors', `${base}/doctors`), { label: d.name }]} actions={<button className="btn btn-primary" onClick={() => gate(() => setTab('book'), 'book a consultation')}><CalendarPlus size={16} /> Book Consultation</button>} />
      <div className="split">
        <div className="stack lg">
          <div className="card row top" style={{ flexWrap: 'nowrap', gap: 18 }}>
            <Initials name={d.name} img={d.img} size="lg" />
            <div className="stack sm" style={{ minWidth: 0 }}>
              <div className="row"><span className="verified"><BadgeCheck size={15} /> Verified · {d.bvc}</span><Stars value={d.rating} count={d.reviews} /></div>
              <div><strong style={{ color: 'var(--green)' }}>{d.spec}</strong> · {d.qual}</div>
              <div className="small muted">{d.exp} years experience · {h ? <Link to={`${base}/hospitals/${h.id}`}>{h.name}</Link> : 'Independent practice'}</div>
              <div className="price-lg">{money(d.fee)} <span className="small muted" style={{ fontWeight: 400 }}>per consultation</span></div>
            </div>
          </div>
          <Tabs value={tab} onChange={(t) => (t === 'book' ? gate(() => setTab('book'), 'book a consultation') : setTab(t))} items={[{ value: 'about', label: 'About' }, { value: 'schedule', label: 'Schedule' }, { value: 'reviews', label: 'Reviews' }, { value: 'book', label: 'Book' }]} />
          {tab === 'about' && <div className="card"><p>{d.about}</p></div>}
          {tab === 'schedule' && (
            <div className="card stack">
              {week.map((w) => {
                const s = slotsFor(w);
                return <div key={w} className="row between" style={{ borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}><strong className="small" style={{ width: 120 }}>{fmtDate(w)}</strong><span className="small muted grow">{s.length ? `${s.length} slots · ${s[0]} – ${s[s.length - 1]}` : 'Not available'}</span></div>;
              })}
            </div>
          )}
          {tab === 'reviews' && <ProviderReviews type="doctor" id={d.id} />}
          {tab === 'book' && db.auth && <div className="card"><h3 style={{ marginBottom: 14 }}>Book a consultation</h3><BookingForm kind="doctor" provider={d} slotsFor={slotsFor} onDone={() => nav('/user/appointments')} /></div>}
        </div>
        <div className="card stack sm">
          <h4>Today’s open slots</h4>
          <div className="slot-grid">{slotsFor(day(0)).slice(0, 8).map((s) => <span key={s} className="slot" style={{ cursor: 'default' }}>{s}</span>)}</div>
          {!slotsFor(day(0)).length && <p className="small muted">No slots today.</p>}
          {d.online && <div className="alert alert-info small"><Video size={16} /> Offers online video consultations.</div>}
        </div>
      </div>
    </div>
  );
}
