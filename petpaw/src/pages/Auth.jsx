import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, BadgeCheck, Building2, CheckCircle2, Eye, EyeOff, FileUp, Hospital, Lock, Mail, Paperclip,
  Pill, ShieldCheck, ShoppingBag, Stethoscope, Trash2, User,
  KeyRound, Phone,
} from 'lucide-react';
import { api, ApiError } from '../api.js';
import { Logo } from '../components/PublicLayout.jsx';
import { Field, Timeline, Chip } from '../components/ui.jsx';
import { fmtDate, useApp } from '../context/AppContext.jsx';
import { AREAS, DEMO_ACCOUNTS, DEMO_PASSWORD, IMG } from '../data/mock.js';
import { portalHome } from '../portals/config.js';

const DEFAULT_POINTS = [{ icon: BadgeCheck, text: 'Providers verified by our team' }, { icon: Lock, text: 'Your contact details stay private' }];

function AuthShell({ children, wide, title = 'Care for every paw, in one place.', text = 'Book vets, order supplies, and connect with pet lovers across Bangladesh.', points = DEFAULT_POINTS }) {
  return (
    <div className="auth">
      <div className="auth-art">
        <img src={IMG.auth} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <Logo />
        <div className="stack" style={{ maxWidth: 420 }}>
          <h2 style={{ color: '#fff', fontSize: 34 }}>{title}</h2>
          <p style={{ opacity: 0.9 }}>{text}</p>
          <div className="stack sm small" style={{ marginTop: 10, opacity: 0.95 }}>
            {points.map((p) => <span key={p.text} className="row" style={{ gap: 8 }}><p.icon size={16} /> {p.text}</span>)}
          </div>
        </div>
        <span className="small" style={{ opacity: 0.7 }}>© PetPaw · Academic prototype</span>
      </div>
      <div className="auth-form">
        <div className={`auth-card ${wide ? 'wide' : ''}`}>
          <div className="row between">
            <Link to="/" className="small row" style={{ gap: 6, color: 'var(--muted)' }}><ArrowLeft size={15} /> Back to website</Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, invalid, placeholder = 'Password', autoComplete = 'current-password' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-icon">
      <Lock size={16} />
      <input id={id} type={show ? 'text' : 'password'} className={`input ${invalid ? 'invalid' : ''}`} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} style={{ paddingRight: 46 }} />
      <button type="button" className="trail btn btn-ghost btn-sm" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
);

