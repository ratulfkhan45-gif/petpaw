import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Menu, PawPrint, Phone, X, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { portalHome } from '../portals/config.js';

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="PetPaw home">
      <span className="mark"><PawPrint size={19} /></span>
      <span className="logo-text">Pet<span className="accent">Paw</span></span>
    </Link>
  );
}

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/services', label: 'Services' },
  { to: '/explore/marketplace', label: 'Pet Marketplace' },
  { to: '/explore/borrow', label: 'Pet Borrow' },
  { to: '/contact', label: 'Contact Us' },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const { db } = useApp();
  const loc = useLocation();
  React.useEffect(() => setOpen(false), [loc.pathname]);
  return (
    <header className="pub-nav">
      <div className="container inner">
        <Logo />
        <nav className="pub-links" aria-label="Main">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'on' : '')}>{l.label}</NavLink>)}
        </nav>
        <div className="row pub-actions" style={{ gap: 8 }}>
          {db.auth ? (
            <Link to={portalHome(db.auth.role)} className="btn btn-primary">Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-secondary">Sign Up</Link>
            </>
          )}
        </div>
        <button className="icon-btn pub-burger" onClick={() => setOpen(!open)} aria-label="Open menu" aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && (
        <div className="mobile-menu">
          {LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          <div className="stack" style={{ marginTop: 12 }}>
            {db.auth ? <Link to={portalHome(db.auth.role)} className="btn btn-primary btn-block">Go to dashboard</Link> : (
              <>
                <Link to="/login" className="btn btn-outline btn-block">Login</Link>
                <Link to="/register" className="btn btn-secondary btn-block">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="stack">
            <Logo />
            <p className="small" style={{ maxWidth: 320 }}>Verified vets, pharmacies, pet shops and a responsible pet community — in one place, for pet families across Bangladesh.</p>
            <div className="social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={17} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={17} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
            </div>
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link to="/explore/hospitals">Pet Hospitals</Link></li>
              <li><Link to="/explore/doctors">Pet Doctors</Link></li>
              <li><Link to="/explore/pharmacy">Pharmacy</Link></li>
              <li><Link to="/explore/shop">Pet Shop</Link></li>
              <li><Link to="/explore/marketplace">Pet Marketplace</Link></li>
              <li><Link to="/explore/borrow">Pet Borrow</Link></li>
            </ul>
          </div>
          <div>
            <h4>Policies</h4>
            <ul>
              <li><Link to="/policy/terms">Terms & Conditions</Link></li>
              <li><Link to="/policy/privacy">Privacy Policy</Link></li>
              <li><Link to="/policy/borrow">Pet Borrow Policy</Link></li>
              <li><Link to="/policy/listings">Listing Guidelines</Link></li>
              <li><Link to="/register">Become a provider</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><MapPin size={15} /> House 00, Road 00, Dhaka 1209</li>
              <li className="row" style={{ gap: 8 }}><Phone size={15} /> +880 1XXX-XXXXXX</li>
              <li className="row" style={{ gap: 8 }}><Mail size={15} /> support@petpaw.example</li>
            </ul>
          </div>
        </div>
        <div className="row between small" style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <span>© {new Date().getFullYear()} PetPaw. Academic prototype.</span>
          <span>Prices in Bangladeshi Taka (৳)</span>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
