import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, Send, Star, Lock, Save, MapPin, BadgeCheck } from 'lucide-react';
import MapView from '../components/MapView.jsx';
import { BarChart, Chip, Empty, Field, Initials, PageHeader, Stars, Tabs } from '../components/ui.jsx';
import { fmtDate, newId, useApp } from '../context/AppContext.jsx';
import { AREAS } from '../data/mock.js';
import { PORTALS } from './config.js';

export function NotificationsPage({ portal }) {
  const { db, set } = useApp();
  const [tab, setTab] = useState('all');
  const list = (db.notifications[portal] || []).filter((n) => tab === 'all' || !n.read);
  const mark = (id) => set('notifications', (n) => ({ ...n, [portal]: n[portal].map((x) => (id === 'all' || x.id === id ? { ...x, read: true } : x)) }));
  return (
    <div className="stack lg">
      <PageHeader title="Notifications" crumbs={[{ label: 'Dashboard', to: `${PORTALS[portal].base}/dashboard` }, { label: 'Notifications' }]} actions={<button className="btn btn-outline" onClick={() => mark('all')}><CheckCheck size={16} /> Mark all as read</button>} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'all', label: 'All', count: (db.notifications[portal] || []).length }, { value: 'unread', label: 'Unread', count: (db.notifications[portal] || []).filter((n) => !n.read).length }]} />
      {list.length === 0 ? <div className="card"><Empty icon={Bell} title="You’re all caught up" text="New booking, order and account updates will show here." /></div> : (
        <div className="card stack sm" style={{ padding: 8 }}>
          {list.map((n) => (
            <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
              <div className="avatar" style={{ width: 34, height: 34 }}><Bell size={15} /></div>
              <div className="grow">
                <div className="small">{n.text}</div>
                <div className="tiny muted">{n.at}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {n.link && <Link className="btn btn-outline btn-sm" to={n.link} onClick={() => mark(n.id)}>Open</Link>}
                {!n.read && <button className="btn btn-ghost btn-sm" onClick={() => mark(n.id)}>Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessagesPage({ portal = 'user', filter }) {
  const { db, set } = useApp();
  const threads = db.threads.filter((t) => !filter || filter(t));
  const [active, setActive] = useState(threads[0]?.id);
  const [text, setText] = useState('');
  const t = threads.find((x) => x.id === active);
  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    set('threads', (all) => all.map((x) => (x.id === active ? { ...x, messages: [...x.messages, { me: true, text: text.trim(), at: 'Just now' }] } : x)));
    setText('');
  };
  return (
    <div className="stack lg">
      <PageHeader title={portal === 'borrow' ? 'Messages' : 'Inquiries & Messages'} crumbs={[{ label: 'Dashboard', to: `${PORTALS[portal].base}/dashboard` }, { label: 'Messages' }]} sub="Your phone number and address stay private. Keep conversations here so our team can help if needed." />
      {threads.length === 0 ? <div className="card"><Empty icon={MessageSquare} title="No conversations yet" text="Inquiries about ads and borrow requests appear here." /></div> : (
        <div className="chat">
          <div className="chat-list">
            {threads.map((x) => (
              <button key={x.id} className={x.id === active ? 'on' : ''} onClick={() => setActive(x.id)}>
                <Initials name={x.with} />
                <div style={{ minWidth: 0 }}>
                  <strong className="small">{x.with}</strong>
                  <div className="tiny muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.about}</div>
                  <div className="tiny muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.messages[x.messages.length - 1]?.text}</div>
                </div>
              </button>
            ))}
          </div>
          {t && (
            <div className="chat-thread">
              <div className="row between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
                <div><strong>{t.with}</strong><div className="tiny muted">{t.about}</div></div>
                <span className="tiny muted row" style={{ gap: 4 }}><Lock size={12} /> Private</span>
              </div>
              <div className="chat-msgs">
                {t.messages.map((m, i) => <div key={i} className={`bubble ${m.me ? 'me' : ''}`}>{m.text}<div className="tiny" style={{ opacity: 0.7, marginTop: 4 }}>{m.at}</div></div>)}
              </div>
              <form className="chat-input" onSubmit={send}>
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message…" aria-label="Message" />
                <button className="btn btn-primary" aria-label="Send"><Send size={16} /></button>
              </form>
            </div>
          )}
        </div>
      )}
      <p className="tiny muted">Prototype: messages are stored in this browser only; no messaging service is connected.</p>
    </div>
  );
}

export function ProviderReviewsPage({ portal, type, id, name }) {
  const { db, set, toast } = useApp();
  const list = db.reviews.filter((r) => r.targetType === type && r.targetId === id);
  const visible = list.filter((r) => r.status === 'Visible');
  const avg = visible.length ? visible.reduce((s, r) => s + r.rating, 0) / visible.length : 0;
  const [reply, setReply] = useState({});
  const dist = [5, 4, 3, 2, 1].map((n) => ({ label: `${n}★`, value: visible.filter((r) => r.rating === n).length }));
  return (
    <div className="stack lg">
      <PageHeader title="Reviews" crumbs={[{ label: 'Dashboard', to: `${PORTALS[portal].base}/dashboard` }, { label: 'Reviews' }]} sub={`What pet owners say about ${name}.`} />
      <div className="grid g3">
        <div className="card stack sm"><span className="small muted">Average rating</span><div className="price-lg" style={{ fontSize: 34 }}>{avg ? avg.toFixed(1) : '—'}</div><Stars value={avg || 0} count={visible.length} /></div>
        <div className="card" style={{ gridColumn: 'span 2' }}><BarChart data={dist} height={150} /></div>
      </div>
      {list.length === 0 ? <div className="card"><Empty icon={Star} title="No reviews yet" text="Reviews appear after completed appointments or orders." /></div> : list.map((r) => (
        <div key={r.id} className="card stack sm">
          <div className="row between"><div className="row"><Initials name={r.by} /><div><strong className="small">{r.by}</strong><div className="tiny muted">{fmtDate(r.date)}</div></div></div><div className="row"><Stars value={r.rating} />{r.status !== 'Visible' && <Chip status={r.status === 'Flagged' ? 'Flagged' : 'Hidden'}>{r.status === 'Flagged' ? 'Under moderation' : 'Hidden by admin'}</Chip>}</div></div>
          <p className="small">{r.text}</p>
          {r.reply && <div className="card pad-sm small" style={{ background: 'var(--bg)' }}><strong>Your reply:</strong> {r.reply}</div>}
          {!r.reply && r.status === 'Visible' && (
            <div className="row">
              <input className="input grow" value={reply[r.id] || ''} onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} placeholder="Reply publicly…" aria-label="Reply" />
              <button className="btn btn-outline btn-sm" disabled={!reply[r.id]?.trim()} onClick={() => { set('reviews', (rv) => rv.map((x) => (x.id === r.id ? { ...x, reply: reply[r.id].trim() } : x))); toast('Reply posted'); }}>Reply</button>
            </div>
          )}
          {r.status === 'Visible' && !r.flaggedByProvider && <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--muted)' }} onClick={() => { set('reviews', (rv) => rv.map((x) => (x.id === r.id ? { ...x, status: 'Flagged', flag: 'Flagged by provider', flaggedByProvider: true } : x))); toast('Review sent to admin for moderation', 'info'); }}>Flag for moderation</button>}
        </div>
      ))}
    </div>
  );
}

export function SettingsPage({ portal, extra }) {
  const { db, toast } = useApp();
  const [prefs, setPrefs] = useState({ email: true, sms: true, push: true, marketing: false });
  const [pw, setPw] = useState({ cur: '', next: '', again: '' });
  const [err, setErr] = useState('');
  const savePw = (e) => {
    e.preventDefault();
    if (!pw.cur) return setErr('Enter your current password');
    if (pw.next.length < 8 || !/\d/.test(pw.next)) return setErr('New password needs at least 8 characters including a number');
    if (pw.next !== pw.again) return setErr('New passwords don’t match');
    setErr(''); setPw({ cur: '', next: '', again: '' }); toast('Password updated');
  };
  return (
    <div className="stack lg">
      <PageHeader title="Settings" crumbs={[{ label: 'Dashboard', to: `${PORTALS[portal].base}/dashboard` }, { label: 'Settings' }]} />
      {extra}
      <div className="grid g2">
        <div className="card stack">
          <h3>Notification preferences</h3>
          {[['email', 'Email updates for bookings and orders'], ['sms', 'SMS reminders'], ['push', 'In-app notifications'], ['marketing', 'Tips and offers from PetPaw']].map(([k, t]) => (
            <label key={k} className="check"><input type="checkbox" checked={prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} /> {t}</label>
          ))}
          <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Notification preferences saved')}><Save size={16} /> Save preferences</button>
        </div>
        <form className="card stack" onSubmit={savePw} noValidate>
          <h3>Change password</h3>
          <Field label="Current password" htmlFor="pw-c"><input id="pw-c" type="password" className="input" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} autoComplete="current-password" /></Field>
          <Field label="New password" htmlFor="pw-n"><input id="pw-n" type="password" className="input" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" /></Field>
          <Field label="Confirm new password" htmlFor="pw-a"><input id="pw-a" type="password" className="input" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} autoComplete="new-password" /></Field>
          {err && <span className="error-text">{err}</span>}
          <button className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>Update password</button>
        </form>
      </div>
      <div className="card stack sm">
        <h3>Account</h3>
        <div className="small muted">Signed in as <strong style={{ color: 'var(--ink)' }}>{db.auth.email}</strong></div>
        <div className="small muted">To close your account or download your data, contact support.</div>
      </div>
    </div>
  );
}

/** Address + map pin editor used by Hospital, Pet Shop and Pharmacy profiles. */
export function LocationEditor({ value, onChange, error }) {
  const [area, setArea] = useState(value.area || 'Dhanmondi');
  return (
    <div className="stack">
      <div className="form-grid">
        <Field label="Street address" required error={error} full htmlFor="loc-addr"><input id="loc-addr" className={`input ${error ? 'invalid' : ''}`} value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} placeholder="House, road, area, Dhaka" /></Field>
        <Field label="Area" htmlFor="loc-area"><select id="loc-area" className="select" value={area} onChange={(e) => { setArea(e.target.value); onChange({ ...value, area: e.target.value }); }}>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
        <Field label="Map pin" hint="Click the map to move the pin"><div className="input num" style={{ background: 'var(--bg)' }}><MapPin size={14} style={{ verticalAlign: -2 }} /> {value.lat ? `${value.lat}, ${value.lng}` : 'Not set'}</div></Field>
      </div>
      <MapView picker value={value} onPick={(p) => onChange({ ...value, ...p })} height={300} />
      {!value.lat && <span className="error-text">Set a map pin so pet owners can find you.</span>}
    </div>
  );
}

export function VerifiedBadge({ pending }) {
  return pending ? <Chip status="Pending Verification" /> : <span className="verified"><BadgeCheck size={15} /> Verified by PetPaw</span>;
}