/* ---------------- Login ---------------- */
export function Login() {
  const { signIn, toast } = useApp();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [err, setErr] = useState({});
  const [formErr, setFormErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.email.trim()) er.email = 'Enter your email address';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'That doesn’t look like an email address';
    if (!form.password) er.password = 'Enter your password';
    setErr(er);
    setFormErr('');
    if (Object.keys(er).length) return;
    setLoading(true);
    try {
      const { user, token } = await api.post('/auth/login', { email: form.email.trim(), password: form.password });
      signIn(user, token);
      toast(`Welcome back, ${user.name.split(' ')[0]}!`);
      const next = params.get('next');
      nav(next && next.startsWith('/') ? next : portalHome(user.role), { replace: true });
    } catch (ex) {
      setFormErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div>
        <h1 style={{ fontSize: 30 }}>Welcome back</h1>
        <p className="muted">Sign in to manage your pets, bookings and orders.</p>
      </div>
      {params.get('next') && <div className="alert alert-info"><AlertCircle size={18} /> Please sign in to continue. You’ll go straight back to where you were.</div>}
      {formErr && <div className="alert alert-bad" role="alert"><AlertCircle size={18} /> {formErr}</div>}
      <form className="stack" onSubmit={submit} noValidate>
        <Field label="Email address" error={err.email} htmlFor="email">
          <div className="input-icon"><Mail size={16} /><input id="email" type="email" autoComplete="email" className={`input ${err.email ? 'invalid' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
        </Field>
        <Field label="Password" error={err.password} htmlFor="password">
          <PasswordInput id="password" value={form.password} invalid={err.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <div className="row between">
          <label className="check"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember me</label>
          <Link to="/forgot-password" className="small" style={{ fontWeight: 600 }}>Forgot password?</Link>
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={loading}>{loading ? <><span className="spinner" /> Signing in…</> : 'Login'}</button>
      </form>
      <div className="divider">or</div>
      <button className="btn btn-outline btn-block" onClick={() => toast('Google sign-in is not connected in this prototype', 'info')}><GoogleIcon /> Continue with Google</button>
      <p className="small muted" style={{ textAlign: 'center' }}>New to PetPaw? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link></p>
      <div className="card pad-sm stack sm" style={{ background: 'var(--bg)' }}>
        <div className="small"><strong>Demo accounts</strong> <span className="muted">— password <code>{DEMO_PASSWORD}</code>. Tap to fill.</span></div>
        <div className="demo-list">
          {DEMO_ACCOUNTS.filter((a) => a.role !== 'borrow').map((a) => (
            <button key={a.email} type="button" onClick={() => { setForm({ ...form, email: a.email, password: DEMO_PASSWORD }); setErr({}); setFormErr(''); }}>
              <strong style={{ display: 'block' }}>{a.label}</strong><span className="tiny muted">{a.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

/* ---------------- Register ---------------- */
const TYPES = [
  { v: 'user', label: 'User', role: 'user', icon: User, text: 'Pet owner — book care, shop, post ads, borrow pets' },
  { v: 'hospital', label: 'Pet Hospital', role: 'hospital', icon: Hospital, text: 'Clinic or hospital offering appointments' },
  { v: 'doctor', label: 'Pet Doctor', role: 'doctor', icon: Stethoscope, text: 'Registered vet offering consultations' },
  { v: 'pharmacy', label: 'Pharmacy', role: 'pharmacy', icon: Pill, text: 'Licensed veterinary pharmacy' },
  { v: 'shop', label: 'Pet Shop', role: 'shop', icon: ShoppingBag, text: 'Food, toys and supplies seller' },
  { v: 'admin', label: 'Admin', role: 'admin', icon: ShieldCheck, text: 'PetPaw team — verify providers and manage the platform.  Only one admin account can be created.' },
];
const SIDE = {
  user: { title: 'Join the PetPaw community', text: 'Pet owners get started instantly — book vets, shop, post ads and borrow pets.' },
  hospital: { title: 'Bring your hospital online', text: 'Get appointments from pet owners nearby. Submit your licence once and earn a Verified badge.' },
  doctor: { title: 'Grow your vet practice', text: 'Offer consultations and manage your schedule. Your BVC registration is checked before you go live.' },
  pharmacy: { title: 'Reach more pet owners', text: 'List veterinary medicines and receive orders. Licensed pharmacies only.' },
  shop: { title: 'Sell to pet lovers', text: 'Open your pet shop online with delivery and pickup. Quick verification, then you’re live.' },
  admin: { title: 'Run the PetPaw platform', text: 'Review provider applications, moderate listings and keep the community safe.' },
};
const SIDE_POINTS = {
  user: [{ icon: CheckCircle2, text: 'Free and instant — no documents' }, { icon: Lock, text: 'Your contact details stay private' }],
  admin: [{ icon: KeyRound, text: 'Single admin account' }, { icon: ShieldCheck, text: 'All admin actions are accountable' }],
};
const DOCS = {
  hospital: ['Trade licence', 'DLS clinic registration'],
  doctor: ['BVC registration card', 'DVM degree certificate'],
  pharmacy: ['DGDA drug licence', 'Trade licence'],
  shop: ['Trade licence'],
};

export function Register() {
  const { db, signIn, toast } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', type: 'user', terms: false, bizName: '', licence: '', address: '', area: 'Dhanmondi', qual: '', spec: '', exp: '', fee: '', hospitalId: '', delivery: true, pickup: true, services: [] });
  const [docs, setDocs] = useState({});
  const [err, setErr] = useState({});
  const isAdmin = f.type === 'admin';
  const isProvider = f.type !== 'user' && !isAdmin;
  const up = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const pwScore = useMemo(() => {
    const p = f.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Za-z]/.test(p) && /\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p) || p.length >= 12) s++;
    return s;
  }, [f.password]);

  const validate1 = () => {
    const er = {};
    if (f.name.trim().length < 3) er.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Enter a valid email, e.g. name@mail.com';
    if (!/^(\+?880)?0?1[3-9]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) er.phone = 'Enter a Bangladeshi mobile number, e.g. 01712-345678';
    if (f.password.length < 8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) er.password = 'Use at least 8 characters with letters and numbers';
    if (f.confirm !== f.password) er.confirm = 'Passwords don’t match';
    if (!f.terms) er.terms = 'Please accept the Terms and Privacy Policy to continue';
    setErr(er);
    return !Object.keys(er).length;
  };
  const validate2 = () => {
    const er = {};
    if (f.type !== 'doctor' && f.bizName.trim().length < 3) er.bizName = 'Enter the business name';
    if (!f.licence.trim()) er.licence = f.type === 'doctor' ? 'Enter your BVC registration number' : 'Enter the licence number';
    if (f.address.trim().length < 8) er.address = 'Enter a full address with road and house number';
    if (f.type === 'doctor' && !f.spec.trim()) er.spec = 'Enter your specialization';
    if (f.type === 'doctor' && !(Number(f.fee) > 0)) er.fee = 'Enter a consultation fee in Taka';
    const missing = DOCS[f.type].filter((d) => !docs[d]);
    if (missing.length) er.docs = `Upload: ${missing.join(', ')}`;
    setErr(er);
    return !Object.keys(er).length;
  };

  // Server field names -> form field names, and which step each belongs to.
  const FIELD_MAP = { business_name: 'bizName', documents: 'docs' };
  const STEP1 = ['name', 'email', 'phone', 'password'];

  const finish = async () => {
    setLoading(true);
    const body = new FormData();
    body.append('role', f.type);
    body.append('name', f.name.trim());
    body.append('email', f.email.trim());
    body.append('phone', f.phone.trim());
    body.append('password', f.password);
    if (isProvider) {
      const extra = { business_name: f.bizName, licence: f.licence, area: f.area, address: f.address };
      if (f.type === 'doctor') Object.assign(extra, { qual: f.qual, spec: f.spec, exp: f.exp, fee: f.fee, hospital_ref: f.hospitalId });
      if (f.type === 'shop') Object.assign(extra, { delivery: f.delivery ? '1' : '0', pickup: f.pickup ? '1' : '0' });
      Object.entries(extra).forEach(([k, v]) => { if (v !== '' && v != null) body.append(k, v); });
      DOCS[f.type].forEach((label) => body.append(`documents[${label}]`, docs[label]));
    }
    try {
      const { user, token } = await api.post('/auth/register', body);
      signIn(user, token);
      if (isAdmin) { toast('Admin account created. Welcome to the team!'); nav('/admin/dashboard'); }
      else if (isProvider) { toast('Application submitted for verification'); nav('/application-status'); }
      else { toast('Account created. Welcome to PetPaw!'); nav('/user/dashboard?welcome=1'); }
    } catch (ex) {
      if (!(ex instanceof ApiError) || !Object.keys(ex.errors).length) { toast(ex.message, 'bad'); return; }
      const er = {};
      Object.entries(ex.errors).forEach(([k, msgs]) => {
        const key = FIELD_MAP[k] || FIELD_MAP[k.split('.')[0]] || k;
        er[key] = er[key] || msgs[0];
      });
      setErr(er);
      if (Object.keys(er).some((k) => STEP1.includes(k))) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const strength = ['Too weak', 'Weak', 'Good', 'Strong'][pwScore];
  return (
    <AuthShell wide title={SIDE[f.type].title} text={SIDE[f.type].text} points={SIDE_POINTS[f.type]}>
      <div>
        <h1 style={{ fontSize: 30 }}>Create your account</h1>
        <p className="muted">{isProvider ? `Step ${step} of 2 — ${step === 1 ? 'Account details' : 'Business details & documents'}` : isAdmin ? 'Restricted — only one admin account can exist.' : 'It takes less than a minute.'}</p>
      </div>
      {isProvider && <div className="progress-steps" aria-hidden="true"><div className="on" /><div className={step === 2 ? 'on' : ''} /></div>}

      {step === 1 && (
        <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); if (!validate1()) return; if (isProvider) setStep(2); else finish(); }}>
          <div className="field">
            <span className="label">I’m joining as</span>
            <div className="role-tabs" role="radiogroup" aria-label="Account type">
              {TYPES.map((t) => (
                <button type="button" key={t.v} role="radio" aria-checked={f.type === t.v} className={`role-tab ${t.v === 'admin' ? 'admin' : ''} ${f.type === t.v ? 'on' : ''}`} onClick={() => { setF({ ...f, type: t.v }); setErr({}); }}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>
            <div className="role-note">
              {React.createElement(TYPES.find((t) => t.v === f.type).icon, { size: 18 })}
              <span>{TYPES.find((t) => t.v === f.type).text}</span>
            </div>
          </div>
          <div className="form-grid">
            <Field label={isProvider ? 'Contact person full name' : 'Full name'} required error={err.name} htmlFor="r-name"><div className="input-icon"><User size={16} /><input id="r-name" className={`input ${err.name ? 'invalid' : ''}`} value={f.name} onChange={up('name')} autoComplete="name" placeholder="e.g. Ayesha Rahman" /></div></Field>
            <Field label="Phone number" required error={err.phone} htmlFor="r-phone"><div className="input-icon"><Phone size={16} /><input id="r-phone" className={`input ${err.phone ? 'invalid' : ''}`} value={f.phone} onChange={up('phone')} placeholder="01712-345678" autoComplete="tel" /></div></Field>
            <Field label="Email address" required error={err.email} full htmlFor="r-email"><div className="input-icon"><Mail size={16} /><input id="r-email" type="email" className={`input ${err.email ? 'invalid' : ''}`} value={f.email} onChange={up('email')} autoComplete="email" placeholder="you@example.com" /></div></Field>
            <Field label="Password" required error={err.password} hint={f.password ? `Strength: ${strength}` : 'At least 8 characters with letters and numbers'} htmlFor="r-pw">
              <PasswordInput id="r-pw" value={f.password} onChange={up('password')} invalid={err.password} autoComplete="new-password" />
              <div className={`pw-meter s${f.password ? pwScore : 0}`} aria-hidden="true"><i /><i /><i /></div>
            </Field>
            <Field label="Confirm password" required error={err.confirm} htmlFor="r-pw2"><PasswordInput id="r-pw2" value={f.confirm} onChange={up('confirm')} invalid={err.confirm} placeholder="Repeat password" autoComplete="new-password" /></Field>
          </div>
          <div>
            <label className="check"><input type="checkbox" checked={f.terms} onChange={up('terms')} /> <span>I agree to the <Link to="/policy/terms" target="_blank">Terms & Conditions</Link> and <Link to="/policy/privacy" target="_blank">Privacy Policy</Link>.</span></label>
            {err.terms && <span className="error-text">{err.terms}</span>}
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>{loading ? <><span className="spinner" /> Creating account…</> : isProvider ? 'Continue to business details' : isAdmin ? 'Create Admin Account' : 'Create Account'}</button>
          <p className="small muted" style={{ textAlign: 'center' }}>Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Login</Link></p>
        </form>
      )}

      {step === 2 && (
        <form className="stack" noValidate onSubmit={(e) => { e.preventDefault(); if (validate2()) finish(); }}>
          <div className="form-grid">
            {f.type !== 'doctor' && <Field label={`${TYPES.find((t) => t.v === f.type).label} name`} required error={err.bizName} full htmlFor="r-biz"><input id="r-biz" className={`input ${err.bizName ? 'invalid' : ''}`} value={f.bizName} onChange={up('bizName')} /></Field>}
            <Field label={f.type === 'doctor' ? 'BVC registration number' : f.type === 'pharmacy' ? 'DGDA drug licence number' : 'Trade licence number'} required error={err.licence} htmlFor="r-lic"><input id="r-lic" className={`input ${err.licence ? 'invalid' : ''}`} value={f.licence} onChange={up('licence')} placeholder={f.type === 'doctor' ? 'BVC-00000' : 'e.g. TRAD/DNCC/012345/2026'} /></Field>
            <Field label="Area" required htmlFor="r-area"><select id="r-area" className="select" value={f.area} onChange={up('area')}>{AREAS.map((a) => <option key={a.name}>{a.name}</option>)}</select></Field>
            <Field label={f.type === 'doctor' ? 'Chamber / practice address' : 'Full address'} required error={err.address} full hint="You can set the exact map pin from your portal after approval." htmlFor="r-addr"><input id="r-addr" className={`input ${err.address ? 'invalid' : ''}`} value={f.address} onChange={up('address')} placeholder="House, road, area, Dhaka" /></Field>
            {f.type === 'doctor' && (
              <>
                <Field label="Qualification" htmlFor="r-q"><input id="r-q" className="input" value={f.qual} onChange={up('qual')} placeholder="DVM (BAU)" /></Field>
                <Field label="Specialization" required error={err.spec} htmlFor="r-s"><input id="r-s" className={`input ${err.spec ? 'invalid' : ''}`} value={f.spec} onChange={up('spec')} placeholder="e.g. Dermatology" /></Field>
                <Field label="Years of experience" htmlFor="r-e"><input id="r-e" type="number" min="0" className="input" value={f.exp} onChange={up('exp')} /></Field>
                <Field label="Consultation fee (৳)" required error={err.fee} htmlFor="r-f"><input id="r-f" type="number" min="0" className={`input ${err.fee ? 'invalid' : ''}`} value={f.fee} onChange={up('fee')} /></Field>
                <Field label="Affiliated hospital (optional)" full htmlFor="r-h"><select id="r-h" className="select" value={f.hospitalId} onChange={up('hospitalId')}><option value="">Independent practice</option>{db.hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field>
              </>
            )}
            {f.type === 'shop' && (
              <div className="full row" style={{ gap: 20 }}>
                <label className="check"><input type="checkbox" checked={f.delivery} onChange={up('delivery')} /> Home delivery</label>
                <label className="check"><input type="checkbox" checked={f.pickup} onChange={up('pickup')} /> Store pickup</label>
              </div>
            )}
          </div>
          <div className="field">
            <span className="label">Verification documents <span className="req">*</span></span>
            <span className="hint">PDF or image, up to 5 MB each. Only the PetPaw verification team can see these.</span>
            <div className="stack sm">
              {DOCS[f.type].map((d) => (
                <div key={d}>
                  {docs[d] ? (
                    <div className="doc-thumb"><Paperclip size={15} /> <span className="grow"><strong>{d}:</strong> {docs[d].name}</span><button type="button" className="btn btn-ghost btn-sm" onClick={() => { const n = { ...docs }; delete n[d]; setDocs(n); }} aria-label={`Remove ${d}`}><Trash2 size={14} /></button></div>
                  ) : (
                    <label className="upload">
                      <input type="file" className="sr-only" accept=".pdf,image/*" onChange={(e) => e.target.files[0] && setDocs({ ...docs, [d]: e.target.files[0] })} />
                      <FileUp size={20} style={{ margin: '0 auto 4px' }} /> Upload <strong>{d}</strong>
                    </label>
                  )}
                </div>
              ))}
            </div>
            {err.docs && <span className="error-text">{err.docs}</span>}
          </div>
          <div className="alert alert-info"><BadgeCheck size={18} /> After you submit, your account is <strong>Pending Verification</strong>. You can sign in and set up your profile, but you won’t appear as verified until an admin approves your documents.</div>
          <div className="row between">
            <button type="button" className="btn btn-outline" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
            <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? <><span className="spinner" /> Submitting…</> : 'Submit for verification'}</button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}

/* ---------------- Forgot / Reset ---------------- */
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Enter the email you registered with'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 700);
  };
  return (
    <AuthShell>
      <div>
        <h1 style={{ fontSize: 30 }}>Reset your password</h1>
        <p className="muted">Enter your email and we’ll send a 6-digit verification code.</p>
      </div>
      {sent ? (
        <div className="stack">
          <div className="alert alert-ok"><CheckCircle2 size={18} /> <span>If an account exists for <strong>{email}</strong>, a code is on its way. It expires in 15 minutes.</span></div>
          <p className="small muted">Prototype: no email is actually sent. Use code <code>123456</code>.</p>
          <Link className="btn btn-primary btn-block" to={`/reset-password?email=${encodeURIComponent(email)}`}>Enter code</Link>
          <button className="btn btn-ghost" onClick={() => setSent(false)}>Use a different email</button>
        </div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <Field label="Email address" error={err} htmlFor="fp-email">
            <div className="input-icon"><Mail size={16} /><input id="fp-email" type="email" className={`input ${err ? 'invalid' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          </Field>
          <button className="btn btn-primary btn-lg btn-block" disabled={loading}>{loading ? <><span className="spinner" /> Sending…</> : 'Send reset code'}</button>
        </form>
      )}
      <p className="small muted" style={{ textAlign: 'center' }}>Remembered it? <Link to="/login" style={{ fontWeight: 600 }}>Back to login</Link></p>
    </AuthShell>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { toast } = useApp();
  const [f, setF] = useState({ code: '', pw: '', pw2: '' });
  const [err, setErr] = useState({});
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!/^\d{6}$/.test(f.code)) er.code = 'Enter the 6-digit code from the email';
    else if (f.code !== '123456') er.code = 'That code is incorrect or has expired. Request a new one.';
    if (f.pw.length < 8 || !/\d/.test(f.pw) || !/[A-Za-z]/.test(f.pw)) er.pw = 'Use at least 8 characters with letters and numbers';
    if (f.pw2 !== f.pw) er.pw2 = 'Passwords don’t match';
    setErr(er);
    if (Object.keys(er).length) return;
    setDone(true);
  };
  return (
    <AuthShell>
      <div>
        <h1 style={{ fontSize: 30 }}>Choose a new password</h1>
        <p className="muted">{params.get('email') ? `For ${params.get('email')}` : 'Enter the code we sent you.'}</p>
      </div>
      {done ? (
        <div className="stack">
          <div className="alert alert-ok"><CheckCircle2 size={18} /> Password updated. You can now log in with your new password.</div>
          <button className="btn btn-primary btn-block" onClick={() => { toast('Password updated'); nav('/login'); }}>Go to login</button>
        </div>
      ) : (
        <form className="stack" onSubmit={submit} noValidate>
          <Field label="Verification code" error={err.code} htmlFor="rp-code"><input id="rp-code" inputMode="numeric" maxLength={6} className={`input ${err.code ? 'invalid' : ''}`} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, '') })} placeholder="000000" style={{ letterSpacing: '0.4em', fontWeight: 700 }} /></Field>
          <Field label="New password" error={err.pw} htmlFor="rp-pw"><PasswordInput id="rp-pw" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} invalid={err.pw} autoComplete="new-password" /></Field>
          <Field label="Confirm new password" error={err.pw2} htmlFor="rp-pw2"><PasswordInput id="rp-pw2" value={f.pw2} onChange={(e) => setF({ ...f, pw2: e.target.value })} invalid={err.pw2} autoComplete="new-password" /></Field>
          <button className="btn btn-primary btn-lg btn-block">Update password</button>
          <Link to="/forgot-password" className="small" style={{ textAlign: 'center' }}>Didn’t get a code? Send again</Link>
        </form>
      )}
    </AuthShell>
  );
}

