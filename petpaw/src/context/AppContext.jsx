import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as M from '../data/mock.js';
import { api, clearToken, getToken, setToken } from '../api.js';

const STORAGE_KEY = 'petpaw-demo-v1';
const PROVIDER_ROLES = ['hospital', 'doctor', 'pharmacy', 'shop'];

function seed() {
  return {
    auth: null,
    hospitals: M.hospitals,
    doctors: M.doctors,
    shops: M.shops,
    pharmacies: M.pharmacies,
    products: M.products,
    medicines: M.medicines,
    hospitalServices: M.hospitalServices,
    pets: M.initialPets,
    appointments: M.initialAppointments,
    prescriptions: M.initialPrescriptions,
    records: [
      { id: 'MR-501', doctorId: 'd1', petName: 'Bruno', owner: 'Ayesha Rahman', date: M.day(-60), symptoms: 'Head shaking, scratching left ear, odour', diagnosis: 'Otitis externa (left ear)', treatment: 'Ear cleaning + oral doxycycline 7 days', followUp: 'Recheck in 10 days', author: 'Dr. Farhana Rahman', updated: M.day(-60) },
      { id: 'MR-498', doctorId: 'd1', petName: 'Max', owner: 'Sumaiya Akter', date: M.day(-6), symptoms: 'Cruciate ligament rupture (right hind)', diagnosis: 'CCL rupture', treatment: 'TPLO surgery performed', followUp: 'Wound check in 7 days; restrict exercise 6 weeks', author: 'Dr. Farhana Rahman', updated: M.day(-6) },
    ],
    orders: M.initialOrders,
    cart: [],
    ads: M.initialAds,
    borrowListings: M.initialBorrowListings,
    borrowRequests: M.initialBorrowRequests,
    applications: [], // loaded from the API for admins and providers
    users: M.initialUsers,
    reports: M.initialReports,
    reviews: M.initialReviews,
    threads: M.initialThreads,
    notifications: M.initialNotifications,
    activity: M.initialActivity,
    settings: {
      commissionRate: 10,
      commissionFinal: false,
      adModeration: 'Publish immediately, review when reported',
      cancellationHours: 24,
      templates: [
        { key: 'booking_confirmed', label: 'Appointment confirmed', text: 'Your appointment {{id}} with {{provider}} on {{date}} at {{time}} is confirmed.' },
        { key: 'borrow_approved', label: 'Borrow request approved', text: '{{owner}} approved your request for {{pet}}. Pay within 24 hours to confirm.' },
        { key: 'provider_verified', label: 'Provider verified', text: 'Congratulations! {{name}} is now verified on PetPaw.' },
      ],
    },
    doctorSchedule: {
      days: { Sat: ['10:00', '13:00'], Sun: ['10:00', '13:00'], Mon: ['16:00', '20:00'], Tue: ['16:00', '20:00'], Wed: ['10:00', '13:00'], Thu: ['16:00', '20:00'], Fri: null },
      slotMinutes: 30,
      leave: [{ from: M.day(18), to: M.day(20), reason: 'Veterinary conference, Chattogram' }],
    },
    hospitalHours: {
      days: { Sat: ['09:00', '22:00'], Sun: ['09:00', '22:00'], Mon: ['09:00', '22:00'], Tue: ['09:00', '22:00'], Wed: ['09:00', '22:00'], Thu: ['09:00', '22:00'], Fri: ['14:00', '22:00'] },
      capacity: 6,
      holidays: [{ date: M.day(34), label: 'Victory Day (16 Dec) — emergency only' }],
    },
    staff: [
      { id: 'st1', name: 'Dr. Farhana Rahman', role: 'Surgeon', linkedDoctorId: 'd1', phone: '+880 1711-111000', status: 'Active' },
      { id: 'st2', name: 'Dr. Arif Chowdhury', role: 'Feline medicine', linkedDoctorId: 'd4', phone: '+880 1711-111001', status: 'Active' },
      { id: 'st3', name: 'Moushumi Akter', role: 'Vet nurse', phone: '+880 1711-111002', status: 'Active' },
      { id: 'st4', name: 'Rasel Mia', role: 'Front desk', phone: '+880 1711-111003', status: 'On leave' },
    ],
    shopDelivery: { delivery: true, pickup: true, insideDhaka: 80, outsideDhaka: 150, freeAbove: 3000, eta: '1–2 days' },
    payments: [
      { id: 'PAY-3301', bookingId: 'BR-6990', date: M.day(-8), amount: 1500, method: 'bKash (prototype)', status: 'Paid', direction: 'in' },
      { id: 'PAY-3260', bookingId: 'BR-6950', date: M.day(-24), amount: 1000, method: 'Card (prototype)', status: 'Paid', direction: 'in' },
      { id: 'PAY-3204', bookingId: 'BR-6920', date: M.day(-43), amount: 900, method: 'Nagad (prototype)', status: 'Paid', direction: 'out' },
    ],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch (e) { /* storage unavailable — fall back to seed */ }
  return seed();
}

const Ctx = createContext(null);
let idc = 100;
export const newId = (prefix) => `${prefix}-${Date.now().toString().slice(-5)}${++idc}`;

export function AppProvider({ children }) {
  const [db, setDb] = useState(load);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (e) { /* ignore */ }
  }, [db]);

  const set = useCallback((key, updater) => {
    setDb((d) => ({ ...d, [key]: typeof updater === 'function' ? updater(d[key]) : updater }));
  }, []);

  const toast = useCallback((text, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const notify = useCallback((role, text, link) => {
    setDb((d) => ({
      ...d,
      notifications: { ...d.notifications, [role]: [{ id: newId('n'), text, at: 'Just now', read: false, link }, ...(d.notifications[role] || [])] },
    }));
  }, []);

  const log = useCallback((action) => {
    setDb((d) => {
      const now = new Date();
      const at = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
      return { ...d, activity: [{ at, who: d.auth?.name || 'System', action }, ...d.activity] };
    });
  }, []);

  const login = useCallback((account) => setDb((d) => ({ ...d, auth: account })), []);
  /** Store the API token and the signed-in user returned by /auth/login or /auth/register. */
  const signIn = useCallback((user, token) => { setToken(token); setDb((d) => ({ ...d, auth: user })); }, []);
  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => { /* token may already be invalid */ });
    clearToken();
    setDb((d) => ({ ...d, auth: null, applications: [] }));
  }, []);

  // Restore the session from the saved token (and drop stale sessions from the old offline prototype).
  useEffect(() => {
    if (!getToken()) { setDb((d) => (d.auth ? { ...d, auth: null } : d)); return; }
    api.get('/auth/me')
      .then((r) => setDb((d) => ({ ...d, auth: r.user })))
      .catch((e) => { if (e.status === 401 || e.status === 403) { clearToken(); setDb((d) => ({ ...d, auth: null })); } });
  }, []);

  // Admins see every provider application; providers see their own.
  const role = db.auth?.role;
  const uid = db.auth?.id;
  const loadApplications = useCallback(() => {
    if (role === 'admin') return api.get('/admin/applications').then((r) => r.applications);
    if (PROVIDER_ROLES.includes(role)) return api.get('/application').then((r) => (r.application ? [r.application] : []));
    return Promise.resolve(null);
  }, [role]);
  useEffect(() => {
    if (!uid) return undefined;
    let live = true;
    loadApplications().then((list) => { if (live && list) setDb((d) => ({ ...d, applications: list })); }).catch(() => { /* shown on the page that needs it */ });
    return () => { live = false; };
  }, [uid, loadApplications]);
  const resetDemo = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    setDb((d) => ({ ...seed(), auth: d.auth, applications: d.applications }));
  }, []);

  const confirm = useCallback((opts) => setConfirmState(opts), []);

  const value = useMemo(
    () => ({ db, set, toast, notify, log, login, signIn, logout, resetDemo, confirm, confirmState, setConfirmState, toasts }),
    [db, set, toast, notify, log, login, signIn, logout, resetDemo, confirm, confirmState, toasts]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);

/* ---------- Domain helpers ---------- */
export const money = (n) => `৳${Number(n || 0).toLocaleString('en-IN')}`;

export function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(`${s}T12:00:00`);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysBetween(start, end) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  return Math.round((b - a) / 86400000);
}

export function ageFrom(dob) {
  if (!dob) return '—';
  const d = new Date(dob);
  const months = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
  if (months < 12) return `${Math.max(months, 0)} mo`;
  return `${Math.floor(months / 12)} yr${months >= 24 ? 's' : ''}`;
}

export function borrowCost(daily, days, rate) {
  const fee = daily * days;
  const commission = Math.round((fee * rate) / 100);
  return { fee, commission, ownerNet: fee - commission, total: fee };
}

const BLOCKING = ['Confirmed', 'Active'];
export function findConflict(requests, listingId, start, end, excludeId) {
  return requests.find(
    (r) => r.listingId === listingId && r.id !== excludeId && BLOCKING.includes(r.status) && start < r.end && end > r.start
  );
}

export function today() { return M.day(0); }
