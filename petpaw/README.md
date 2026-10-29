# PetPaw — Pet Care Platform (Frontend)

React + CSS frontend for a pet-care platform in Bangladesh with **seven portals**:
User, Admin, Pet Hospital, Pet Doctor, Pharmacy, Pet Shop and Pet Borrow.

This is **frontend only**. There is no backend: all data is sample data held in React
state and saved to the browser's `localStorage`, so bookings, orders and approvals you
make survive a page refresh. Payments, maps, messaging, file uploads and video calls are
simulated UI and are clearly labelled as prototypes.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # open the URL Vite prints (usually http://localhost:5173)
npm run build      # production build in /dist
npm run preview    # serve the production build
```

## Demo accounts

Password for every demo account: **`demo1234`** (the Login page has one-tap buttons).

| Role | Email |
|---|---|
| Pet owner (User portal) | user@petpaw.bd |
| Pet Borrow portal | borrow@petpaw.bd (same person as the user) |
| Admin | admin@petpaw.bd |
| Pet Hospital | hospital@petpaw.bd |
| Pet Doctor | doctor@petpaw.bd |
| Pharmacy | pharmacy@petpaw.bd |
| Pet Shop | shop@petpaw.bd |

Inside any portal, the account menu (top right) has **Prototype: switch role** to jump
between portals, and **Reset demo data** to restore the original sample data.

## Flows to try

1. **Book a hospital** — User → Find Pet Hospitals → Book → pick pet, service, slot → switch to Hospital → Appointments → Confirm → User sees it confirmed.
2. **Book a doctor → prescription → pharmacy** — Doctor → Appointments → open a confirmed visit → Prescribe → User → Pharmacy → add an Rx item → checkout with that prescription → Pharmacy → Prescription Orders → Approve → User pays in My Orders → Pharmacy → Delivery Management.
3. **Pet Shop order** — User → Pet Shop → Add to cart → Cart → Checkout → Shop → Orders / Delivery.
4. **Marketplace ad** — User → My Ads → Create ad → publish → others can send inquiries or report it → Admin → Pet Ad Moderation.
5. **Pet Borrow** — Borrow portal → Incoming Requests → Approve → (as borrower) My Borrow Requests → Pay (try the “simulate failed payment” box) → booking Confirmed, exact pickup revealed → Handover checklist → Return → Review. Overlapping confirmed bookings are blocked.
6. **Provider verification** — Register as Pet Hospital / Doctor / Pharmacy / Shop with documents → Pending Verification → Admin → Provider Verification → Approve / Reject / Request corrections.
7. **Report / dispute** — Report any ad, provider, order, appointment or booking → Admin → Reports & Complaints (status, internal notes, outcome). Borrow disputes are resolved in Pet Borrow Monitoring.

## Project structure

```
src/
  App.jsx                 routes (public site, auth, /explore/*, seven portals)
  styles/global.css       design system (colours, type, components, responsive)
  data/mock.js            all sample data (Dhaka areas, providers, pets, orders…)
  context/AppContext.jsx  app state, localStorage persistence, toasts, helpers
  components/
    ui.jsx                buttons/chips/tables/modals/tabs/charts/timeline…
    MapView.jsx           reusable interactive map (pins, zoom, pan, search,
                          map/list, use-my-location, picker mode for providers)
    PublicLayout.jsx      public navbar + footer
    PortalLayout.jsx      sidebar, mobile drawer, top bar, role guard
  features/               screens shared by public pages and portals
    care.jsx              hospitals & doctors (search, detail, booking)
    shopping.jsx          pharmacy, pet shop, cart & checkout
    community.jsx         marketplace ads, Pet Borrow browse/detail/booking/payment
    common.jsx            sign-in gate, report dialog, cart helper
  pages/                  landing, about/services/contact/policies, auth pages
  portals/                one file per portal + shared portal pages
```

## Notes

- **Commission**: the Pet Borrow service commission is configurable in Admin → Platform Settings. It starts at an *example* 10% and is labelled “example rate, not final” everywhere until an admin marks it final.
- **Maps**: a simplified vector map of Dhaka is drawn in SVG so it works offline. To use a real map later, replace the `BaseMap` layer in `MapView.jsx` with Leaflet or Google Maps; pins, previews and the location picker can stay the same. Distances are shown only after the user allows location access.
- **Images** are loaded from Unsplash. If they can’t load (offline), a matching icon is shown instead.
- **Role guard**: each portal checks the signed-in role, so typing another portal’s URL shows an access-denied page.
- **Connecting a backend**: replace the `set(...)` calls in `AppContext` consumers with API calls; the screens already have loading, empty, error and success states.
