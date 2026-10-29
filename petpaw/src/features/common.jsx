import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flag, LogIn, UserPlus } from 'lucide-react';
import { Field, Modal } from '../components/ui.jsx';
import { newId, useApp } from '../context/AppContext.jsx';
import { day } from '../data/mock.js';

/** Gate account-only actions. Returns [gate(fn, label), modalElement]. */
export function useAuthGate() {
  const { db, toast } = useApp();
  const loc = useLocation();
  const [what, setWhat] = useState(null);
  const next = loc.pathname.replace(/^\/explore/, '/user');
  const gate = (fn, label = 'continue') => {
    if (!db.auth) { setWhat(label); return; }
    if (!['user', 'borrow'].includes(db.auth.role)) { toast('Switch to a pet-owner account to do this', 'info'); return; }
    fn();
  };
  const modal = (
    <Modal open={!!what} onClose={() => setWhat(null)} title="Sign in to continue">
      <div className="stack">
        <p>You need a free PetPaw account to {what}. Browsing stays open to everyone.</p>
        <div className="row">
          <Link className="btn btn-primary" to={`/login?next=${encodeURIComponent(next)}`}><LogIn size={16} /> Login</Link>
          <Link className="btn btn-secondary" to="/register"><UserPlus size={16} /> Create account</Link>
        </div>
      </div>
    </Modal>
  );
  return [gate, modal];
}

/** Simulates a short network load so loading states are visible. */
export function useFakeLoad(ms = 450, deps = []) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return loading;
}

const REPORT_REASONS = {
  Listing: ['Suspected scam or fraud', 'Misleading photos or description', 'Animal welfare concern', 'Protected or illegal species', 'Wrong location', 'Other'],
  Provider: ['Not who they claim to be', 'Poor or unsafe care', 'Overcharging', 'Rude or abusive behaviour', 'Wrong address or location', 'Other'],
  Order: ['Wrong or missing items', 'Damaged or expired product', 'Not delivered', 'Payment issue', 'Other'],
  Appointment: ['Provider did not show up', 'Overcharged', 'Unsafe treatment', 'Other'],
  'Pet Borrow': ['Mistreatment of pet', 'Unsafe arrangement', 'Missed or late return', 'Payment dispute', 'Incorrect location', 'Other'],
};

/** Report modal used for ads, providers, orders, appointments and borrow bookings. */
export function ReportModal({ open, onClose, category, target, onReported }) {
  const { db, set, notify, toast } = useApp();
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setReason(''); setDetail(''); setErr(''); } }, [open]);
  const submit = () => {
    if (!reason) { setErr('Choose a reason'); return; }
    if (detail.trim().length < 10) { setErr('Add a short description (at least 10 characters)'); return; }
    const id = newId('RP');
    set('reports', (r) => [{ id, category, target, by: db.auth?.name || 'Guest', date: day(0), status: 'Open', priority: reason.includes('welfare') || reason.includes('Mistreatment') || reason.includes('fraud') ? 'High' : 'Medium', detail: `${reason}: ${detail.trim()}`, notes: [], outcome: '' }, ...r]);
    notify('admin', `New ${category.toLowerCase()} report: ${target}`, '/admin/reports');
    onReported?.(id);
    toast(`Report ${id} submitted. Our team will review it.`);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={`Report ${category.toLowerCase()}`} footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-danger" onClick={submit}><Flag size={15} /> Submit report</button></>}>
      <div className="stack">
        <p className="small muted">Reporting <strong>{target}</strong>. Reports are confidential; the other party is not told who reported them.</p>
        <Field label="Reason" required htmlFor="rep-reason">
          <select id="rep-reason" className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Choose a reason</option>
            {(REPORT_REASONS[category] || REPORT_REASONS.Listing).map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="What happened?" required htmlFor="rep-detail"><textarea id="rep-detail" className="textarea" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Include dates, what you saw, and anything that helps us investigate." /></Field>
        {err && <span className="error-text">{err}</span>}
        <div className="alert alert-info small">If an animal is in immediate danger, contact the nearest hospital or local animal welfare service as well.</div>
      </div>
    </Modal>
  );
}

export function addToCart(set, toast, item) {
  set('cart', (c) => {
    const ex = c.find((x) => x.id === item.id && x.source === item.source);
    if (ex) return c.map((x) => (x === ex ? { ...x, qty: Math.min(x.qty + (item.qty || 1), x.max || 99) } : x));
    return [...c, { ...item, qty: item.qty || 1 }];
  });
  toast(`Added to cart: ${item.name}`);
}
