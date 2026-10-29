import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bird, Cat, CheckCircle2, ChevronRight, Dog, Hospital, Info, Package, PawPrint, Pill, Rabbit, Star, Stethoscope, Store, X, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const FALLBACKS = [
  [/cat|kitten|persian|siamese|mishti|luna|snowball|tom\b/i, Cat],
  [/bird|budgie|budgerigar|parrot|cockatiel|kiwi|mango/i, Bird],
  [/rabbit|bunny/i, Rabbit],
  [/hospital|clinic|health cent/i, Hospital],
  [/dr\.|vet|doctor/i, Stethoscope],
  [/pharm|medicine|tablet|rx/i, Pill],
  [/shop|mart|bazaar|tails|friends|whiskers/i, Store],
  [/food|toy|leash|collar|bed|crate|shampoo|brush|bowl|litter|treat|harness|remover/i, Package],
  [/dog|puppy|labrador|shepherd|shih|deshi|bruno|tiger|coco|rex|max/i, Dog],
];
export function Img({ src, alt = '', className, style }) {
  const [bad, setBad] = useState(!src);
  useEffect(() => setBad(!src), [src]);
  if (bad) {
    const Icon = (FALLBACKS.find(([re]) => re.test(alt)) || [null, PawPrint])[1];
    return (
      <div className={`img-fallback ${className || ''}`} style={style} role="img" aria-label={alt}>
        <Icon size={40} strokeWidth={1.4} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} loading="lazy" onError={() => setBad(true)} />;
}

const STATUS_TONE = {
  ok: ['Confirmed', 'Completed', 'Active', 'Approved', 'Verified', 'Paid', 'Delivered', 'Visible', 'Resolved', 'In stock', 'Paid out', 'Published', 'Ready for pickup', 'Dispensed', 'Open now'],
  warn: ['Pending', 'Pending Verification', 'Pending Owner Approval', 'Approved — Payment Required', 'Awaiting payment', 'Prescription review', 'Corrections Requested', 'Low stock', 'Reserved', 'In review', 'Processing', 'Preparing', 'Paused', 'Restricted', 'Expiring soon', 'Scheduled after return', 'Rescheduled', 'Overdue', 'Medium', 'Flagged'],
  bad: ['Rejected', 'Cancelled', 'Suspended', 'Removed', 'Disputed', 'Out of stock', 'Expired', 'Payment failed', 'Hidden', 'High', 'Open', 'Refunded'],
  info: ['New', 'Out for delivery', 'Dispatched', 'Upcoming', 'Not started', 'Low'],
};
export function Chip({ status, children, tone }) {
  const label = children || status;
  let t = tone;
  if (!t) {
    t = 'neutral';
    for (const [k, list] of Object.entries(STATUS_TONE)) if (list.includes(status)) { t = k; break; }
  }
  return <span className={`chip chip-${t}`}>{label}</span>;
}

export function Stars({ value, size = 14, count }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      <Star size={size} fill="currentColor" strokeWidth={0} />
      <span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 13 }}>{Number(value).toFixed(1)}</span>
      {count != null && <span className="muted small">({count})</span>}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, tone = 'green', to, hint }) {
  const inner = (
    <>
      <div className={`ico tone-${tone}`}><Icon size={20} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="val">{value}</div>
        <div className="lbl">{label}</div>
        {hint && <div className="tiny muted">{hint}</div>}
      </div>
    </>
  );
  return to ? <Link to={to} className="stat hover-card" style={{ color: 'inherit', textDecoration: 'none' }}>{inner}</Link> : <div className="stat">{inner}</div>;
}

