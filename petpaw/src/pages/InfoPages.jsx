import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BadgeCheck, HandHeart, Mail, MapPin, Phone, ShieldCheck, Users } from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import { Img } from '../components/ui.jsx';
import { IMG } from '../data/mock.js';
import { SERVICES } from './Landing.jsx';

function PageBand({ eyebrow, title, text }) {
  return (
    <section className="hero" style={{ paddingBlock: '48px 36px' }}>
      <div className="container stack" style={{ maxWidth: 820, marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="eyebrow">{eyebrow}</div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>{title}</h1>
        {text && <p className="muted" style={{ fontSize: 17 }}>{text}</p>}
      </div>
    </section>
  );
}

export function About() {
  return (
    <PublicLayout>
      <PageBand eyebrow="About us" title="Making good pet care easy to find in Bangladesh" text="PetPaw brings verified hospitals, vets, pharmacies and pet shops together with a community of pet owners, so every pet family can find trustworthy help quickly." />
      <section className="section">
        <div className="container grid g2" style={{ gap: 40, alignItems: 'center' }}>
          <div className="stack">
            <h2>Our mission</h2>
            <p className="muted">Pet owners in Dhaka often rely on word of mouth to find a vet, and on unverified sellers for medicine. PetPaw puts verified information, clear prices in Taka and safe ways to connect in one place.</p>
            <div className="grid g3" style={{ marginTop: 10 }}>
              {[{ i: BadgeCheck, t: 'Verified', d: 'Providers checked before they get a badge' }, { i: ShieldCheck, t: 'Safe', d: 'Prescription rules and private contact details' }, { i: HandHeart, t: 'Caring', d: 'Animal-welfare rules built into Pet Borrow' }].map((x) => (
                <div key={x.t} className="card pad-sm stack sm"><x.i size={22} color="var(--green)" /><strong>{x.t}</strong><span className="small muted">{x.d}</span></div>
              ))}
            </div>
          </div>
          <div className="banner-img" style={{ aspectRatio: '4/3' }}><Img src={IMG.vet2} alt="A vet with a dog" /></div>
        </div>
      </section>
      <section className="section alt">
        <div className="container stack">
          <h2>Seven portals, one platform</h2>
          <p className="muted" style={{ maxWidth: 680 }}>Each role has its own workspace: pet owners, administrators, pet hospitals, pet doctors, pharmacies, pet shops, and the Pet Borrow portal for paid temporary borrowing.</p>
          <div className="row" style={{ marginTop: 10 }}><Link to="/register" className="btn btn-primary">Join PetPaw <ArrowRight size={16} /></Link></div>
        </div>
      </section>
    </PublicLayout>
  );
}

export function Services() {
  return (
    <PublicLayout>
      <PageBand eyebrow="Services" title="What you can do on PetPaw" text="Browse freely. Sign in when you want to book, order, message, post an ad or borrow a pet." />
      <section className="section">
        <div className="container grid g3">
          {SERVICES.map((s) => (
            <Link key={s.key} to={`/explore/${s.key}`} className="service-card hover-card">
              <div className={`ico ${s.tone}`}><s.icon size={24} /></div>
              <h3>{s.title}</h3>
              <p className="muted small">{s.text}</p>
              <span className="go">Explore <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export function Contact() {
  return (
    <PublicLayout>
      <PageBand eyebrow="Contact us" title="We’re here to help" text="Questions about bookings, orders, verification or a listing? Reach our support team." />
      <section className="section">
        <div className="container grid g3">
          {[{ i: Phone, t: 'Call', d: '+880 1XXX-XXXXXX', s: 'Daily, 9 AM – 9 PM' }, { i: Mail, t: 'Email', d: 'support@petpaw.example', s: 'Replies within one working day' }, { i: MapPin, t: 'Office', d: 'House 00, Road 00, Dhanmondi, Dhaka 1209', s: 'By appointment' }].map((c) => (
            <div key={c.t} className="card stack sm"><c.i size={22} color="var(--green)" /><h3>{c.t}</h3><strong>{c.d}</strong><span className="small muted">{c.s}</span></div>
          ))}
        </div>
        <div className="container" style={{ marginTop: 24 }}>
          <Link to="/#contact" className="btn btn-outline">Send us a message</Link>
        </div>
      </section>
    </PublicLayout>
  );
}

const POLICIES = {
  terms: { t: 'Terms & Conditions', p: ['PetPaw connects pet owners with independent providers. Providers are responsible for the services and products they offer.', 'You must give accurate information when booking, ordering, listing or borrowing.', 'Prescription medicines are dispensed only against a valid prescription reviewed by the pharmacy.', 'We may restrict or suspend accounts that break these terms or our listing guidelines.'] },
  privacy: { t: 'Privacy Policy', p: ['We collect only what is needed to run your bookings, orders, ads and borrowings.', 'Your phone number and exact address are never shown publicly. Pet Borrow pickup points are shared only after a booking is confirmed.', 'Location access is optional and used only to show nearby places. It is not stored.', 'Provider verification documents are visible only to the verification team.'] },
  borrow: { t: 'Pet Borrow Policy', p: ['Pet Borrow is a paid, temporary stay. It is not a sale, adoption or rehoming.', 'Owners approve or decline each request. Payment happens only after approval, and a booking is confirmed only after successful payment.', 'The same pet can’t have overlapping confirmed bookings.', 'Borrowers must follow the owner’s care rules. Mistreatment, unsafe arrangements and missed returns can be reported and lead to account action.', 'A platform service commission applies to each booking. The rate is configured by PetPaw and shown before payment.'] },
  listings: { t: 'Listing Guidelines', p: ['Only list pets you own or are authorised to rehome.', 'Use your own photos and describe health honestly.', 'Never ask for advance payment outside the platform.', 'Protected wildlife may not be listed. Suspicious listings are removed.'] },
};
export function Policy() {
  const { key } = useParams();
  const p = POLICIES[key] || POLICIES.terms;
  return (
    <PublicLayout>
      <PageBand eyebrow="Policy" title={p.t} />
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="card stack">
            {p.p.map((x, i) => <p key={i}><strong>{i + 1}.</strong> {x}</p>)}
            <p className="small muted">Prototype text for an academic project. Not legal advice.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export function NotFound() {
  return (
    <PublicLayout>
      <section className="section"><div className="container"><div className="card"><div className="empty"><div className="ico"><Users size={26} /></div><h4>Page not found</h4><p className="small">The page you’re looking for doesn’t exist or has moved.</p><Link to="/" className="btn btn-primary">Go home</Link></div></div></div></section>
    </PublicLayout>
  );
}
