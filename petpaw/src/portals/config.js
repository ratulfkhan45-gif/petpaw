import {
  Activity, BadgeCheck, BarChart3, Bell, Boxes, Building2, CalendarClock, CalendarDays, ClipboardList, Clock, Cog, CreditCard,
  FileText, Flag, HandCoins, HeartHandshake, HelpCircle, Home, Hospital, Inbox, LayoutDashboard, ListChecks, Megaphone,
  MessageSquare, Package, PackagePlus, PawPrint, Pill, PlusCircle, Receipt, RotateCcw, Search, Send, Settings, ShieldCheck,
  ShoppingBag, Stethoscope, Store, Tags, Truck, User, Users, Video, Wallet, Star, AlertTriangle, ScrollText, FileHeart,
} from 'lucide-react';

export const PORTALS = {
  user: {
    title: 'User Portal', short: 'Pet owner', base: '/user', roles: ['user', 'borrow'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'pets', label: 'My Pets', icon: PawPrint },
      { to: 'hospitals', label: 'Find Pet Hospitals', icon: Hospital },
      { to: 'doctors', label: 'Find Pet Doctors', icon: Stethoscope },
      { to: 'pharmacy', label: 'Pharmacy', icon: Pill },
      { to: 'shop', label: 'Pet Shop', icon: ShoppingBag },
      { to: 'marketplace', label: 'Pet Marketplace', icon: Megaphone },
      { to: 'borrow', label: 'Pet Borrow', icon: HeartHandshake },
      { to: 'appointments', label: 'My Appointments', icon: CalendarDays },
      { to: 'orders', label: 'My Orders', icon: Package },
      { to: 'ads', label: 'My Ads', icon: ClipboardList },
      { to: 'borrowings', label: 'My Borrowings', icon: RotateCcw },
      { to: 'messages', label: 'Inquiries & Messages', icon: MessageSquare },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'settings', label: 'Profile & Settings', icon: Settings },
      { to: 'help', label: 'Help & Support', icon: HelpCircle },
    ],
  },
  admin: {
    title: 'Admin Portal', short: 'Administrator', base: '/admin', roles: ['admin'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'users', label: 'User Management', icon: Users },
      { to: 'verification', label: 'Provider Verification', icon: BadgeCheck, badge: 'apps' },
      { to: 'ads', label: 'Pet Ad Moderation', icon: Megaphone, badge: 'flaggedAds' },
      { to: 'borrow', label: 'Pet Borrow Monitoring', icon: HeartHandshake },
      { to: 'appointments', label: 'Appointments Overview', icon: CalendarDays },
      { to: 'orders', label: 'Orders Overview', icon: Package },
      { to: 'reports', label: 'Reports & Complaints', icon: Flag, badge: 'openReports' },
      { to: 'reviews', label: 'Reviews Moderation', icon: Star },
      { to: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'activity', label: 'Activity Logs', icon: ScrollText },
      { to: 'settings', label: 'Platform Settings', icon: Cog },
    ],
  },
  hospital: {
    title: 'Pet Hospital Portal', short: 'Pet hospital', base: '/hospital', roles: ['hospital'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'profile', label: 'Hospital Profile', icon: Building2 },
      { to: 'services', label: 'Services & Pricing', icon: Tags },
      { to: 'appointments', label: 'Appointments', icon: CalendarDays, badge: 'hospitalPending' },
      { to: 'staff', label: 'Doctors & Staff', icon: Users },
      { to: 'patients', label: 'Pet Patients', icon: PawPrint },
      { to: 'hours', label: 'Opening Hours & Availability', icon: Clock },
      { to: 'reviews', label: 'Reviews', icon: Star },
      { to: 'reports', label: 'Reports', icon: BarChart3 },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  doctor: {
    title: 'Pet Doctor Portal', short: 'Pet doctor', base: '/doctor', roles: ['doctor'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'profile', label: 'My Profile', icon: User },
      { to: 'schedule', label: 'My Schedule', icon: CalendarClock },
      { to: 'appointments', label: 'Appointments', icon: CalendarDays, badge: 'doctorPending' },
      { to: 'patients', label: 'Pet Patients', icon: PawPrint },
      { to: 'records', label: 'Medical Records', icon: FileHeart },
      { to: 'prescriptions', label: 'Prescriptions', icon: FileText },
      { to: 'consultations', label: 'Online Consultations', icon: Video },
      { to: 'reviews', label: 'Reviews', icon: Star },
      { to: 'reports', label: 'Reports', icon: BarChart3 },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  pharmacy: {
    title: 'Pharmacy Portal', short: 'Pharmacy', base: '/pharmacy', roles: ['pharmacy'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'profile', label: 'Pharmacy Profile', icon: Building2 },
      { to: 'inventory', label: 'Medicine Inventory', icon: Boxes },
      { to: 'add', label: 'Add Medicine', icon: PlusCircle },
      { to: 'categories', label: 'Categories & Pricing', icon: Tags },
      { to: 'stock', label: 'Stock & Expiry', icon: AlertTriangle, badge: 'stockAlerts' },
      { to: 'prescriptions', label: 'Prescription Orders', icon: ShieldCheck, badge: 'rxPending' },
      { to: 'orders', label: 'Orders', icon: Package },
      { to: 'delivery', label: 'Delivery Management', icon: Truck },
      { to: 'reviews', label: 'Reviews', icon: Star },
      { to: 'reports', label: 'Sales & Reports', icon: BarChart3 },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  shop: {
    title: 'Pet Shop Portal', short: 'Pet shop', base: '/shop', roles: ['shop'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'profile', label: 'Shop Profile', icon: Store },
      { to: 'products', label: 'My Products', icon: Package },
      { to: 'add', label: 'Add Product', icon: PackagePlus },
      { to: 'categories', label: 'Categories & Pricing', icon: Tags },
      { to: 'inventory', label: 'Inventory / Stock', icon: Boxes, badge: 'shopLow' },
      { to: 'orders', label: 'Orders', icon: Receipt, badge: 'shopNew' },
      { to: 'delivery', label: 'Delivery / Pickup', icon: Truck },
      { to: 'reviews', label: 'Reviews', icon: Star },
      { to: 'reports', label: 'Sales & Reports', icon: BarChart3 },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  borrow: {
    title: 'Pet Borrow Portal', short: 'Pet Borrow', base: '/borrow', roles: ['user', 'borrow'],
    nav: [
      { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: 'browse', label: 'Browse Available Pets', icon: Search },
      { to: 'listed', label: 'My Listed Pets', icon: PawPrint },
      { to: 'list', label: 'List a Pet', icon: PlusCircle },
      { to: 'incoming', label: 'Incoming Requests', icon: Inbox, badge: 'incoming' },
      { to: 'requests', label: 'My Borrow Requests', icon: Send, badge: 'payDue' },
      { to: 'active', label: 'Active Borrowings', icon: Activity },
      { to: 'payments', label: 'Payment History', icon: CreditCard },
      { to: 'earnings', label: 'Owner Earnings', icon: Wallet },
      { to: 'returns', label: 'Return Management', icon: RotateCcw },
      { to: 'messages', label: 'Messages', icon: MessageSquare },
      { to: 'reviews', label: 'Reviews & Reports', icon: ListChecks },
      { to: 'notifications', label: 'Notifications', icon: Bell, badge: 'notif' },
      { to: 'settings', label: 'Settings', icon: Settings },
    ],
  },
};

export const portalHome = (role) => {
  const map = { user: '/user/dashboard', borrow: '/borrow/dashboard', admin: '/admin/dashboard', hospital: '/hospital/dashboard', doctor: '/doctor/dashboard', pharmacy: '/pharmacy/dashboard', shop: '/shop/dashboard' };
  return map[role] || '/';
};

export function badgeCount(key, db, portal) {
  const me = db.auth?.name;
  switch (key) {
    case 'notif': return (db.notifications[portal] || []).filter((n) => !n.read).length;
    case 'apps': return db.applications.filter((a) => a.status === 'Pending Verification').length;
    case 'flaggedAds': return db.ads.filter((a) => a.reports > 0 && a.status !== 'Removed' && !a.cleared).length;
    case 'openReports': return db.reports.filter((r) => r.status === 'Open').length;
    case 'hospitalPending': return db.appointments.filter((a) => a.providerId === 'h1' && a.kind === 'hospital' && a.status === 'Pending').length;
    case 'doctorPending': return db.appointments.filter((a) => a.doctorId === 'd1' && a.status === 'Pending').length;
    case 'rxPending': return db.orders.filter((o) => o.source === 'pharmacy' && o.providerId === 'ph1' && o.status === 'Prescription review').length;
    case 'stockAlerts': return db.medicines.filter((m) => m.pharmacyId === 'ph1' && (m.stock <= 10 || m.expiry < new Date().toISOString().slice(0, 10))).length;
    case 'shopLow': return db.products.filter((p) => p.shopId === 's2' && p.stock <= 5).length;
    case 'shopNew': return db.orders.filter((o) => o.source === 'shop' && o.providerId === 's2' && o.status === 'New').length;
    case 'incoming': return db.borrowRequests.filter((r) => r.owner === me && r.status === 'Pending Owner Approval').length;
    case 'payDue': return db.borrowRequests.filter((r) => r.borrower === me && r.status === 'Approved — Payment Required').length;
    default: return 0;
  }
}

export { Home };