export function PageHeader({ title, crumbs = [], actions, sub }) {
  return (
    <div className="page-head">
      <div style={{ minWidth: 0 }}>
        {crumbs.length > 0 && (
          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={13} />}
                {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {sub && <p className="muted" style={{ marginTop: 4 }}>{sub}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmHost() {
  const { confirmState: c, setConfirmState } = useApp();
  const [reason, setReason] = useState('');
  useEffect(() => setReason(''), [c]);
  if (!c) return null;
  const close = () => setConfirmState(null);
  return (
    <Modal
      open
      onClose={close}
      title={c.title}
      footer={
        <>
          <button className="btn btn-outline" onClick={close}>Cancel</button>
          <button
            className={`btn ${c.danger ? 'btn-danger' : 'btn-primary'}`}
            disabled={c.requireReason && !reason.trim()}
            onClick={() => { c.onConfirm?.(reason.trim()); close(); }}
          >
            {c.confirmLabel || 'Confirm'}
          </button>
        </>
      }
    >
      <div className="stack">
        {c.danger && <div className="alert alert-bad"><AlertTriangle size={18} /> <span>{c.warning || 'This action cannot be undone.'}</span></div>}
        <div>{c.body}</div>
        {c.requireReason && (
          <div className="field">
            <label htmlFor="confirm-reason">{c.reasonLabel || 'Reason'} <span className="req">*</span></label>
            <textarea id="confirm-reason" className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={c.reasonPlaceholder || 'Explain the reason'} />
          </div>
        )}
      </div>
    </Modal>
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`}>
          {t.kind === 'bad' ? <XCircle size={18} /> : t.kind === 'info' ? <Info size={18} /> : <CheckCircle2 size={18} />}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon = PawPrint, title, text, action }) {
  return (
    <div className="empty">
      <div className="ico"><Icon size={26} /></div>
      <h4>{title}</h4>
      {text && <p className="small" style={{ maxWidth: 420 }}>{text}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

export function Tabs({ value, onChange, items }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((it) => {
        const v = typeof it === 'string' ? it : it.value;
        const label = typeof it === 'string' ? it : it.label;
        return (
          <button key={v} role="tab" aria-selected={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
            {label}
            {it.count != null && <span className="count">{it.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, required, error, hint, children, full, htmlFor }) {
  return (
    <div className={`field ${full ? 'full' : ''}`}>
      {label && <label htmlFor={htmlFor}>{label} {required && <span className="req">*</span>}</label>}
      {children}
      {error ? <span className="error-text" role="alert">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function Table({ columns, rows, onRow, empty, pageSize = 8, rowKey = 'id' }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => { if (page >= pages) setPage(0); }, [pages, page]);
  const slice = useMemo(() => rows.slice(page * pageSize, page * pageSize + pageSize), [rows, page, pageSize]);
  if (!rows.length) return <div className="card">{empty || <Empty title="Nothing here yet" />}</div>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key || c.label} className={c.num ? 'num' : ''}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {slice.map((r) => (
            <tr key={r[rowKey]} className={onRow ? 'clickable' : ''} onClick={onRow ? () => onRow(r) : undefined}>
              {columns.map((c) => <td key={c.key || c.label} className={c.num ? 'num' : ''}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > pageSize && (
        <div className="pager">
          <span>Showing {page * pageSize + 1}–{Math.min(rows.length, (page + 1) * pageSize)} of {rows.length}</span>
          <div className="row">
            <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page + 1} of {pages}</span>
            <button className="btn btn-outline btn-sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Seg({ value, onChange, items }) {
  return (
    <div className="seg" role="group">
      {items.map((it) => (
        <button key={it.value} className={value === it.value ? 'on' : ''} onClick={() => onChange(it.value)} aria-pressed={value === it.value}>
          {it.icon && <it.icon size={15} />} {it.label}
        </button>
      ))}
    </div>
  );
}

export function BarChart({ data, height = 200, color = 'var(--green)', valueFmt = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 600;
  const pad = { l: 8, r: 8, t: 22, b: 26 };
  const bw = (w - pad.l - pad.r) / data.length;
  const ih = height - pad.t - pad.b;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="bar-chart" role="img" aria-label="Bar chart">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad.l} x2={w - pad.r} y1={pad.t + ih * (1 - f)} y2={pad.t + ih * (1 - f)} stroke="#e7ece9" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * ih;
        const x = pad.l + i * bw + bw * 0.18;
        const last = i === data.length - 1;
        return (
          <g key={d.label}>
            <rect x={x} y={pad.t + ih - h} width={bw * 0.64} height={Math.max(h, 1)} rx="5" fill={last ? 'var(--orange)' : color} opacity={last ? 1 : 0.85} />
            <text x={x + bw * 0.32} y={pad.t + ih - h - 6} textAnchor="middle" fontSize="11" fill="#202b26" fontWeight="600">{valueFmt(d.value)}</text>
            <text x={x + bw * 0.32} y={height - 8} textAnchor="middle" fontSize="11" fill="#68756e">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ series, labels, height = 220 }) {
  const w = 600;
  const pad = { l: 34, r: 12, t: 14, b: 26 };
  const all = series.flatMap((s) => s.values);
  const max = Math.max(1, ...all);
  const ih = height - pad.t - pad.b;
  const iw = w - pad.l - pad.r;
  const x = (i) => pad.l + (i / (labels.length - 1)) * iw;
  const y = (v) => pad.t + ih - (v / max) * ih;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="bar-chart" role="img" aria-label="Line chart">
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + ih * (1 - f)} y2={pad.t + ih * (1 - f)} stroke="#e7ece9" />
          <text x={pad.l - 6} y={pad.t + ih * (1 - f) + 4} textAnchor="end" fontSize="10" fill="#68756e">{Math.round(max * f)}</text>
        </g>
      ))}
      {series.map((s) => {
        const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
        const area = `${d} L${x(s.values.length - 1)},${pad.t + ih} L${x(0)},${pad.t + ih} Z`;
        return (
          <g key={s.name}>
            <path d={area} fill={s.color} opacity="0.08" />
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1])} r="4.5" fill={s.color} />
          </g>
        );
      })}
      {labels.map((l, i) => (i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1) && (
        <text key={l + i} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#68756e">{l}</text>
      ))}
    </svg>
  );
}

export function Legend({ items }) {
  return (
    <div className="row small" style={{ gap: 16 }}>
      {items.map((i) => (
        <span key={i.name} className="row" style={{ gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: i.color, display: 'inline-block' }} /> {i.name}
        </span>
      ))}
    </div>
  );
}

export function Timeline({ steps }) {
  return (
    <div className="timeline">
      {steps.map((s, i) => (
        <div key={i} className={`tl-item ${s.state || ''}`}>
          <div className="tl-dot">{s.state === 'done' ? <CheckCircle2 size={15} /> : s.state === 'fail' ? <X size={15} /> : <span className="tiny">{i + 1}</span>}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
            {s.text && <div className="small muted">{s.text}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PrototypeNote({ children }) {
  return <span className="prototype-note"><Info size={13} /> {children || 'Prototype — no real service connected'}</span>;
}

export function StarInput({ value, onChange }) {
  return (
    <div className="row" style={{ gap: 4 }} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} stars`} aria-checked={value === n} role="radio" style={{ border: 0, background: 'none', cursor: 'pointer', color: n <= value ? '#e9a23b' : '#cdd5d0', padding: 2 }}>
          <Star size={28} fill="currentColor" strokeWidth={0} />
        </button>
      ))}
    </div>
  );
}

export function Initials({ name, img, size }) {
  const ini = (name || '?').replace(/^Dr\.\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return <div className={`avatar ${size === 'lg' ? 'lg' : ''}`}>{img ? <Img src={img} alt={name} /> : ini}</div>;
}
