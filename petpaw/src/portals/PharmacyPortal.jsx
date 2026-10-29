import React, { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AlertTriangle, Ban, Banknote, Boxes, CheckCircle2, Edit3, FileText, Package, Pill, Plus, Save, ShieldCheck, Truck, XCircle, Clock } from 'lucide-react';
import PortalLayout from '../components/PortalLayout.jsx';
import { BarChart, Chip, Empty, Field, Modal, PageHeader, StatCard, Table, Tabs } from '../components/ui.jsx';
import { daysBetween, fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { medicineCategories } from '../data/mock.js';
import { LocationEditor, NotificationsPage, ProviderReviewsPage, SettingsPage, VerifiedBadge } from './shared.jsx';

const PID = 'ph1';
const crumbs = (label) => [{ label: 'Dashboard', to: '/pharmacy/dashboard' }, { label }];
const expState = (m) => (m.expiry < today() ? 'Expired' : daysBetween(today(), m.expiry) <= 60 ? 'Expiring soon' : 'OK');

function Dashboard() {
  const { db } = useApp();
  const meds = db.medicines.filter((m) => m.pharmacyId === PID);
  const orders = db.orders.filter((o) => o.source === 'pharmacy' && o.providerId === PID);
  const sales = orders.filter((o) => o.payment.startsWith('Paid')).reduce((s, o) => s + o.total, 0);
  return (
    <div className="stack lg">
      <PageHeader title={db.auth.name} sub={<span className="row" style={{ gap: 8 }}><VerifiedBadge pending={db.auth.pending} /> · Licence DGDA-VP-2219</span>} actions={<Link to="/pharmacy/prescriptions" className="btn btn-primary"><ShieldCheck size={16} /> Review prescriptions</Link>} />
      <div className="grid g5">
        <StatCard icon={Package} label="New orders" value={orders.filter((o) => o.status === 'New').length} to="/pharmacy/orders" />
        <StatCard icon={ShieldCheck} label="Pending Rx reviews" value={orders.filter((o) => o.status === 'Prescription review').length} tone="orange" to="/pharmacy/prescriptions" />
        <StatCard icon={Boxes} label="Low-stock items" value={meds.filter((m) => m.stock <= 10).length} tone="red" to="/pharmacy/stock" />
        <StatCard icon={Clock} label="Expiring in 60 days" value={meds.filter((m) => expState(m) === 'Expiring soon').length} tone="blue" to="/pharmacy/stock" />
        <StatCard icon={Banknote} label="Sales (paid orders)" value={money(sales)} tone="teal" to="/pharmacy/reports" />
      </div>
      {meds.some((m) => expState(m) === 'Expired') && <div className="alert alert-bad"><Ban size={18} /> <span>{meds.filter((m) => expState(m) === 'Expired').length} expired item(s) are blocked from sale and hidden from customers. <Link to="/pharmacy/stock">Review stock</Link></span></div>}
      <div className="split">
        <div className="card">
          <div className="card-title"><h3>Latest orders</h3><Link to="/pharmacy/orders" className="small">All orders</Link></div>
          <Table rows={orders} pageSize={5} columns={[{ label: 'Order', key: 'id' }, { label: 'Customer', key: 'customer' }, { label: 'Total', num: true, render: (o) => money(o.total) }, { label: 'Status', render: (o) => <Chip status={o.status} /> }]} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Recent activity</h3></div>
          <div className="stack sm">{(db.notifications.pharmacy || []).map((n) => <div key={n.id} className="small">{n.text}<div className="tiny muted">{n.at}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { db, set, toast } = useApp();
  const p = db.pharmacies.find((x) => x.id === PID);
  const [f, setF] = useState(p);
  const [err, setErr] = useState('');
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="stack lg">
      <PageHeader title="Pharmacy Profile" crumbs={crumbs('Pharmacy Profile')} actions={<button className="btn btn-primary" onClick={() => { if (f.address.trim().length < 10) return setErr('Enter a complete address'); setErr(''); set('pharmacies', (ps) => ps.map((x) => (x.id === PID ? f : x))); toast('Profile saved'); }}><Save size={16} /> Save</button>} />
      <div className="grid g2">
        <div className="card stack">
          <div className="row between"><h3>Business information</h3><VerifiedBadge pending={db.auth.pending} /></div>
          <div className="form-grid">
            <Field label="Pharmacy name" full htmlFor="pp-n"><input id="pp-n" className="input" value={f.name} onChange={up('name')} /></Field>
            <Field label="Phone" htmlFor="pp-p"><input id="pp-p" className="input" value={f.phone} onChange={up('phone')} /></Field>
            <Field label="Operating hours" htmlFor="pp-h"><input id="pp-h" className="input" value={f.hours} onChange={up('hours')} /></Field>
            <Field label="DGDA drug licence" hint="Contact support to update licence details" htmlFor="pp-l"><input id="pp-l" className="input" value={f.license} disabled /></Field>
            <Field label="Pharmacist in charge" htmlFor="pp-ph"><input id="pp-ph" className="input" defaultValue="Md. Saiful Islam (Reg. A-10422)" /></Field>
          </div>
        </div>
        <div className="card stack"><h3>Address & map location</h3><LocationEditor value={f} onChange={setF} error={err} /></div>
      </div>
    </div>
  );
}

function MedForm({ med, onDone }) {
  const { set, toast } = useApp();
  const [f, setF] = useState(med || { name: '', cat: medicineCategories[0], pack: '', price: '', stock: '', expiry: '', rx: false, desc: '' });
  const [err, setErr] = useState({});
  const up = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = () => {
    const er = {};
    if (!f.name.trim()) er.name = 'Enter the medicine name and strength';
    if (!(Number(f.price) > 0)) er.price = 'Enter a price';
    if (!(Number(f.stock) >= 0) || f.stock === '') er.stock = 'Enter stock quantity';
    if (!f.expiry) er.expiry = 'Enter the expiry date';
    else if (f.expiry < today()) er.expiry = 'Expired stock can’t be listed for sale';
    setErr(er);
    if (Object.keys(er).length) return;
    const rec = { ...f, price: Number(f.price), stock: Number(f.stock) };
    if (med) set('medicines', (m) => m.map((x) => (x.id === med.id ? rec : x)));
    else set('medicines', (m) => [{ ...rec, id: newId('m'), pharmacyId: PID }, ...m]);
    toast(med ? 'Medicine updated' : 'Medicine added to inventory');
    onDone();
  };
  return (
    <div className="stack">
      <div className="form-grid">
        <Field label="Medicine name & strength" required error={err.name} full htmlFor="md-n"><input id="md-n" className={`input ${err.name ? 'invalid' : ''}`} value={f.name} onChange={up('name')} placeholder="e.g. Meloxicam 1.5 mg/ml oral suspension" /></Field>
        <Field label="Category" htmlFor="md-c"><select id="md-c" className="select" value={f.cat} onChange={up('cat')}>{medicineCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Packaging" htmlFor="md-p"><input id="md-p" className="input" value={f.pack} onChange={up('pack')} placeholder="Strip of 10" /></Field>
        <Field label="Price (৳)" required error={err.price} htmlFor="md-pr"><input id="md-pr" type="number" min="0" className={`input ${err.price ? 'invalid' : ''}`} value={f.price} onChange={up('price')} /></Field>
        <Field label="Stock quantity" required error={err.stock} htmlFor="md-s"><input id="md-s" type="number" min="0" className={`input ${err.stock ? 'invalid' : ''}`} value={f.stock} onChange={up('stock')} /></Field>
        <Field label="Expiry date" required error={err.expiry} htmlFor="md-e"><input id="md-e" type="date" className={`input ${err.expiry ? 'invalid' : ''}`} value={f.expiry} onChange={up('expiry')} /></Field>
        <Field label="Description & product information" full htmlFor="md-d"><textarea id="md-d" className="textarea" value={f.desc} onChange={up('desc')} /></Field>
        <label className="check full"><input type="checkbox" checked={f.rx} onChange={up('rx')} /> <span><strong>Prescription required</strong> — customers must provide a valid vet prescription, which you review before dispensing.</span></label>
      </div>
      <div className="row end"><button className="btn btn-primary" onClick={save}><Save size={16} /> Save medicine</button></div>
    </div>
  );
}

function Inventory() {
  const { db } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [stock, setStock] = useState('');
  const [edit, setEdit] = useState(null);
  const list = db.medicines.filter((m) => m.pharmacyId === PID && (!q || m.name.toLowerCase().includes(q.toLowerCase())) && (!cat || m.cat === cat) && (!stock || (stock === 'low' ? m.stock <= 10 : stock === 'out' ? m.stock === 0 : expState(m) !== 'OK')));
  return (
    <div className="stack lg">
      <PageHeader title="Medicine Inventory" crumbs={crumbs('Medicine Inventory')} sub="Pharmacy medicines only. Pet Shop products are managed separately." actions={<Link to="/pharmacy/add" className="btn btn-primary"><Plus size={16} /> Add medicine</Link>} />
      <div className="card pad-sm grid g3" style={{ alignItems: 'end' }}>
        <Field label="Search" htmlFor="iv-q"><input id="iv-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} /></Field>
        <Field label="Category" htmlFor="iv-c"><select id="iv-c" className="select" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All</option>{medicineCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Stock / expiry" htmlFor="iv-s"><select id="iv-s" className="select" value={stock} onChange={(e) => setStock(e.target.value)}><option value="">All</option><option value="low">Low stock (≤10)</option><option value="out">Out of stock</option><option value="exp">Expiring or expired</option></select></Field>
      </div>
      <Table rows={list} onRow={setEdit} pageSize={10} columns={[
        { label: 'Medicine', render: (m) => <div><strong>{m.name}</strong> {m.rx && <span className="rx">Rx</span>}<div className="tiny muted">{m.pack}</div></div> },
        { label: 'Category', key: 'cat' }, { label: 'Price', num: true, render: (m) => money(m.price) },
        { label: 'Stock', num: true, render: (m) => <span style={{ color: m.stock <= 10 ? 'var(--bad)' : undefined, fontWeight: m.stock <= 10 ? 700 : 400 }}>{m.stock}</span> },
        { label: 'Expiry', render: (m) => <span className="num">{fmtDate(m.expiry)}</span> },
        { label: 'Sale status', render: (m) => (expState(m) === 'Expired' ? <Chip status="Expired">Blocked — expired</Chip> : m.stock === 0 ? <Chip status="Out of stock" /> : expState(m) === 'Expiring soon' ? <Chip status="Expiring soon" /> : <Chip status="Active">On sale</Chip>) },
        { label: '', render: () => <Edit3 size={14} color="var(--muted)" /> },
      ]} />
      <Modal open={!!edit} wide onClose={() => setEdit(null)} title={`Edit ${edit?.name}`}>{edit && <MedForm med={edit} onDone={() => setEdit(null)} />}</Modal>
    </div>
  );
}

function AddMedicine() {
  const nav = useNavigate();
  return (
    <div className="stack lg">
      <PageHeader title="Add Medicine" crumbs={crumbs('Add Medicine')} />
      <div className="card"><MedForm onDone={() => nav('/pharmacy/inventory')} /></div>
    </div>
  );
}

function Categories({ items, setKey, crumbsLabel, base, cats, idKey, crumbsArr }) {
  const { db, set, toast } = useApp();
  const [adj, setAdj] = useState({});
  return (
    <div className="stack lg">
      <PageHeader title="Categories & Pricing" crumbs={crumbsArr || crumbs(crumbsLabel)} sub="Adjust prices for a whole category at once. Changes apply to new orders only." />
      <Table rows={cats.map((c) => ({ id: c, name: c, list: items.filter((m) => m.cat === c) }))} columns={[
        { label: 'Category', render: (r) => <strong>{r.name}</strong> },
        { label: 'Items', num: true, render: (r) => r.list.length },
        { label: 'Price range', render: (r) => (r.list.length ? `${money(Math.min(...r.list.map((m) => m.price)))} – ${money(Math.max(...r.list.map((m) => m.price)))}` : '—') },
        { label: 'Adjust prices', render: (r) => <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><input type="number" className="input" style={{ width: 90 }} value={adj[r.id] ?? ''} onChange={(e) => setAdj({ ...adj, [r.id]: e.target.value })} placeholder="±%" aria-label={`Percent change for ${r.name}`} /><button className="btn btn-outline btn-sm" disabled={!adj[r.id] || !r.list.length} onClick={() => { const pct = Number(adj[r.id]); set(setKey, (all) => all.map((m) => (m[idKey] === base && m.cat === r.id ? { ...m, price: Math.max(1, Math.round(m.price * (1 + pct / 100))) } : m))); setAdj({ ...adj, [r.id]: '' }); toast(`${r.name}: prices ${pct > 0 ? 'increased' : 'reduced'} by ${Math.abs(pct)}%`); }}>Apply</button></div> },
      ]} />
    </div>
  );
}

function StockExpiry() {
  const { db, set, toast, confirm } = useApp();
  const meds = db.medicines.filter((m) => m.pharmacyId === PID);
  const [restock, setRestock] = useState({});
  const low = meds.filter((m) => m.stock <= 10 && expState(m) !== 'Expired');
  const soon = meds.filter((m) => expState(m) === 'Expiring soon');
  const expired = meds.filter((m) => expState(m) === 'Expired');
  return (
    <div className="stack lg">
      <PageHeader title="Stock & Expiry" crumbs={crumbs('Stock & Expiry')} />
      <div className="alert alert-bad"><Ban size={18} /> Expired medicines are automatically blocked from sale and hidden from customers.</div>
      <div className="card stack">
        <h3>Expired ({expired.length})</h3>
        {expired.length ? expired.map((m) => <div key={m.id} className="doc-thumb"><span className="grow small"><strong>{m.name}</strong> · expired {fmtDate(m.expiry)} · {m.stock} units</span><Chip status="Expired">Not for sale</Chip><button className="btn btn-danger-outline btn-sm" onClick={() => confirm({ title: `Dispose ${m.name}?`, body: 'Record disposal and remove this batch from inventory.', danger: true, confirmLabel: 'Record disposal', onConfirm: () => { set('medicines', (x) => x.filter((y) => y.id !== m.id)); toast('Disposal recorded'); } })}>Record disposal</button></div>) : <p className="small muted">No expired stock.</p>}
      </div>
      <div className="grid g2">
        <div className="card stack">
          <h3>Low stock ({low.length})</h3>
          {low.map((m) => <div key={m.id} className="doc-thumb"><span className="grow small"><strong>{m.name}</strong> · {m.stock} left</span><input type="number" min="1" className="input" style={{ width: 80 }} placeholder="+qty" value={restock[m.id] || ''} onChange={(e) => setRestock({ ...restock, [m.id]: e.target.value })} aria-label={`Restock ${m.name}`} /><button className="btn btn-outline btn-sm" disabled={!(Number(restock[m.id]) > 0)} onClick={() => { set('medicines', (x) => x.map((y) => (y.id === m.id ? { ...y, stock: y.stock + Number(restock[m.id]) } : y))); setRestock({ ...restock, [m.id]: '' }); toast('Stock updated'); }}>Restock</button></div>)}
          {!low.length && <p className="small muted">All items are well stocked.</p>}
        </div>
        <div className="card stack">
          <h3>Expiring within 60 days ({soon.length})</h3>
          {soon.map((m) => <div key={m.id} className="doc-thumb"><span className="grow small"><strong>{m.name}</strong> · expires {fmtDate(m.expiry)}</span><Chip status="Expiring soon">{daysBetween(today(), m.expiry)} days</Chip></div>)}
          {!soon.length && <p className="small muted">Nothing expiring soon.</p>}
        </div>
      </div>
    </div>
  );
}

function RxOrders() {
  const { db, set, notify, toast, confirm } = useApp();
  const [tab, setTab] = useState('Prescription review');
  const [open, setOpen] = useState(null);
  const all = db.orders.filter((o) => o.source === 'pharmacy' && o.providerId === PID && (o.rxFile || o.rxId));
  const list = all.filter((o) => tab === 'All' || o.status === tab);
  const o = open && db.orders.find((x) => x.id === open);
  const rx = o?.rxId && db.prescriptions.find((r) => r.id === o.rxId);
  const decide = (ok, reason) => {
    set('orders', (os) => os.map((x) => (x.id === o.id ? { ...x, status: ok ? 'Approved — awaiting payment' : 'Rejected', rejectReason: reason, rxCheckedBy: db.auth.name } : x)));
    notify('user', ok ? `Prescription for ${o.id} approved. Pay to have it prepared.` : `Order ${o.id} couldn’t be dispensed: ${reason}`, '/user/orders');
    toast(ok ? 'Prescription approved. Customer asked to pay.' : 'Order rejected. Customer notified.', ok ? 'ok' : 'info');
    setOpen(null);
  };
  return (
    <div className="stack lg">
      <PageHeader title="Prescription Orders" crumbs={crumbs('Prescription Orders')} sub="Check that each prescription is valid, matches the pet and medicine, and is from a registered vet." />
      <Tabs value={tab} onChange={setTab} items={['Prescription review', 'Approved — awaiting payment', 'Rejected', 'All'].map((s) => ({ value: s, label: s === 'Prescription review' ? 'Needs review' : s, count: s === 'All' ? all.length : all.filter((x) => x.status === s).length }))} />
      <Table rows={list} onRow={(r) => setOpen(r.id)} empty={<Empty icon={ShieldCheck} title="No prescriptions waiting" />} columns={[
        { label: 'Order', render: (r) => <strong>{r.id}</strong> }, { label: 'Customer', key: 'customer' }, { label: 'Rx items', render: (r) => <span className="small">{r.items.filter((i) => i.rx).map((i) => i.name).join(', ')}</span> },
        { label: 'Prescription', render: (r) => <span className="small">{r.rxId ? `PetPaw ${r.rxId}` : `Upload: ${r.rxFile}`}</span> }, { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
      {o && (
        <Modal open wide onClose={() => setOpen(null)} title={`Review ${o.id}`} footer={o.status === 'Prescription review' && <>
          <button className="btn btn-danger-outline" onClick={() => confirm({ title: 'Reject dispensing?', body: 'The customer is told why and is not charged.', requireReason: true, reasonLabel: 'Reason shown to customer', reasonPlaceholder: 'e.g. Prescription is for a different pet / dose unclear / not signed', danger: true, confirmLabel: 'Reject', onConfirm: (r) => decide(false, r) })}><XCircle size={15} /> Reject</button>
          <button className="btn btn-primary" onClick={() => decide(true)}><CheckCircle2 size={15} /> Approve dispensing</button>
        </>}>
          <div className="split">
            <div className="stack">
              {rx ? (
                <div className="rx-paper stack sm">
                  <div className="row between"><strong>{db.doctors.find((d) => d.id === rx.doctorId)?.name}</strong><span className="verified"><ShieldCheck size={14} /> Issued on PetPaw</span></div>
                  <div className="small muted">{rx.id} · {fmtDate(rx.date)} · Patient: {rx.petName} · Owner: {rx.owner}</div>
                  <div className="small"><strong>Diagnosis:</strong> {rx.diagnosis}</div>
                  {rx.items.map((i) => <div key={i.med} className="small">• <strong>{i.med}</strong> — {i.dose}, {i.freq}, {i.duration}</div>)}
                </div>
              ) : (
                <div className="stack sm">
                  <div className="doc-thumb"><FileText size={15} /> {o.rxFile}</div>
                  <div style={{ aspectRatio: '4/3', background: 'var(--bg)', border: '1px dashed var(--line)', borderRadius: 12, display: 'grid', placeItems: 'center' }} className="small muted">Uploaded prescription preview (prototype)</div>
                  <div className="alert alert-warn small"><AlertTriangle size={16} /> Uploaded prescription. Check vet registration number, date, pet name and signature.</div>
                </div>
              )}
            </div>
            <div className="stack sm">
              <h4>Order items</h4>
              {o.items.map((i) => <div key={i.id} className="row between small"><span>{i.qty} × {i.name} {i.rx && <span className="rx">Rx</span>}</span><span className="num">{money(i.qty * i.price)}</span></div>)}
              <div className="row between"><strong>Total</strong><strong className="num">{money(o.total)}</strong></div>
              <dl className="kv" style={{ gridTemplateColumns: '90px 1fr', marginTop: 8 }}><dt>Customer</dt><dd>{o.customer}</dd><dt>Delivery</dt><dd>{o.delivery} · {o.address}</dd><dt>Payment</dt><dd>{o.payment}</dd></dl>
              {o.rejectReason && <div className="alert alert-bad small">Rejected: {o.rejectReason}</div>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function OrdersTable({ source, providerId, crumbsArr, title = 'Orders', statuses }) {
  const { db, set, notify, toast } = useApp();
  const [tab, setTab] = useState('All');
  const [open, setOpen] = useState(null);
  const all = db.orders.filter((o) => o.source === source && o.providerId === providerId);
  const list = all.filter((o) => tab === 'All' || o.status === tab);
  const o = open && db.orders.find((x) => x.id === open);
  const update = (status) => {
    set('orders', (os) => os.map((x) => (x.id === o.id ? { ...x, status } : x)));
    notify('user', `Order ${o.id} is now: ${status}.`, '/user/orders');
    toast(`${o.id}: ${status}`);
  };
  return (
    <div className="stack lg">
      <PageHeader title={title} crumbs={crumbsArr} />
      <Tabs value={tab} onChange={setTab} items={['All', ...statuses].map((s) => ({ value: s, label: s, count: s === 'All' ? all.length : all.filter((x) => x.status === s).length }))} />
      <Table rows={list} onRow={(r) => setOpen(r.id)} empty={<Empty icon={Package} title="No orders in this view" />} columns={[
        { label: 'Order', render: (r) => <strong>{r.id}</strong> }, { label: 'Date', render: (r) => fmtDate(r.date) }, { label: 'Customer', key: 'customer' },
        { label: 'Items', render: (r) => r.items.reduce((s, i) => s + i.qty, 0) }, { label: 'Total', num: true, render: (r) => money(r.total) },
        { label: 'Payment', render: (r) => <span className="small">{r.payment}</span> }, { label: 'Fulfilment', render: (r) => <span className="small">{r.delivery}</span> }, { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
      {o && (
        <Modal open wide onClose={() => setOpen(null)} title={`Order ${o.id}`}>
          <div className="split">
            <div className="stack sm">
              {o.items.map((i) => <div key={i.id} className="row between small"><span>{i.qty} × {i.name} {i.rx && <span className="rx">Rx</span>}</span><span className="num">{money(i.qty * i.price)}</span></div>)}
              <div className="row between" style={{ borderTop: '1px dashed var(--line)', paddingTop: 8 }}><strong>Total</strong><strong className="num">{money(o.total)}</strong></div>
              <dl className="kv" style={{ gridTemplateColumns: '100px 1fr', marginTop: 8 }}><dt>Customer</dt><dd>{o.customer} · {o.phone}</dd><dt>Fulfilment</dt><dd>{o.delivery}</dd><dt>Address</dt><dd>{o.address}</dd><dt>Payment</dt><dd>{o.payment}</dd></dl>
            </div>
            <div className="stack">
              <Field label="Update status" htmlFor="os-s">
                <select id="os-s" className="select" value={o.status} onChange={(e) => update(e.target.value)} disabled={o.status === 'Prescription review'}>
                  {[...new Set([o.status, ...statuses])].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              {o.status === 'Prescription review' && <div className="alert alert-warn small">Review the prescription first in Prescription Orders.</div>}
              <span className="tiny muted">The customer is notified of every status change.</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function DeliveryBoard({ source, providerId, crumbsArr, title = 'Delivery Management', extra }) {
  const { db, set, toast, notify } = useApp();
  const [rider, setRider] = useState({});
  const list = db.orders.filter((o) => o.source === source && o.providerId === providerId && ['Preparing', 'Processing', 'Out for delivery', 'Ready for pickup', 'Dispatched'].includes(o.status));
  const upd = (o, status, patch = {}) => { set('orders', (os) => os.map((x) => (x.id === o.id ? { ...x, status, ...patch } : x))); notify('user', `Order ${o.id}: ${status}.`, '/user/orders'); toast(`${o.id}: ${status}`); };
  return (
    <div className="stack lg">
      <PageHeader title={title} crumbs={crumbsArr} />
      {extra}
      {list.length === 0 ? <div className="card"><Empty icon={Truck} title="Nothing to dispatch" text="Orders being prepared or out for delivery appear here." /></div> : (
        <div className="grid g3">
          {list.map((o) => (
            <div key={o.id} className="card stack sm">
              <div className="row between"><strong>{o.id}</strong><Chip status={o.status} /></div>
              <div className="small">{o.customer} · {o.phone}</div>
              <div className="small muted">{o.delivery} · {o.address}</div>
              <div className="small">{o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</div>
              {o.rider && <div className="tiny muted">Rider: {o.rider}</div>}
              {o.delivery === 'Home delivery' ? (
                ['Preparing', 'Processing'].includes(o.status) ? (
                  <div className="row"><input className="input grow" placeholder="Rider name / courier" value={rider[o.id] || ''} onChange={(e) => setRider({ ...rider, [o.id]: e.target.value })} aria-label="Rider" /><button className="btn btn-primary btn-sm" disabled={!rider[o.id]} onClick={() => upd(o, 'Out for delivery', { rider: rider[o.id] })}>Dispatch</button></div>
                ) : <button className="btn btn-primary btn-sm" onClick={() => upd(o, 'Delivered')}>Mark delivered</button>
              ) : (
                o.status !== 'Ready for pickup' ? <button className="btn btn-outline btn-sm" onClick={() => upd(o, 'Ready for pickup')}>Ready for pickup</button> : <button className="btn btn-primary btn-sm" onClick={() => upd(o, 'Completed')}>Picked up</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SalesReports() {
  const { db } = useApp();
  const meds = db.medicines.filter((m) => m.pharmacyId === PID);
  const sales = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({ label: m, value: 42000 + i * 6100 + (i % 2) * 4000 }));
  const byCat = medicineCategories.map((c) => ({ label: c.split(' ')[0], value: meds.filter((m) => m.cat === c).reduce((s, m) => s + m.stock, 0) }));
  return (
    <div className="stack lg">
      <PageHeader title="Sales & Reports" crumbs={crumbs('Sales & Reports')} />
      <div className="grid g2">
        <div className="card"><div className="card-title"><h3>Monthly sales</h3></div><BarChart data={sales} valueFmt={(v) => `${Math.round(v / 1000)}k`} /></div>
        <div className="card"><div className="card-title"><h3>Units in stock by category</h3></div><BarChart data={byCat} color="#2a6fb0" /></div>
      </div>
      <p className="tiny muted">Monthly sales use sample figures.</p>
    </div>
  );
}

export default function PharmacyPortal() {
  const { db } = useApp();
  return (
    <Routes>
      <Route element={<PortalLayout portal="pharmacy" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="add" element={<AddMedicine />} />
        <Route path="categories" element={<Categories items={db.medicines.filter((m) => m.pharmacyId === PID)} setKey="medicines" crumbsLabel="Categories & Pricing" base={PID} idKey="pharmacyId" cats={medicineCategories} />} />
        <Route path="stock" element={<StockExpiry />} />
        <Route path="prescriptions" element={<RxOrders />} />
        <Route path="orders" element={<OrdersTable source="pharmacy" providerId={PID} crumbsArr={crumbs('Orders')} statuses={['New', 'Prescription review', 'Approved — awaiting payment', 'Preparing', 'Out for delivery', 'Delivered', 'Rejected', 'Cancelled']} />} />
        <Route path="delivery" element={<DeliveryBoard source="pharmacy" providerId={PID} crumbsArr={crumbs('Delivery Management')} />} />
        <Route path="reviews" element={<ProviderReviewsPage portal="pharmacy" type="pharmacy" id={PID} name={db.auth?.name || 'your pharmacy'} />} />
        <Route path="reports" element={<SalesReports />} />
        <Route path="notifications" element={<NotificationsPage portal="pharmacy" />} />
        <Route path="settings" element={<SettingsPage portal="pharmacy" />} />
        <Route path="*" element={<Empty title="Page not found" />} />
      </Route>
    </Routes>
  );
}

export { Categories };
