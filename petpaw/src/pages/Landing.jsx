import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BadgeCheck, CalendarCheck, ClipboardCheck, HeartHandshake, Hospital, Megaphone, Pill, Plus, Search,
  ShieldCheck, ShoppingBag, Sparkles, Stethoscope, HandHeart, MapPin, Clock, Mail, Phone, MessageCircle,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout.jsx';
import { Img, Stars, Chip, Empty, Initials, Field } from '../components/ui.jsx';
import { money, useApp } from '../context/AppContext.jsx';
import { IMG, faqs, testimonials } from '../data/mock.js';

export const SERVICES = [
  { key: 'hospitals', icon: Hospital, tone: 'tone-green', title: 'Pet Hospitals', text: 'Find verified hospitals near you, compare services and book a visit.' },
  { key: 'doctors', icon: Stethoscope, tone: 'tone-teal', title: 'Pet Doctors', text: 'Book consultations with registered vets by specialty, fee and time.' },
  { key: 'pharmacy', icon: Pill, tone: 'tone-blue', title: 'Pharmacy', text: 'Order pet medicines. Rx items are dispensed only after prescription review.' },
  { key: 'shop', icon: ShoppingBag, tone: 'tone-orange', title: 'Pet Shop', text: 'Food, toys, leashes, grooming and beds, delivered or ready for pickup.' },
  { key: 'marketplace', icon: Megaphone, tone: 'tone-red', title: 'Pet Marketplace', text: 'Ads for pets for sale, free to a good home, or rehoming. Moderated and reportable.' },
  { key: 'borrow', icon: HeartHandshake, tone: 'tone-teal', title: 'Pet Borrow', text: 'Spend a few paid days with a pet. Owners approve every request first.' },
];

function SectionHead({ eyebrow, title, text, to, cta }) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2 style={{ marginTop: 6 }}>{title}</h2>
        {text && <p className="muted">{text}</p>}
      </div>
      {to && <Link to={to} className="btn btn-outline">{cta} <ArrowRight size={16} /></Link>}
    </div>
  );
}

