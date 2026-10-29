import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './components/PublicLayout.jsx';
import { ConfirmHost, Toasts } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import { About, Contact, NotFound, Policy, Services } from './pages/InfoPages.jsx';
import { ApplicationStatus, ForgotPassword, Login, Register, ResetPassword } from './pages/Auth.jsx';
import { DoctorDetail, DoctorFinder, HospitalDetail, HospitalFinder } from './features/care.jsx';
import { PharmacyBrowser, ProductDetail, ShopBrowser, StoreDetail } from './features/shopping.jsx';
import { AdDetail, BorrowBrowser, BorrowDetail, MarketplaceBrowser } from './features/community.jsx';
import UserPortal from './portals/UserPortal.jsx';
import AdminPortal from './portals/AdminPortal.jsx';
import HospitalPortal from './portals/HospitalPortal.jsx';
import DoctorPortal from './portals/DoctorPortal.jsx';
import PharmacyPortal from './portals/PharmacyPortal.jsx';
import ShopPortal from './portals/ShopPortal.jsx';
import BorrowPortal from './portals/BorrowPortal.jsx';

/** Public browsing pages (no login). Account-only actions prompt sign-in. */
function Explore({ children }) {
  return (
    <PublicLayout>
      <div className="container" style={{ paddingBlock: '28px 64px' }}>
        <div className="stack lg">{children}</div>
      </div>
    </PublicLayout>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/policy/:key" element={<Policy />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/application-status" element={<ApplicationStatus />} />

        <Route path="/explore/hospitals" element={<Explore><HospitalFinder base="/explore" /></Explore>} />
        <Route path="/explore/hospitals/:id" element={<Explore><HospitalDetail base="/explore" /></Explore>} />
        <Route path="/explore/doctors" element={<Explore><DoctorFinder base="/explore" /></Explore>} />
        <Route path="/explore/doctors/:id" element={<Explore><DoctorDetail base="/explore" /></Explore>} />
        <Route path="/explore/pharmacy" element={<Explore><PharmacyBrowser base="/explore" /></Explore>} />
        <Route path="/explore/shop" element={<Explore><ShopBrowser base="/explore" /></Explore>} />
        <Route path="/explore/shop/product/:id" element={<Explore><ProductDetail base="/explore" /></Explore>} />
        <Route path="/explore/shop/store/:id" element={<Explore><StoreDetail base="/explore" /></Explore>} />
        <Route path="/explore/marketplace" element={<Explore><MarketplaceBrowser base="/explore" /></Explore>} />
        <Route path="/explore/marketplace/:id" element={<Explore><AdDetail base="/explore" /></Explore>} />
        <Route path="/explore/borrow" element={<Explore><BorrowBrowser base="/explore" /></Explore>} />
        <Route path="/explore/borrow/:id" element={<Explore><BorrowDetail base="/explore" /></Explore>} />
        <Route path="/explore" element={<Navigate to="/services" replace />} />

        <Route path="/user/*" element={<UserPortal />} />
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/hospital/*" element={<HospitalPortal />} />
        <Route path="/doctor/*" element={<DoctorPortal />} />
        <Route path="/pharmacy/*" element={<PharmacyPortal />} />
        <Route path="/shop/*" element={<ShopPortal />} />
        <Route path="/borrow/*" element={<BorrowPortal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ConfirmHost />
      <Toasts />
    </>
  );
}
