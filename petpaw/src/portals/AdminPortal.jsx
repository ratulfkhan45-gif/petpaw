import React, { useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import {
  Activity, AlertTriangle, BadgeCheck, Ban, CalendarDays, CheckCircle2, Eye, EyeOff, FileText, Flag, HeartHandshake, Hospital,
  Lock, Megaphone, Package, Paperclip, Pill, RotateCcw, Save, ShieldCheck, Stethoscope, Store, Undo2, Users, X, Plus,
} from 'lucide-react';
import { api } from '../api.js';
import PortalLayout from '../components/PortalLayout.jsx';
import { BarChart, Chip, Empty, Field, Img, Legend, LineChart, Modal, PageHeader, Stars, StatCard, Table, Tabs } from '../components/ui.jsx';
import { borrowCost, fmtDate, money, newId, today, useApp } from '../context/AppContext.jsx';
import { day, medicineCategories, productCategories } from '../data/mock.js';
import { NotificationsPage } from './shared.jsx';

const crumbs = (label) => [{ label: 'Dashboard', to: '/admin/dashboard' }, { label }];

function Dashboard() {
  const { db } = useApp();
  const pending = db.applications.filter((a) => a.status === 'Pending Verification');
  const activeBorrow = db.borrowRequests.filter((r) => r.status === 'Active').length;
  const upcomingBorrow = db.borrowRequests.filter((r) => r.status === 'Confirmed').length;
  const openReports = db.reports.filter((r) => r.status !== 'Resolved');
  return (
    <div className="stack lg">
      <PageHeader title="Admin dashboard" sub="Platform health at a glance. Ordinary bookings and orders are handled by providers; you step in for verification, moderation and disputes." />
      <div className="grid g4">
        <StatCard icon={Users} label="Total users" value={db.users.length + 1240} hint={`${db.users.filter((u) => u.status === 'Active').length + 1102} active`} to="/admin/users" />
        <StatCard icon={BadgeCheck} label="Pending provider applications" value={pending.length} tone="orange" to="/admin/verification" />
        <StatCard icon={Megaphone} label="Active pet ads" value={db.ads.filter((a) => a.status === 'Active').length} tone="blue" to="/admin/ads" />
        <StatCard icon={HeartHandshake} label="Pet Borrow: active / upcoming" value={`${activeBorrow} / ${upcomingBorrow}`} tone="teal" to="/admin/borrow" />
      </div>
      <div className="grid g4">
        <StatCard icon={Hospital} label="Verified hospitals" value={db.hospitals.filter((h) => h.verified).length} />
        <StatCard icon={Stethoscope} label="Verified doctors" value={db.doctors.length} tone="teal" />
        <StatCard icon={Pill} label="Verified pharmacies" value={db.pharmacies.length} tone="blue" />
        <StatCard icon={Store} label="Verified pet shops" value={db.shops.length} tone="orange" />
      </div>
      <div className="grid g2">
        <div className="card">
          <div className="card-title"><h3>Appointments</h3><Link to="/admin/appointments" className="small">Overview</Link></div>
          <div className="grid g4">{['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => <div key={s}><div className="price-lg">{db.appointments.filter((a) => a.status === s).length}</div><Chip status={s} /></div>)}</div>
        </div>
        <div className="card">
          <div className="card-title"><h3>Orders</h3><Link to="/admin/orders" className="small">Overview</Link></div>
          <div className="grid g4">{['New', 'Prescription review', 'Out for delivery', 'Completed'].map((s) => <div key={s}><div className="price-lg">{db.orders.filter((a) => a.status === s).length}</div><Chip status={s} /></div>)}</div>
        </div>
      </div>
      <div className="split">
        <div className="card">
          <div className="card-title"><h3>Recent reports & complaints</h3><Link to="/admin/reports" className="small">All reports</Link></div>
          <Table rows={openReports} pageSize={5} empty={<Empty icon={Flag} title="No open reports" />} columns={[
            { label: 'ID', key: 'id' }, { label: 'Type', key: 'category' }, { label: 'About', render: (r) => <span className="small">{r.target}</span> }, { label: 'Priority', render: (r) => <Chip status={r.priority} /> }, { label: 'Status', render: (r) => <Chip status={r.status} /> },
          ]} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Recent activity</h3><Link to="/admin/activity" className="small">Logs</Link></div>
          <div className="stack sm">{db.activity.slice(0, 6).map((a, i) => <div key={i} className="small" style={{ borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}><strong>{a.who}</strong> {a.action}<div className="tiny muted">{a.at}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Users ---------- */
function UserManagement() {
  const { db, set, confirm, toast, log } = useApp();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(null);
  const list = db.users.filter((u) => (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) && (!type || u.type === type) && (!status || u.status === status));
  const u = open && db.users.find((x) => x.id === open);
  const act = (u, s, verb) => confirm({ title: `${verb} ${u.name}?`, body: s === 'Active' ? 'The account regains full access.' : s === 'Restricted' ? 'They can sign in and browse but can’t post ads, borrow pets or message.' : 'They will be signed out and can’t sign in until reactivated.', requireReason: s !== 'Active', reasonLabel: 'Reason (recorded in the activity log)', danger: s === 'Suspended', confirmLabel: verb, warning: 'Suspension blocks all access to the account.', onConfirm: (reason) => { set('users', (us) => us.map((x) => (x.id === u.id ? { ...x, status: s } : x))); log(`${verb} account ${u.id} (${u.name})${reason ? ` — ${reason}` : ''}`); toast(`${u.name}: ${s}`); } });
  const complaints = u ? db.reports.filter((r) => r.by === u.name || r.target.includes(u.name)) : [];
  return (
    <div className="stack lg">
      <PageHeader title="User Management" crumbs={crumbs('User Management')} />
      <div className="card pad-sm grid g3" style={{ alignItems: 'end' }}>
        <Field label="Search" htmlFor="um-q"><input id="um-q" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" /></Field>
        <Field label="Account type" htmlFor="um-t"><select id="um-t" className="select" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{['User', 'Pet Hospital', 'Pet Doctor', 'Pharmacy', 'Pet Shop'].map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Status" htmlFor="um-s"><select id="um-s" className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option><option>Active</option><option>Restricted</option><option>Suspended</option></select></Field>
      </div>
      <Table rows={list} onRow={(r) => setOpen(r.id)} columns={[
        { label: 'Name', render: (r) => <div><strong>{r.name}</strong><div className="tiny muted">{r.email}</div></div> },
        { label: 'Type', key: 'type' }, { label: 'Registered', render: (r) => fmtDate(r.joined) }, { label: 'Activity', render: (r) => <span className="small muted">{r.activity}</span> },
        { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
      {u && (
        <Modal open wide onClose={() => setOpen(null)} title={u.name} footer={<>
          {u.status !== 'Active' && <button className="btn btn-primary" onClick={() => act(u, 'Active', 'Reactivate')}><Undo2 size={15} /> Reactivate</button>}
          {u.status === 'Active' && <button className="btn btn-outline" onClick={() => act(u, 'Restricted', 'Restrict')}>Restrict</button>}
          {u.status !== 'Suspended' && <button className="btn btn-danger" onClick={() => act(u, 'Suspended', 'Suspend')}><Ban size={15} /> Suspend</button>}
        </>}>
          <div className="stack">
            <dl className="kv"><dt>ID</dt><dd>{u.id}</dd><dt>Email</dt><dd>{u.email}</dd><dt>Account type</dt><dd>{u.type}</dd><dt>Status</dt><dd><Chip status={u.status} /></dd><dt>Registered</dt><dd>{fmtDate(u.joined)}</dd><dt>Activity</dt><dd>{u.activity}</dd></dl>
            <h4>Complaint history</h4>
            {complaints.length ? complaints.map((c) => <div key={c.id} className="doc-thumb"><Flag size={14} /> <span className="grow">{c.id} · {c.detail}</span><Chip status={c.status} /></div>) : <p className="small muted">No complaints involving this account.</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Provider verification ---------- */
function Verification() {
  const { db, set, toast, log, notify, confirm } = useApp();
  const [tab, setTab] = useState('Pending Verification');
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');
  const list = db.applications.filter((a) => tab === 'All' || a.status === tab);
  const app = db.applications.find((a) => a.id === (sel || list[0]?.id));
  const decide = async (status, notes) => {
    try {
      const { application } = await api.patch(`/admin/applications/${app.id}`, { status, notes });
      set('applications', (as) => as.map((a) => (a.id === app.id ? application : a)));
      log(`${status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Requested corrections on'} provider application ${app.id} (${app.name})`);
      toast(`${app.id}: ${status}`);
      setNote('');
      setSel(null);
    } catch (ex) {
      toast(ex.errors?.notes?.[0] || ex.message, 'bad');
    }
  };
  return (
    <div className="stack lg">
      <PageHeader title="Provider Verification" crumbs={crumbs('Provider Verification')} sub="Only approved providers receive the Verified badge and appear as verified to pet owners." />
      <Tabs value={tab} onChange={(t) => { setTab(t); setSel(null); }} items={['Pending Verification', 'Corrections Requested', 'Approved', 'Rejected', 'All'].map((s) => ({ value: s, label: s === 'Pending Verification' ? 'Pending' : s, count: s === 'All' ? db.applications.length : db.applications.filter((a) => a.status === s).length }))} />
      {list.length === 0 ? <div className="card"><Empty icon={BadgeCheck} title="Nothing to review" text="New applications appear here." /></div> : (
        <div className="split" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)' }}>
          <div className="stack sm">
            {list.map((a) => (
              <button key={a.id} className="card pad-sm" style={{ textAlign: 'left', cursor: 'pointer', borderColor: app?.id === a.id ? 'var(--green)' : undefined, background: app?.id === a.id ? 'var(--green-50)' : undefined }} onClick={() => setSel(a.id)}>
                <div className="row between"><strong className="small">{a.name}</strong><Chip status={a.status} /></div>
                <div className="tiny muted">{a.type} · {a.area} · submitted {fmtDate(a.submitted)} · {a.id}</div>
              </button>
            ))}
          </div>
          {app && (
            <div className="card stack">
              <div className="row between"><div><h3>{app.name}</h3><div className="small muted">{app.type} · {app.id}</div></div><Chip status={app.status} /></div>
              <dl className="kv"><dt>Contact person</dt><dd>{app.contact}</dd><dt>Email</dt><dd>{app.email}</dd><dt>Phone</dt><dd>{app.phone}</dd><dt>Area</dt><dd>{app.area}</dd>{app.licence && <><dt>Licence / reg. no.</dt><dd>{app.licence}</dd></>}{app.address && <><dt>Address</dt><dd>{app.address}</dd></>}<dt>Submitted</dt><dd>{fmtDate(app.submitted)}</dd></dl>
              <h4>Documents</h4>
              <div className="stack sm">
                {(app.documents || []).length === 0 && <span className="small muted">No files were uploaded for this application (sample data).</span>}
                {(app.documents || []).map((d) => <div key={d.id} className="doc-thumb"><Paperclip size={14} /> <span className="grow"><strong>{d.label}:</strong> {d.name}</span><button className="btn btn-ghost btn-sm" onClick={() => api.openFile(`/admin/applications/${app.id}/documents/${d.id}`).catch((e) => toast(e.message, 'bad'))}><Eye size={14} /> View</button></div>)}
              </div>
              {app.notes && <div className="alert alert-info small"><FileText size={16} /> <span><strong>Reviewer notes:</strong> {app.notes}</span></div>}
              {['Pending Verification', 'Corrections Requested'].includes(app.status) && (
                <>
                  <Field label="Reviewer note (sent to the applicant)" htmlFor="v-note"><textarea id="v-note" className="textarea" style={{ minHeight: 70 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Registration number matches the BVC register." /></Field>
                  <div className="row">
                    <button className="btn btn-primary" onClick={() => decide('Approved', note || 'All documents valid.')}><CheckCircle2 size={16} /> Approve</button>
                    <button className="btn btn-outline" disabled={!note.trim()} onClick={() => decide('Corrections Requested', note)}>Request corrections</button>
                    <button className="btn btn-danger-outline" onClick={() => confirm({ title: `Reject ${app.name}?`, body: 'The applicant will be notified and cannot operate as a verified provider.', requireReason: true, reasonLabel: 'Reason for rejection', danger: true, confirmLabel: 'Reject application', onConfirm: (r) => decide('Rejected', r) })}>Reject</button>
                  </div>
                  {!note.trim() && <span className="tiny muted">Add a note to request corrections.</span>}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Ad moderation ---------- */
function AdModeration() {
  const { db, set, confirm, toast, log } = useApp();
  const [tab, setTab] = useState('reported');
  const [open, setOpen] = useState(null);
  const list = db.ads.filter((a) => (tab === 'reported' ? a.reports > 0 && !a.cleared && a.status !== 'Removed' : tab === 'removed' ? a.status === 'Removed' || a.status === 'Restricted' : tab === 'pending' ? a.status === 'Pending' : true));
  const a = open && db.ads.find((x) => x.id === open);
  const reports = a ? db.reports.filter((r) => r.target.includes(a.id)) : [];
  const upd = (patch, msg) => { set('ads', (ads) => ads.map((x) => (x.id === a.id ? { ...x, ...patch } : x))); log(`${msg} ${a.id} (${a.name})${patch.modReason ? ` — ${patch.modReason}` : ''}`); toast(`${msg} ${a.id}`); };
  return (
    <div className="stack lg">
      <PageHeader title="Pet Ad Moderation" crumbs={crumbs('Pet Ad Moderation')} sub="Reported ads stay visible but are not promoted until reviewed." />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'reported', label: 'Reported', count: db.ads.filter((x) => x.reports > 0 && !x.cleared && x.status !== 'Removed').length }, { value: 'pending', label: 'Awaiting approval', count: db.ads.filter((x) => x.status === 'Pending').length }, { value: 'removed', label: 'Removed / restricted' }, { value: 'all', label: 'All ads', count: db.ads.length }]} />
      <Table rows={list} onRow={(r) => setOpen(r.id)} empty={<Empty icon={Megaphone} title="No ads in this view" />} columns={[
        { label: 'Ad', render: (r) => <div className="row" style={{ flexWrap: 'nowrap' }}><div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden' }}><Img src={r.img} alt="" /></div><div><strong>{r.name}</strong><div className="tiny muted">{r.id} · {r.breed}</div></div></div> },
        { label: 'Advertiser', key: 'owner' }, { label: 'Type', key: 'type' }, { label: 'Price', num: true, render: (r) => (r.price ? money(r.price) : 'Free') },
        { label: 'Reports', num: true, render: (r) => (r.reports ? <strong style={{ color: 'var(--bad)' }}>{r.reports}</strong> : 0) }, { label: 'Status', render: (r) => <Chip status={r.status} /> },
      ]} />
      {a && (
        <Modal open wide onClose={() => setOpen(null)} title={`${a.id} · ${a.name}`} footer={<>
          {a.status === 'Pending' && <button className="btn btn-primary" onClick={() => upd({ status: 'Active' }, 'Approved ad')}>Approve & publish</button>}
          {a.reports > 0 && !a.cleared && a.status !== 'Removed' && <button className="btn btn-outline" onClick={() => upd({ cleared: true }, 'Cleared reports on')}><ShieldCheck size={15} /> Reports reviewed — keep ad</button>}
          {['Active', 'Reserved', 'Pending'].includes(a.status) && <button className="btn btn-outline" onClick={() => confirm({ title: 'Restrict this ad?', body: 'The ad is hidden from search while the advertiser fixes it.', requireReason: true, reasonLabel: 'Moderation reason (shared with advertiser)', confirmLabel: 'Restrict', onConfirm: (r) => upd({ status: 'Restricted', modReason: r }, 'Restricted ad') })}>Restrict</button>}
          {a.status !== 'Removed' && <button className="btn btn-danger" onClick={() => confirm({ title: 'Remove this ad?', body: 'The ad is taken down permanently and the advertiser is notified.', requireReason: true, reasonLabel: 'Moderation reason', danger: true, confirmLabel: 'Remove ad', warning: 'Removed ads can be restored from this screen.', onConfirm: (r) => upd({ status: 'Removed', modReason: r }, 'Removed ad') })}>Remove</button>}
          {['Removed', 'Restricted'].includes(a.status) && <button className="btn btn-outline" onClick={() => upd({ status: 'Active', modReason: '', cleared: true }, 'Restored ad')}><RotateCcw size={15} /> Restore</button>}
        </>}>
          <div className="split">
            <div className="stack">
              <div className="banner-img" style={{ aspectRatio: '4/3' }}><Img src={a.img} alt={a.name} /></div>
              <p className="small">{a.desc}</p>
              <dl className="kv"><dt>Advertiser</dt><dd>{a.owner}</dd><dt>Type / price</dt><dd>{a.type} · {a.price ? money(a.price) : 'Free'}</dd><dt>Area</dt><dd>{a.area}</dd><dt>Health</dt><dd>{a.health}</dd><dt>Posted</dt><dd>{fmtDate(a.posted)}</dd></dl>
            </div>
            <div className="stack">
              <Chip status={a.status} />
              {a.flagged && <div className="alert alert-warn small"><AlertTriangle size={16} /> {a.flagged}</div>}
              {a.modReason && <div className="alert alert-bad small"><FileText size={16} /> Moderation reason: {a.modReason}</div>}
              <h4>Reports ({a.reports})</h4>
              {reports.length ? reports.map((r) => <div key={r.id} className="doc-thumb"><Flag size={14} /><span className="grow small">{r.detail}</span></div>) : <p className="small muted">{a.reports ? `${a.reports} report(s) submitted by users.` : 'No reports.'}</p>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Borrow monitoring ---------- */
function BorrowMonitoring() {
  const { db, set, toast, log, confirm } = useApp();
  const [status, setStatus] = useState('');
  const [open, setOpen] = useState(null);
  const list = db.borrowRequests.filter((r) => !status || r.status === status);
  const r = open && db.borrowRequests.find((x) => x.id === open);
  const l = r && db.borrowListings.find((x) => x.id === r.listingId);
  const resolve = (outcome) => {
    const patch = outcome === 'refund' ? { status: 'Cancelled', refund: 'Full refund to borrower', payout: 'Cancelled' } : outcome === 'release' ? { status: 'Completed', refund: '—', payout: 'Released to owner' } : { status: 'Completed', refund: '50% refund to borrower', payout: '50% released to owner' };
    set('borrowRequests', (rs) => rs.map((x) => (x.id === r.id ? { ...x, ...patch, resolution: outcome } : x)));
    set('reports', (rp) => rp.map((x) => (x.target.startsWith(r.id) ? { ...x, status: 'Resolved', outcome: `Dispute resolved: ${patch.refund} / ${patch.payout}` } : x)));
    log(`Resolved dispute on ${r.id}: ${outcome}`);
    toast(`Dispute on ${r.id} resolved`);
  };
  const counts = (s) => db.borrowRequests.filter((x) => x.status === s).length;
  const totals = db.borrowRequests.filter((x) => x.payment === 'Paid').reduce((s, x) => s + x.daily * x.days, 0);
  return (
    <div className="stack lg">
      <PageHeader title="Pet Borrow Monitoring" crumbs={crumbs('Pet Borrow Monitoring')} sub="Owners approve their own requests. Admin monitors payments, handovers, returns and disputes." />
      <div className="grid g5">
        <StatCard icon={HeartHandshake} label="Pending approval" value={counts('Pending Owner Approval')} tone="orange" />
        <StatCard icon={CheckCircle2} label="Confirmed (upcoming)" value={counts('Confirmed')} tone="teal" />
        <StatCard icon={Activity} label="Active now" value={counts('Active')} />
        <StatCard icon={AlertTriangle} label="Disputed" value={counts('Disputed')} tone="red" />
        <StatCard icon={Package} label="Paid volume" value={money(totals)} tone="blue" hint={`Commission at ${db.settings.commissionRate}%: ${money(Math.round(totals * db.settings.commissionRate / 100))}`} />
      </div>
      <div className="card pad-sm row"><Field label="Status" htmlFor="bm-s"><select id="bm-s" className="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 260 }}><option value="">All bookings</option>{['Pending Owner Approval', 'Approved — Payment Required', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Rejected', 'Disputed'].map((s) => <option key={s}>{s}</option>)}</select></Field></div>
      <Table rows={list} onRow={(x) => setOpen(x.id)} columns={[
        { label: 'Booking', render: (x) => <strong>{x.id}</strong> }, { label: 'Pet', render: (x) => db.borrowListings.find((l2) => l2.id === x.listingId)?.name },
        { label: 'Owner → borrower', render: (x) => <span className="small">{x.owner} → {x.borrower}</span> }, { label: 'Dates', render: (x) => <span className="small">{fmtDate(x.start)} – {fmtDate(x.end)}</span> },
        { label: 'Amount', num: true, render: (x) => money(x.daily * x.days) }, { label: 'Payment', render: (x) => <Chip status={x.payment}>{x.payment}</Chip> },
        { label: 'Status', render: (x) => <Chip status={x.status === 'Active' && x.end < today() ? 'Overdue' : x.status}>{x.status === 'Active' && x.end < today() ? 'Overdue' : x.status}</Chip> },
      ]} />
      {r && (
        <Modal open wide onClose={() => setOpen(null)} title={`Booking ${r.id}`} footer={r.status === 'Disputed' ? <>
          <button className="btn btn-outline" onClick={() => resolve('release')}>Release payout to owner</button>
          <button className="btn btn-outline" onClick={() => resolve('split')}>Split 50/50</button>
          <button className="btn btn-primary" onClick={() => resolve('refund')}>Refund borrower</button>
        </> : <button className="btn btn-danger-outline" onClick={() => confirm({ title: `Suspend listing ${l?.name}?`, body: 'Use for confirmed welfare or safety problems. Future requests are blocked.', requireReason: true, danger: true, confirmLabel: 'Suspend listing', onConfirm: (why) => { set('borrowListings', (ls) => ls.map((x) => (x.id === l.id ? { ...x, status: 'Suspended' } : x))); log(`Suspended borrow listing ${l.id} — ${why}`); toast('Listing suspended'); } })}><Ban size={15} /> Suspend listing</button>}>
          <div className="split">
            <dl className="kv">
              <dt>Pet</dt><dd>{l?.name} · {l?.breed}</dd><dt>Owner</dt><dd>{r.owner}</dd><dt>Borrower</dt><dd>{r.borrower}</dd><dt>Dates</dt><dd>{fmtDate(r.start)} – {fmtDate(r.end)} ({r.days} days)</dd>
              <dt>Status</dt><dd><Chip status={r.status} /></dd><dt>Handover</dt><dd>{r.handoverAt ? `${fmtDate(r.handoverAt)} — ${r.handoverNote}` : '—'}</dd><dt>Return</dt><dd>{r.returnAt ? `${fmtDate(r.returnAt)} — ${r.returnNote}` : '—'}</dd>
              {r.disputeReason && <><dt>Dispute</dt><dd style={{ color: 'var(--bad)' }}>{r.disputeReason}</dd></>}
            </dl>
            <div className="card pad-sm breakdown" style={{ background: 'var(--bg)' }}>
              {(() => { const c = borrowCost(r.daily, r.days, r.commissionRate ?? db.settings.commissionRate); return (<>
                <div className="line"><span>Borrower total</span><span className="num">{money(c.total)}</span></div>
                <div className="line"><span>Commission ({r.commissionRate ?? db.settings.commissionRate}%)</span><span className="num">{money(c.commission)}</span></div>
                <div className="line"><span>Owner net</span><span className="num">{money(c.ownerNet)}</span></div>
                <div className="line total"><span>Payment</span><span>{r.payment}</span></div>
                <div className="line small"><span>Refund</span><span>{r.refund}</span></div>
                <div className="line small"><span>Payout</span><span>{r.payout}</span></div>
              </>); })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Overviews ---------- */
function AppointmentsOverview() {
  const { db } = useApp();
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [from, setFrom] = useState('');
  const list = db.appointments.filter((a) => (!status || a.status === status) && (!kind || a.kind === kind) && (!from || a.date >= from));
  const prov = (a) => (a.kind === 'doctor' ? db.doctors : db.hospitals).find((x) => x.id === a.providerId)?.name;
  return (
    <div className="stack lg">
      <PageHeader title="Appointments Overview" crumbs={crumbs('Appointments Overview')} sub="Read-only view for investigations. Providers manage their own appointments." />
      <div className="card pad-sm grid g3" style={{ alignItems: 'end' }}>
        <Field label="Status" htmlFor="ao-s"><select id="ao-s" className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option>{['Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled', 'Rejected'].map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Provider type" htmlFor="ao-k"><select id="ao-k" className="select" value={kind} onChange={(e) => setKind(e.target.value)}><option value="">All</option><option value="hospital">Hospital</option><option value="doctor">Doctor</option></select></Field>
        <Field label="From date" htmlFor="ao-f"><input id="ao-f" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      </div>
      <Table rows={list} columns={[{ label: 'ID', key: 'id' }, { label: 'Provider', render: prov }, { label: 'Owner', key: 'owner' }, { label: 'Pet', render: (a) => a.petName || db.pets.find((p) => p.id === a.petId)?.name }, { label: 'Date', render: (a) => `${fmtDate(a.date)} ${a.time}` }, { label: 'Fee', num: true, render: (a) => money(a.price) }, { label: 'Status', render: (a) => <Chip status={a.status} /> }]} />
    </div>
  );
}

function OrdersOverview() {
  const { db } = useApp();
  const [status, setStatus] = useState('');
  const [src, setSrc] = useState('');
  const list = db.orders.filter((o) => (!status || o.status === status) && (!src || o.source === src));
  return (
    <div className="stack lg">
      <PageHeader title="Orders Overview" crumbs={crumbs('Orders Overview')} sub="Pet Shop and Pharmacy orders across the platform." />
      <div className="card pad-sm grid g3" style={{ alignItems: 'end' }}>
        <Field label="Seller type" htmlFor="oo-src"><select id="oo-src" className="select" value={src} onChange={(e) => setSrc(e.target.value)}><option value="">All</option><option value="shop">Pet Shop</option><option value="pharmacy">Pharmacy</option></select></Field>
        <Field label="Status" htmlFor="oo-s"><select id="oo-s" className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All</option>{[...new Set(db.orders.map((o) => o.status))].map((s) => <option key={s}>{s}</option>)}</select></Field>
      </div>
      <Table rows={list} columns={[{ label: 'Order', key: 'id' }, { label: 'Seller', render: (o) => (o.source === 'shop' ? db.shops : db.pharmacies).find((x) => x.id === o.providerId)?.name }, { label: 'Customer', key: 'customer' }, { label: 'Date', render: (o) => fmtDate(o.date) }, { label: 'Total', num: true, render: (o) => money(o.total) }, { label: 'Payment', render: (o) => <span className="small">{o.payment}</span> }, { label: 'Status', render: (o) => <Chip status={o.status} /> }]} />
    </div>
  );
}

/* ---------- Reports ---------- */
function Reports() {
  const { db, set, toast, log, notify } = useApp();
  const [tab, setTab] = useState('Open');
  const [open, setOpen] = useState(null);
  const [draft, setDraft] = useState({ note: '', status: '', outcome: '' });
  const list = db.reports.filter((r) => tab === 'All' || r.status === tab);
  const r = open && db.reports.find((x) => x.id === open);
  const openR = (x) => { setOpen(x.id); setDraft({ note: '', status: x.status, outcome: x.outcome }); };
  const save = () => {
    set('reports', (rs) => rs.map((x) => (x.id === r.id ? { ...x, status: draft.status, outcome: draft.outcome, notes: draft.note.trim() ? [...x.notes, `${draft.note.trim()} — ${db.auth.name}`] : x.notes } : x)));
    log(`Updated report ${r.id} → ${draft.status}`);
    if (draft.status === 'Resolved') notify('user', `Your report ${r.id} was resolved: ${draft.outcome || 'action taken'}.`, '/user/help');
    toast(`Report ${r.id} updated`);
    setOpen(null);
  };
  return (
    <div className="stack lg">
      <PageHeader title="Reports & Complaints" crumbs={crumbs('Reports & Complaints')} />
      <Tabs value={tab} onChange={setTab} items={['Open', 'In review', 'Resolved', 'All'].map((s) => ({ value: s, label: s, count: s === 'All' ? db.reports.length : db.reports.filter((x) => x.status === s).length }))} />
      <Table rows={list} onRow={openR} empty={<Empty icon={Flag} title="No reports here" />} columns={[
        { label: 'ID', key: 'id' }, { label: 'Category', key: 'category' }, { label: 'About', render: (x) => <span className="small">{x.target}</span> }, { label: 'Reported by', key: 'by' }, { label: 'Date', render: (x) => fmtDate(x.date) }, { label: 'Priority', render: (x) => <Chip status={x.priority} /> }, { label: 'Status', render: (x) => <Chip status={x.status} /> },
      ]} />
      {r && (
        <Modal open wide onClose={() => setOpen(null)} title={`${r.id} · ${r.category}`} footer={<><button className="btn btn-outline" onClick={() => setOpen(null)}>Close</button><button className="btn btn-primary" onClick={save}><Save size={15} /> Save</button></>}>
          <div className="split">
            <div className="stack">
              <dl className="kv"><dt>About</dt><dd>{r.target}</dd><dt>Reported by</dt><dd>{r.by}</dd><dt>Date</dt><dd>{fmtDate(r.date)}</dd><dt>Priority</dt><dd><Chip status={r.priority} /></dd></dl>
              <div className="card pad-sm" style={{ background: 'var(--bg)' }}><p className="small">{r.detail}</p></div>
              <h4>Internal notes</h4>
              {r.notes.length ? r.notes.map((n, i) => <div key={i} className="doc-thumb small"><Lock size={13} /> {n}</div>) : <p className="small muted">No notes yet.</p>}
            </div>
            <div className="stack">
              <Field label="Status" htmlFor="rp-s"><select id="rp-s" className="select" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}><option>Open</option><option>In review</option><option>Resolved</option></select></Field>
              <Field label="Add internal note" hint="Only admins can see notes" htmlFor="rp-n"><textarea id="rp-n" className="textarea" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></Field>
              <Field label="Outcome (shared with reporter when resolved)" htmlFor="rp-o"><textarea id="rp-o" className="textarea" style={{ minHeight: 70 }} value={draft.outcome} onChange={(e) => setDraft({ ...draft, outcome: e.target.value })} /></Field>
              <div className="row">{r.category === 'Listing' && <Link className="btn btn-outline btn-sm" to="/admin/ads">Open ad moderation</Link>}{r.category === 'Pet Borrow' && <Link className="btn btn-outline btn-sm" to="/admin/borrow">Open borrow monitoring</Link>}<Link className="btn btn-outline btn-sm" to="/admin/users">Open user management</Link></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReviewsModeration() {
  const { db, set, toast, log } = useApp();
  const [tab, setTab] = useState('Flagged');
  const list = db.reviews.filter((r) => tab === 'All' || r.status === tab);
  const upd = (r, status) => { set('reviews', (rv) => rv.map((x) => (x.id === r.id ? { ...x, status } : x))); log(`${status === 'Hidden' ? 'Hid' : 'Restored'} review ${r.id}`); toast(`Review ${status === 'Hidden' ? 'hidden' : 'restored'}`); };
  return (
    <div className="stack lg">
      <PageHeader title="Reviews Moderation" crumbs={crumbs('Reviews Moderation')} sub="Hide reviews that break policy (spam, abuse, personal details). Honest negative reviews stay visible." />
      <Tabs value={tab} onChange={setTab} items={['Flagged', 'Hidden', 'Visible', 'All'].map((s) => ({ value: s, label: s, count: s === 'All' ? db.reviews.length : db.reviews.filter((x) => x.status === s).length }))} />
      {list.length === 0 ? <div className="card"><Empty icon={ShieldCheck} title="Nothing to moderate" /></div> : list.map((r) => (
        <div key={r.id} className="card row between top">
          <div className="stack sm grow">
            <div className="row"><strong className="small">{r.by}</strong><span className="tiny muted">on {r.target} · {fmtDate(r.date)}</span><Stars value={r.rating} /><Chip status={r.status} /></div>
            <p className="small">{r.text}</p>
            {r.flag && <span className="tiny" style={{ color: 'var(--bad)' }}>Flag: {r.flag}</span>}
          </div>
          <div className="row">
            {r.status !== 'Hidden' && <button className="btn btn-danger-outline btn-sm" onClick={() => upd(r, 'Hidden')}><EyeOff size={14} /> Hide</button>}
            {r.status !== 'Visible' && <button className="btn btn-outline btn-sm" onClick={() => upd(r, 'Visible')}><Eye size={14} /> {r.status === 'Flagged' ? 'Keep visible' : 'Restore'}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Analytics ---------- */
function Analytics() {
  const { db } = useApp();
  const [range, setRange] = useState(30);
  const n = range === 7 ? 7 : range === 30 ? 10 : 12;
  const labels = Array.from({ length: n }, (_, i) => fmtDate(day(-Math.round(((n - 1 - i) * range) / n))).replace(/ \d{4}$/, ''));
  const seed = (k, base, amp) => labels.map((_, i) => Math.round(base + amp * Math.sin((i + k) * 0.9) + i * (amp / 4)));
  const bookings = seed(1, range / 2 + 20, 8);
  const orders = seed(3, range / 1.5 + 30, 11);
  const borrow = labels.map((l, i) => ({ label: l, value: Math.max(1, Math.round(3 + 2 * Math.sin(i) + i / 2)) }));
  const complaints = labels.map((l, i) => ({ label: l, value: Math.max(0, Math.round(2 + 1.5 * Math.cos(i * 1.3))) }));
  return (
    <div className="stack lg">
      <PageHeader title="Analytics & Reports" crumbs={crumbs('Analytics & Reports')} actions={<select className="select" style={{ width: 180 }} value={range} onChange={(e) => setRange(Number(e.target.value))} aria-label="Date range"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>} />
      <div className="grid g4">
        <StatCard icon={CalendarDays} label="Bookings" value={bookings.reduce((a, b) => a + b, 0)} />
        <StatCard icon={Package} label="Orders" value={orders.reduce((a, b) => a + b, 0)} tone="orange" />
        <StatCard icon={HeartHandshake} label="Borrow transactions" value={borrow.reduce((a, b) => a + b.value, 0)} tone="teal" />
        <StatCard icon={Flag} label="Complaints" value={complaints.reduce((a, b) => a + b.value, 0)} tone="red" />
      </div>
      <div className="card"><div className="card-title"><h3>Bookings and orders</h3><Legend items={[{ name: 'Bookings', color: '#237a57' }, { name: 'Orders', color: '#d9822b' }]} /></div><LineChart labels={labels} series={[{ name: 'Bookings', values: bookings, color: '#237a57' }, { name: 'Orders', values: orders, color: '#d9822b' }]} /></div>
      <div className="grid g2">
        <div className="card"><div className="card-title"><h3>Pet Borrow transactions</h3></div><BarChart data={borrow} color="#45a88a" /></div>
        <div className="card"><div className="card-title"><h3>Complaint trend</h3></div><BarChart data={complaints} color="#c0392b" /></div>
      </div>
      <div className="card">
        <div className="card-title"><h3>Provider activity</h3><span className="tiny muted">Sample figures</span></div>
        <Table rows={[...db.hospitals.slice(0, 3).map((h, i) => ({ id: h.id, name: h.name, type: 'Hospital', count: 140 - i * 31, rating: h.rating })), ...db.shops.slice(0, 2).map((s, i) => ({ id: s.id, name: s.name, type: 'Pet Shop', count: 210 - i * 44, rating: s.rating }))]} columns={[{ label: 'Provider', key: 'name' }, { label: 'Type', key: 'type' }, { label: 'Bookings / orders', num: true, key: 'count' }, { label: 'Rating', render: (r) => <Stars value={r.rating} /> }]} />
      </div>
      <p className="tiny muted">Charts use generated sample data for the prototype.</p>
    </div>
  );
}

function ActivityLogs() {
  const { db } = useApp();
  const [q, setQ] = useState('');
  const list = db.activity.filter((a) => !q || `${a.who} ${a.action}`.toLowerCase().includes(q.toLowerCase())).map((a, i) => ({ ...a, id: i }));
  return (
    <div className="stack lg">
      <PageHeader title="Activity Logs" crumbs={crumbs('Activity Logs')} sub="Every sensitive admin action is recorded and can’t be edited." />
      <input className="input" style={{ maxWidth: 360 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search logs" aria-label="Search logs" />
      <Table rows={list} pageSize={12} columns={[{ label: 'Time', render: (a) => <span className="num small">{a.at}</span> }, { label: 'Admin', key: 'who' }, { label: 'Action', key: 'action' }]} />
    </div>
  );
}

function PlatformSettings() {
  const { db, set, toast, log } = useApp();
  const [s, setS] = useState(db.settings);
  const [cats, setCats] = useState({ shop: productCategories, med: medicineCategories });
  const [newCat, setNewCat] = useState({ shop: '', med: '' });
  const save = () => {
    if (!(s.commissionRate >= 0 && s.commissionRate <= 50)) { toast('Commission must be between 0% and 50%', 'bad'); return; }
    set('settings', s);
    log(`Updated platform settings (commission ${s.commissionRate}%${s.commissionFinal ? ', final' : ', not final'})`);
    toast('Settings saved');
  };
  return (
    <div className="stack lg">
      <PageHeader title="Platform Settings" crumbs={crumbs('Platform Settings')} actions={<button className="btn btn-primary" onClick={save}><Save size={16} /> Save changes</button>} />
      <div className="grid g2">
        <div className="card stack">
          <h3>Pet Borrow service commission</h3>
          <div className="alert alert-warn small"><AlertTriangle size={16} /> The final commission rate has not been decided. The current value is an example and can be changed at any time.</div>
          <div className="form-grid">
            <Field label="Commission rate (%)" htmlFor="ps-c"><input id="ps-c" type="number" min="0" max="50" step="0.5" className="input" value={s.commissionRate} onChange={(e) => setS({ ...s, commissionRate: Number(e.target.value) })} /></Field>
            <Field label="Example on ৳500 × 2 days"><div className="input num" style={{ background: 'var(--bg)' }}>{money(1000)} → commission {money(Math.round(10 * s.commissionRate))} · owner {money(1000 - Math.round(10 * s.commissionRate))}</div></Field>
          </div>
          <label className="check"><input type="checkbox" checked={s.commissionFinal} onChange={(e) => setS({ ...s, commissionFinal: e.target.checked })} /> Mark this rate as final (removes “example rate” labels for users)</label>
          <span className="tiny muted">Changes apply to new bookings. Confirmed bookings keep the rate they were paid at.</span>
        </div>
        <div className="card stack">
          <h3>Policies</h3>
          <Field label="Free appointment cancellation window (hours)" htmlFor="ps-h"><input id="ps-h" type="number" min="0" className="input" value={s.cancellationHours} onChange={(e) => setS({ ...s, cancellationHours: Number(e.target.value) })} /></Field>
          <Field label="New pet ads" htmlFor="ps-m"><select id="ps-m" className="select" value={s.adModeration} onChange={(e) => setS({ ...s, adModeration: e.target.value })}><option>Publish immediately, review when reported</option><option>Review before publishing</option></select></Field>
          <div className="row small" style={{ gap: 12 }}><Link to="/policy/terms" target="_blank">Terms</Link><Link to="/policy/privacy" target="_blank">Privacy</Link><Link to="/policy/borrow" target="_blank">Pet Borrow policy</Link><Link to="/policy/listings" target="_blank">Listing guidelines</Link></div>
        </div>
      </div>
      <div className="grid g2">
        {[['shop', 'Pet Shop categories'], ['med', 'Pharmacy categories']].map(([k, t]) => (
          <div key={k} className="card stack">
            <h3>{t}</h3>
            <div className="row" style={{ gap: 6 }}>{cats[k].map((c) => <span key={c} className="pill">{c} <button style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex' }} onClick={() => setCats({ ...cats, [k]: cats[k].filter((x) => x !== c) })} aria-label={`Remove ${c}`}><X size={12} /></button></span>)}</div>
            <div className="row"><input className="input grow" value={newCat[k]} onChange={(e) => setNewCat({ ...newCat, [k]: e.target.value })} placeholder="New category" aria-label="New category" /><button className="btn btn-outline btn-sm" disabled={!newCat[k].trim()} onClick={() => { setCats({ ...cats, [k]: [...cats[k], newCat[k].trim()] }); setNewCat({ ...newCat, [k]: '' }); }}><Plus size={14} /> Add</button></div>
          </div>
        ))}
      </div>
      <div className="card stack">
        <h3>Notification templates</h3>
        {s.templates.map((t, i) => (
          <Field key={t.key} label={t.label} hint="Placeholders like {{id}} are filled in automatically" htmlFor={`tpl-${t.key}`}><input id={`tpl-${t.key}`} className="input" value={t.text} onChange={(e) => setS({ ...s, templates: s.templates.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} /></Field>
        ))}
      </div>
      <div className="card stack sm">
        <h3>Restricted actions</h3>
        <p className="small muted">These need the Super Admin role. Your role: <strong>Platform admin</strong>.</p>
        <div className="row"><button className="btn btn-outline" disabled title="Requires Super Admin"><Lock size={15} /> Manage admin accounts</button><button className="btn btn-danger-outline" disabled title="Requires Super Admin"><Lock size={15} /> Export all user data</button></div>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  return (
    <Routes>
      <Route element={<PortalLayout portal="admin" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="verification" element={<Verification />} />
        <Route path="ads" element={<AdModeration />} />
        <Route path="borrow" element={<BorrowMonitoring />} />
        <Route path="appointments" element={<AppointmentsOverview />} />
        <Route path="orders" element={<OrdersOverview />} />
        <Route path="reports" element={<Reports />} />
        <Route path="reviews" element={<ReviewsModeration />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notifications" element={<NotificationsPage portal="admin" />} />
        <Route path="activity" element={<ActivityLogs />} />
        <Route path="settings" element={<PlatformSettings />} />
        <Route path="*" element={<Empty title="Page not found" />} />
      </Route>
    </Routes>
  );
}
