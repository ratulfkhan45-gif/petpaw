import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Bell, ChevronsLeft, ChevronsRight, Globe, LogOut, Menu, RefreshCcw, Search, ShieldAlert, ShoppingCart, UserCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../data/mock.js';
import { PORTALS, badgeCount, portalHome } from '../portals/config.js';
import { Logo } from './PublicLayout.jsx';
import { Initials } from './ui.jsx';

function useOutside(ref, onOut) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && onOut();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOut]);
}

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 960);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= 960);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
}

export function PermissionDenied({ portal }) {
  const { db } = useApp();
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="empty">
          <div className="ico" style={{ background: 'var(--bad-bg)', color: 'var(--bad)' }}><ShieldAlert size={26} /></div>
          <h4>You don’t have access to the {PORTALS[portal].title}</h4>
          <p className="small">You are signed in as <strong>{db.auth?.name}</strong> ({db.auth?.role}). Each role can only open its own portal, even if the address is typed directly.</p>
          <Link className="btn btn-primary" to={portalHome(db.auth?.role)} style={{ marginTop: 10 }}>Go to my dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default function PortalLayout({ portal }) {
  const { db, logout, signIn, confirm, resetDemo, set, toast } = useApp();
  const cfg = PORTALS[portal];
  const loc = useLocation();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(null);
  const menuRef = useRef(null);
  const mobile = useIsMobile();
  useOutside(menuRef, () => setMenu(null));
  useEffect(() => { setDrawer(false); setMenu(null); window.scrollTo(0, 0); }, [loc.pathname]);
  // Keep the provider's pending flag in sync with the admin's verification decision
  const app = db.auth?.appId ? db.applications.find((a) => a.id === db.auth.appId) : null;
  useEffect(() => {
    if (app && db.auth.pending !== (app.status !== 'Approved')) set('auth', (a) => ({ ...a, pending: app.status !== 'Approved' }));
  }, [app?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!db.auth) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!cfg.roles.includes(db.auth.role)) return <PermissionDenied portal={portal} />;

  const notifs = db.notifications[portal] || [];
  const unread = notifs.filter((n) => !n.read).length;
  const cartCount = db.cart.reduce((s, c) => s + c.qty, 0);
  const doLogout = () => confirm({ title: 'Log out?', body: 'You will need to sign in again to manage bookings, orders and listings.', confirmLabel: 'Log out', onConfirm: () => { logout(); nav('/'); toast('You have been logged out', 'info'); } });
  const switchTo = async (acc) => {
    try {
      const { user, token } = await api.post('/auth/login', { email: acc.email, password: DEMO_PASSWORD });
      logout();
      signIn(user, token);
      nav(portalHome(user.role));
      toast(`Switched to ${acc.label} (${acc.name})`, 'info');
    } catch (ex) {
      toast(ex.message, 'bad');
    }
  };
  const markAll = () => set('notifications', (n) => ({ ...n, [portal]: (n[portal] || []).map((x) => ({ ...x, read: true })) }));

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${drawer ? 'drawer' : ''}`}>
      <aside className="sidebar" aria-label={`${cfg.title} navigation`}>
        <div className="brand"><Logo to={portalHome(db.auth.role)} /></div>
        <div className="portal-tag" title={cfg.title}><Globe size={14} /><span>{cfg.title}</span></div>
        <nav>
          {cfg.nav.map((n) => {
            const count = n.badge ? badgeCount(n.badge, db, portal) : 0;
            return (
              <NavLink key={n.to} to={`${cfg.base}/${n.to}`} className={({ isActive }) => (isActive ? 'active' : '')} title={n.label}>
                <n.icon size={18} style={{ flexShrink: 0 }} />
                <span className="nav-label">{n.label}</span>
                {count > 0 && <span className="cnt">{count}</span>}
              </NavLink>
            );
          })}
          {portal === 'user' && <NavLink to="/borrow/dashboard" title="Open Pet Borrow portal"><ArrowLeftRight size={18} /><span className="nav-label">Open Pet Borrow portal</span></NavLink>}
          {portal === 'borrow' && <NavLink to="/user/dashboard" title="Back to User portal"><ArrowLeftRight size={18} /><span className="nav-label">Back to User portal</span></NavLink>}
          <button className="logout" onClick={doLogout} title="Logout"><LogOut size={18} /><span className="nav-label">Logout</span></button>
        </nav>
      </aside>
      <div className="scrim" onClick={() => setDrawer(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => (mobile ? setDrawer(true) : setCollapsed(!collapsed))} aria-label={mobile ? 'Open navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {mobile ? <Menu size={18} /> : collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
          <form className="search input-icon" onSubmit={(e) => { e.preventDefault(); const q = e.currentTarget.q.value.trim(); if (!q) return; if (portal === 'user') nav(`/user/hospitals?q=${encodeURIComponent(q)}`); else toast('Search across this portal is a prototype placeholder', 'info'); }}>
            <Search size={16} />
            <input name="q" className="input" placeholder={portal === 'user' ? 'Search hospitals, doctors, areas…' : 'Search…'} aria-label="Search" />
          </form>
          <div className="grow" />
          {portal === 'user' && (
            <Link to="/user/cart" className="icon-btn" aria-label={`Cart, ${cartCount} items`}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="badge-dot">{cartCount}</span>}
            </Link>
          )}
          <div style={{ position: 'relative' }} ref={menu ? menuRef : undefined}>
            <button className="icon-btn" onClick={() => setMenu(menu === 'n' ? null : 'n')} aria-label={`Notifications, ${unread} unread`}>
              <Bell size={18} />
              {unread > 0 && <span className="badge-dot">{unread}</span>}
            </button>
            {menu === 'n' && (
              <div className="menu-pop" style={{ width: 340 }}>
                <div className="row between" style={{ padding: '6px 8px 10px' }}>
                  <strong>Notifications</strong>
                  <button className="btn btn-ghost btn-sm" style={{ width: 'auto' }} onClick={markAll}>Mark all read</button>
                </div>
                {notifs.slice(0, 5).map((n) => (
                  <Link key={n.id} to={n.link || `${cfg.base}/notifications`} className={`notif-item ${n.read ? '' : 'unread'}`} style={{ display: 'flex' }}>
                    <Bell size={15} style={{ marginTop: 3, flexShrink: 0, color: 'var(--green)' }} />
                    <span className="small">{n.text}<br /><span className="tiny muted">{n.at}</span></span>
                  </Link>
                ))}
                {notifs.length === 0 && <p className="small muted" style={{ padding: 10 }}>No notifications yet.</p>}
                <Link to={`${cfg.base}/notifications`} style={{ justifyContent: 'center', color: 'var(--green)', fontWeight: 600 }}>View all</Link>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }} ref={menu === 'p' ? menuRef : undefined}>
            <button className="row" style={{ gap: 8, border: 0, background: 'none', cursor: 'pointer', padding: 2 }} onClick={() => setMenu(menu === 'p' ? null : 'p')} aria-label="Account menu">
              <Initials name={db.auth.name} />
              <span className="small" style={{ textAlign: 'left', lineHeight: 1.3 }}>
                <strong style={{ display: 'block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{db.auth.name}</strong>
                <span className="muted tiny">{cfg.short}</span>
              </span>
            </button>
            {menu === 'p' && (
              <div className="menu-pop">
                <div style={{ padding: '6px 10px 10px', borderBottom: '1px solid var(--line-soft)', marginBottom: 6 }}>
                  <strong>{db.auth.name}</strong>
                  <div className="tiny muted">{db.auth.email}</div>
                </div>
                <Link to={`${cfg.base}/${portal === 'user' ? 'settings' : portal === 'doctor' ? 'profile' : 'settings'}`}><UserCircle2 size={16} /> Profile & settings</Link>
                <Link to="/"><Globe size={16} /> Public website</Link>
                <div className="tiny muted" style={{ padding: '10px 10px 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Prototype: switch role</div>
                {DEMO_ACCOUNTS.filter((a) => a.role !== db.auth.role && a.role !== 'borrow').map((a) => (
                  <button key={a.email} onClick={() => switchTo(a)}><ArrowLeftRight size={15} /> {a.label}</button>
                ))}
                <button onClick={() => confirm({ title: 'Reset demo data?', body: 'All bookings, orders and changes you made in this browser will return to the original sample data.', confirmLabel: 'Reset', danger: true, warning: 'Your demo changes will be lost.', onConfirm: () => { resetDemo(); toast('Demo data reset'); } })}><RefreshCcw size={15} /> Reset demo data</button>
                <button onClick={doLogout} style={{ color: 'var(--bad)' }}><LogOut size={16} /> Logout</button>
              </div>
            )}
          </div>
        </header>
        {db.auth.pending && (
          <div className="alert alert-warn" style={{ margin: '16px 24px 0', borderRadius: 10 }}>
            <ShieldAlert size={18} />
            <span><strong>Pending verification.</strong> Your profile is not shown as verified and is hidden from public search until an admin approves your documents. <Link to="/application-status">View application status</Link></span>
          </div>
        )}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