export default function Landing() {
  const { db, toast } = useApp();
  const nav = useNavigate();
  const [cat, setCat] = useState('hospitals');
  const [q, setQ] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', msg: '' });
  const [cErr, setCErr] = useState({});

  const search = (e) => {
    e.preventDefault();
    nav(`/explore/${cat}${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };
  const sendContact = (e) => {
    e.preventDefault();
    const err = {};
    if (!contact.name.trim()) err.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(contact.email)) err.email = 'Enter a valid email, e.g. name@mail.com';
    if (contact.msg.trim().length < 10) err.msg = 'Tell us a little more (at least 10 characters)';
    setCErr(err);
    if (Object.keys(err).length) return;
    setContact({ name: '', email: '', msg: '' });
    toast('Message sent. Our team replies within one working day (prototype).');
  };

  const ads = db.ads.filter((a) => a.status === 'Active' && !a.reports).slice(0, 4);
  const borrow = db.borrowListings.filter((b) => b.status === 'Active').slice(0, 4);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="stack lg">
            <span className="pill" style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid var(--line)' }}><BadgeCheck size={14} color="var(--green)" /> Verified vets & shops across Dhaka</span>
            <h1>Everything your pet needs, <span className="hl">in one place</span></h1>
            <p className="muted" style={{ fontSize: 17, maxWidth: 540 }}>
              Book a hospital visit, consult a registered vet, order food and medicine, find a new companion, or spend a weekend with a pet through Pet Borrow. All with clear prices in Taka.
            </p>
            <div className="row">
              <a href="#services" className="btn btn-primary btn-lg">Explore Services</a>
              <Link to="/register" className="btn btn-secondary btn-lg">Get Started <ArrowRight size={17} /></Link>
            </div>
            <form className="quick-search" onSubmit={search} role="search">
              <select className="select" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="What are you looking for">
                <option value="hospitals">Hospitals</option>
                <option value="doctors">Doctors</option>
                <option value="shop">Products</option>
                <option value="pharmacy">Medicines</option>
                <option value="borrow">Pets to borrow</option>
                <option value="marketplace">Pet ads</option>
              </select>
              <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or area, e.g. Dhanmondi" aria-label="Search term" />
              <button className="btn btn-primary"><Search size={16} /> Search</button>
            </form>
            <div className="row small muted" style={{ gap: 18 }}>
              <span><strong style={{ color: 'var(--ink)' }}>{db.hospitals.length}</strong> hospitals</span>
              <span><strong style={{ color: 'var(--ink)' }}>{db.doctors.length}</strong> registered vets</span>
              <span><strong style={{ color: 'var(--ink)' }}>{db.products.length}+</strong> products</span>
            </div>
          </div>
          <div className="hero-photo">
            <div className="main"><Img src={IMG.hero} alt="A smiling dog with its owner" /></div>
            <div className="hero-badge" style={{ left: 0, bottom: '14%' }}>
              <div className="avatar" style={{ background: 'var(--green-50)' }}><CalendarCheck size={18} color="var(--green)" /></div>
              <div><strong>Appointment confirmed</strong><div className="tiny muted">Bruno · Today, 4:30 PM</div></div>
            </div>
            <div className="hero-badge" style={{ right: 0, top: '8%' }}>
              <div className="avatar" style={{ background: 'var(--orange-50)' }}><ShieldCheck size={18} color="var(--orange-700)" /></div>
              <div><strong>Rx verified</strong><div className="tiny muted">by VetMed Pharmacy</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section" id="services">
        <div className="container">
          <SectionHead eyebrow="Services" title="One account for every part of pet care" text="Pick what you need today. You can browse without an account and sign in when you’re ready to book or order." />
          <div className="grid g3">
            {SERVICES.map((s) => (
              <Link key={s.key} to={`/explore/${s.key}`} className="service-card hover-card">
                <div className={`ico ${s.tone}`}><s.icon size={24} /></div>
                <h3>{s.title}</h3>
                <p className="muted small">{s.text}</p>
                <span className="go">Explore <ArrowRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hospitals */}
      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Nearby care" title="Featured pet hospitals" to="/explore/hospitals" cta="See all on map" />
          <div className="grid g3">
            {db.hospitals.slice(0, 3).map((h) => (
              <Link to={`/explore/hospitals/${h.id}`} key={h.id} className="media-card hover-card" style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="media"><Img src={h.img} alt={h.name} />{h.open24 && <span className="tag chip chip-green plain">Open 24h</span>}</div>
                <div className="body">
                  <div className="row between"><Stars value={h.rating} count={h.reviews} />{h.verified && <span className="verified"><BadgeCheck size={14} /> Verified</span>}</div>
                  <h3>{h.name}</h3>
                  <div className="small muted row" style={{ gap: 5 }}><MapPin size={14} /> {h.area}</div>
                  <div className="row" style={{ gap: 6, marginTop: 4 }}>{h.services.slice(0, 3).map((s) => <span key={s} className="pill">{s}</span>)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Registered vets" title="Featured pet doctors" to="/explore/doctors" cta="All doctors" />
          <div className="grid g4">
            {db.doctors.slice(0, 4).map((d) => (
              <Link to={`/explore/doctors/${d.id}`} key={d.id} className="card hover-card stack" style={{ color: 'inherit', textDecoration: 'none' }}>
                <Initials name={d.name} img={d.img} size="lg" />
                <div>
                  <h3 style={{ fontSize: 16 }}>{d.name}</h3>
                  <div className="small" style={{ color: 'var(--green)', fontWeight: 600 }}>{d.spec}</div>
                </div>
                <div className="small muted">{d.exp} years experience · {d.area}</div>
                <div className="row between">
                  <span className="price">{money(d.fee)}<span className="muted small" style={{ fontWeight: 400 }}> / visit</span></span>
                  <Stars value={d.rating} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Essentials" title="Pet care essentials" text="From verified shops. Medicines are sold separately through licensed pharmacies." to="/explore/shop" cta="Visit Pet Shop" />
          <div className="grid g4">
            {db.products.filter((p) => p.stock > 0).slice(0, 4).map((p) => (
              <Link to={`/explore/shop/product/${p.id}`} key={p.id} className="media-card hover-card" style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="media" style={{ aspectRatio: '1' }}><Img src={p.img} alt={p.name} /></div>
                <div className="body">
                  <span className="tiny muted">{p.cat}</span>
                  <h4 style={{ fontWeight: 600 }}>{p.name}</h4>
                  <div className="row between" style={{ marginTop: 'auto' }}><span className="price">{money(p.price)}</span><Stars value={p.rating} /></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Pet Marketplace" title="Pets looking for a new family" text="For sale, free to a good home, or rehoming. Every listing can be reported, and our team removes suspicious ads." to="/explore/marketplace" cta="Browse ads" />
          {ads.length === 0 ? <div className="card"><Empty icon={Megaphone} title="No pet ads right now" text="New listings appear here as soon as they are published." /></div> : (
            <div className="grid g4">
              {ads.map((a) => (
                <Link to={`/explore/marketplace/${a.id}`} key={a.id} className="media-card hover-card" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <div className="media"><Img src={a.img} alt={a.name} /><span className="tag"><Chip tone={a.type === 'For Sale' ? 'orange' : a.type === 'Free' ? 'ok' : 'info'}>{a.type}</Chip></span></div>
                  <div className="body">
                    <h3 style={{ fontSize: 16 }}>{a.name}</h3>
                    <div className="small muted">{a.breed} · {a.age}</div>
                    <div className="row between" style={{ marginTop: 'auto' }}>
                      <span className="small muted row" style={{ gap: 4 }}><MapPin size={13} /> {a.area}</span>
                      <span className="price">{a.type === 'For Sale' ? money(a.price) : 'Free'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Borrow */}
      <section className="section alt">
        <div className="container">
          <SectionHead eyebrow="Pet Borrow" title="Spend a few days with a friendly pet" text="Short, paid stays arranged with the owner. You pay only after the owner approves, and the exact pickup point is shared after payment." to="/explore/borrow" cta="See pets nearby" />
          <div className="grid g4">
            {borrow.map((b) => (
              <Link to={`/explore/borrow/${b.id}`} key={b.id} className="media-card hover-card" style={{ color: 'inherit', textDecoration: 'none' }}>
                <div className="media"><Img src={b.img} alt={b.name} /></div>
                <div className="body">
                  <div className="row between"><h3 style={{ fontSize: 16 }}>{b.name}</h3><Stars value={b.rating} /></div>
                  <div className="small muted">{b.breed}</div>
                  <div className="row between" style={{ marginTop: 'auto' }}>
                    <span className="small muted row" style={{ gap: 4 }}><MapPin size={13} /> {b.area} (approx.)</span>
                    <span className="price">{money(b.daily)}<span className="small muted" style={{ fontWeight: 400 }}>/day</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="How it works" title="From sign-up to a happy, healthy pet" />
          <div className="grid g5 steps">
            {[
              { t: 'Find care', d: 'Search hospitals and vets on the map by area, service, fee or rating.' },
              { t: 'Book a service', d: 'Pick your pet, a date and a time slot. The provider confirms or suggests a new time.' },
              { t: 'Buy supplies', d: 'Order food and accessories from pet shops, and medicines from licensed pharmacies.' },
              { t: 'List a pet', d: 'Post an ad to sell, give away or rehome a pet, and answer inquiries in the app.' },
              { t: 'Borrow a pet', d: 'Request dates, wait for owner approval, pay, then record handover and return.' },
            ].map((s, i) => (
              <div className="step" key={s.t}>
                <div className="n">{i + 1}</div>
                <h4>{s.t}</h4>
                <p className="small muted" style={{ marginTop: 6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section alt">
        <div className="container grid g2" style={{ alignItems: 'center', gap: 40 }}>
          <div className="stack lg">
            <div>
              <div className="eyebrow">Why PetPaw</div>
              <h2 style={{ marginTop: 6 }}>Built for responsible pet care</h2>
            </div>
            {[
              { i: Sparkles, t: 'Convenient', d: 'Appointments, orders, ads and borrowing in one account, with reminders.' },
              { i: BadgeCheck, t: 'Verified providers', d: 'Hospitals, vets, pharmacies and shops are checked by our team before they get a Verified badge.' },
              { i: ClipboardCheck, t: 'Clear information', d: 'Prices in Taka, opening hours, stock and prescription rules shown up front.' },
              { i: HandHeart, t: 'Animal welfare first', d: 'Care rules for borrowed pets, safe handover checklists and fast reporting for mistreatment.' },
            ].map((w) => (
              <div key={w.t} className="row top" style={{ flexWrap: 'nowrap', gap: 14 }}>
                <div className="stat" style={{ padding: 0, border: 0 }}><div className="ico tone-green"><w.i size={20} /></div></div>
                <div><h4>{w.t}</h4><p className="small muted">{w.d}</p></div>
              </div>
            ))}
          </div>
          <div className="banner-img" style={{ aspectRatio: '4 / 3.4' }}><Img src={IMG.vet} alt="A vet examining a dog" /></div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Reviews" title="What pet families say" />
          <div className="grid g3">
            {testimonials.map((t) => (
              <figure className="quote" key={t.name} style={{ margin: 0 }}>
                <Stars value={5} />
                <blockquote style={{ margin: 0 }}>“{t.text}”</blockquote>
                <figcaption className="row" style={{ marginTop: 'auto' }}>
                  <Initials name={t.name} />
                  <div><strong className="small">{t.name}</strong><div className="tiny muted">{t.area} · {t.pet}</div></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + Contact */}
      <section className="section alt" id="faq">
        <div className="container split" style={{ gap: 40 }}>
          <div>
            <div className="eyebrow">FAQ</div>
            <h2 style={{ margin: '6px 0 20px' }}>Frequently asked questions</h2>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}<Plus size={18} style={{ flexShrink: 0, transition: 'transform .2s' }} /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="card stack" id="contact">
            <h3>Need help?</h3>
            <div className="small stack sm">
              <span className="row" style={{ gap: 8 }}><Phone size={15} color="var(--green)" /> +880 1XXX-XXXXXX (9 AM – 9 PM)</span>
              <span className="row" style={{ gap: 8 }}><Mail size={15} color="var(--green)" /> support@petpaw.example</span>
              <span className="row" style={{ gap: 8 }}><Clock size={15} color="var(--green)" /> Replies within one working day</span>
            </div>
            <form className="stack" onSubmit={sendContact} noValidate>
              <Field label="Name" error={cErr.name} htmlFor="c-name"><input id="c-name" className={`input ${cErr.name ? 'invalid' : ''}`} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></Field>
              <Field label="Email" error={cErr.email} htmlFor="c-email"><input id="c-email" type="email" className={`input ${cErr.email ? 'invalid' : ''}`} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
              <Field label="How can we help?" error={cErr.msg} htmlFor="c-msg"><textarea id="c-msg" className={`textarea ${cErr.msg ? 'invalid' : ''}`} value={contact.msg} onChange={(e) => setContact({ ...contact, msg: e.target.value })} /></Field>
              <button className="btn btn-primary"><MessageCircle size={16} /> Send message</button>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Ready to give your pet the best care?</h2>
              <p style={{ opacity: 0.85, marginTop: 6 }}>Create a free account in under a minute. Providers can apply for verification.</p>
            </div>
            <div className="row">
              <Link to="/register" className="btn btn-secondary btn-lg">Create free account</Link>
              <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>Login</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