/* ---------------- Provider application status ---------------- */
export function ApplicationStatus() {
  const { db, set, toast } = useApp();
  const [app, setApp] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const isProviderRole = ['hospital', 'doctor', 'pharmacy', 'shop'].includes(db.auth?.role);
  useEffect(() => {
    if (!isProviderRole) { setLoaded(true); return; }
    api.get('/application').then((r) => setApp(r.application)).catch((e) => toast(e.message, 'bad')).finally(() => setLoaded(true));
  }, [isProviderRole]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!db.auth) {
    return <AuthShell><h1 style={{ fontSize: 28 }}>Application status</h1><p className="muted">Log in with your provider account to see your verification status.</p><Link to="/login?next=/application-status" className="btn btn-primary">Login</Link></AuthShell>;
  }
  if (!loaded) return <AuthShell><p className="muted">Loading your application…</p></AuthShell>;
  if (!app) {
    return <AuthShell><h1 style={{ fontSize: 28 }}>No application found</h1><p className="muted">This account didn’t submit a provider application.</p><Link to={portalHome(db.auth.role)} className="btn btn-primary">Go to dashboard</Link></AuthShell>;
  }
  const steps = [
    { title: 'Application submitted', text: fmtDate(app.submitted), state: 'done' },
    { title: 'Documents under review', text: 'Usually within 1–2 working days', state: app.status === 'Pending Verification' ? 'now' : 'done' },
    app.status === 'Corrections Requested'
      ? { title: 'Corrections requested', text: app.notes, state: 'fail' }
      : app.status === 'Rejected'
        ? { title: 'Application rejected', text: app.notes, state: 'fail' }
        : { title: 'Verified', text: app.status === 'Approved' ? 'Your Verified badge is live.' : 'Pending admin decision', state: app.status === 'Approved' ? 'done' : '' },
  ];
  const resubmit = async () => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append('document', file);
      const { application } = await api.post('/application/resubmit', body);
      setApp(application);
      set('applications', [application]);
      setFile(null);
      toast('Corrected documents submitted');
    } catch (ex) {
      toast(ex.errors?.document?.[0] || ex.message, 'bad');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell wide title="Verification keeps pet owners safe" text="We check every provider’s licence and registration before showing a Verified badge.">
      <div className="row between">
        <div>
          <h1 style={{ fontSize: 28 }}>Application status</h1>
          <p className="muted">{app.name} · {app.type} · {app.id}</p>
        </div>
        <Chip status={app.status} />
      </div>
      <div className="card"><Timeline steps={steps} /></div>
      {app.status === 'Corrections Requested' && (
        <div className="card stack">
          <h3>Upload corrected document</h3>
          <div className="alert alert-warn"><AlertCircle size={18} /> <span><strong>Reviewer note:</strong> {app.notes}</span></div>
          {file ? <div className="doc-thumb"><Paperclip size={15} /> {file.name}</div> : (
            <label className="upload"><input type="file" className="sr-only" onChange={(e) => e.target.files[0] && setFile(e.target.files[0])} accept=".pdf,image/*" /><FileUp size={20} style={{ margin: '0 auto 4px' }} /> Choose file</label>
          )}
          <button className="btn btn-primary" disabled={!file || busy} onClick={resubmit}>{busy ? <><span className="spinner" /> Uploading…</> : 'Re-submit for review'}</button>
        </div>
      )}
      <div className="card stack sm">
        <h4>Submitted documents</h4>
        {app.docs.map((d) => <div key={d} className="doc-thumb"><Paperclip size={15} /> {d}</div>)}
      </div>
      <div className="row">
        <Link to={portalHome(db.auth.role)} className="btn btn-primary"><Building2 size={16} /> Set up my portal</Link>
        <span className="small muted">An admin will review your documents, usually within 1–2 working days.</span>
      </div>
    </AuthShell>
  );
}
