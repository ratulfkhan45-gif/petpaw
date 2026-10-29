// Sample data for the PetPaw prototype. Everything here is fictional demo content.
// Dates are generated relative to "today" so the demo always looks current.

const u = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const IMG = {
  hero: u('photo-1601758228041-f3b2795255f1', 1200),
  auth: u('photo-1548199973-03cce0bbc87b', 1000),
  vet: u('photo-1628009368231-7bb7cfcb0def'),
  vet2: u('photo-1576201836106-db1758fd1c97'),
  clinic: u('photo-1629909613654-28e377c37b09'),
  clinic2: u('photo-1583337130417-3346a1be7dee'),
  dog1: u('photo-1543466835-00a7907e9de1'),
  dog2: u('photo-1587300003388-59208cc962cb'),
  dog3: u('photo-1583511655857-d19b40a7a54e'),
  dog4: u('photo-1517849845537-4d257902454a'),
  dog5: u('photo-1561037404-61cd46aa615b'),
  puppy: u('photo-1591160690555-5debfba289f0'),
  gsd: u('photo-1589941013453-ec89f33b5e95'),
  cat1: u('photo-1514888286974-6c03e2ca1dba'),
  cat2: u('photo-1592194996308-7b43878e84a6'),
  cat3: u('photo-1574158622682-e40e69881006'),
  kitten: u('photo-1595433707802-6b2626ef1c91'),
  bird: u('photo-1552728089-57bdde30beb3'),
  budgie: u('photo-1591198936750-16d8e15edb9e'),
  rabbit: u('photo-1585110396000-c9ffd4e4b308'),
  food: u('photo-1589924691995-400dc9ecc119'),
  toy: u('photo-1535294435445-d7249524ef2e'),
  leash: u('photo-1601758124510-52d02ddb7cbd'),
  groom: u('photo-1516734212186-a967f81ad0d7'),
  bed: u('photo-1541599540903-216a46ca1dc0'),
  shop: u('photo-1583337130417-3346a1be7dee'),
  meds: u('photo-1584308666744-24d5c474f2ae'),
  pills: u('photo-1471864190281-a93a3070b6de'),
};

const pad = (n) => String(n).padStart(2, '0');
export const day = (offset = 0) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const AREAS = [
  { name: 'Dhanmondi', lat: 23.7465, lng: 90.3760 },
  { name: 'Mohammadpur', lat: 23.7650, lng: 90.3580 },
  { name: 'Mirpur', lat: 23.8069, lng: 90.3687 },
  { name: 'Gulshan', lat: 23.7925, lng: 90.4142 },
  { name: 'Banani', lat: 23.7937, lng: 90.4043 },
  { name: 'Uttara', lat: 23.8740, lng: 90.3986 },
  { name: 'Bashundhara', lat: 23.8190, lng: 90.4526 },
  { name: 'Farmgate', lat: 23.7580, lng: 90.3897 },
  { name: 'Motijheel', lat: 23.7330, lng: 90.4172 },
  { name: 'Badda', lat: 23.7806, lng: 90.4265 },
  { name: 'Old Dhaka', lat: 23.7120, lng: 90.4070 },
];

export const DEMO_ACCOUNTS = [
  { email: 'user@petpaw.bd', role: 'user', label: 'Pet owner', name: 'Ayesha Rahman' },
  { email: 'admin@petpaw.bd', role: 'admin', label: 'Admin', name: 'Rakib Hasan' },
  { email: 'hospital@petpaw.bd', role: 'hospital', label: 'Pet hospital', name: 'Dhanmondi Pet Care Hospital', providerId: 'h1' },
  { email: 'doctor@petpaw.bd', role: 'doctor', label: 'Pet doctor', name: 'Dr. Farhana Rahman', providerId: 'd1' },
  { email: 'pharmacy@petpaw.bd', role: 'pharmacy', label: 'Pharmacy', name: 'VetMed Pharmacy', providerId: 'ph1' },
  { email: 'shop@petpaw.bd', role: 'shop', label: 'Pet shop', name: 'Whiskers & Wags', providerId: 's2' },
  { email: 'borrow@petpaw.bd', role: 'borrow', label: 'Pet Borrow', name: 'Ayesha Rahman' },
];
export const DEMO_PASSWORD = 'demo1234';

export const hospitals = [
  { id: 'h1', name: 'Dhanmondi Pet Care Hospital', area: 'Dhanmondi', address: 'House 41, Road 27 (Old), Dhanmondi, Dhaka 1209', lat: 23.7561, lng: 90.3742, phone: '+880 1711-204560', email: 'care@dhanmondipet.bd', rating: 4.8, reviews: 312, img: IMG.clinic, hours: 'Daily 9:00 AM – 10:00 PM', open24: false, emergency: true, verified: true, services: ['Vaccination', 'Surgery', 'Emergency', 'Dental', 'Grooming', 'X-ray'], desc: 'Full-service small-animal hospital with an in-house lab, digital X-ray and a 24-bed recovery ward. Known for orthopedic surgery and puppy/kitten wellness packages.', facilities: ['In-house lab', 'Digital X-ray', 'Surgery theatre', 'Recovery ward', 'Parking'] },
  { id: 'h2', name: 'Gulshan Animal Clinic & Hospital', area: 'Gulshan', address: 'Plot 12, Road 90, Gulshan 2, Dhaka 1212', lat: 23.7950, lng: 90.4160, phone: '+880 1819-552013', email: 'hello@gulshananimal.bd', rating: 4.7, reviews: 204, img: IMG.vet2, hours: 'Open 24 hours', open24: true, emergency: true, services: ['Emergency', 'ICU', 'Vaccination', 'Ultrasound', 'Surgery'], verified: true, desc: '24/7 emergency and critical care, ICU with oxygen support, and specialist referral service.', facilities: ['ICU', 'Ultrasound', '24/7 emergency', 'Pharmacy counter'] },
  { id: 'h3', name: 'Mirpur Vet Hospital', area: 'Mirpur', address: 'Section 10, Begum Rokeya Sarani, Mirpur, Dhaka 1216', lat: 23.8075, lng: 90.3680, phone: '+880 1552-338890', email: 'info@mirpurvet.bd', rating: 4.5, reviews: 168, img: IMG.vet, hours: 'Sat–Thu 8:30 AM – 9:00 PM', open24: false, emergency: false, services: ['Vaccination', 'Deworming', 'Grooming', 'General check-up'], verified: true, desc: 'Affordable community vet hospital popular for vaccination drives and stray-animal care programs.', facilities: ['Grooming room', 'Vaccination clinic'] },
  { id: 'h4', name: 'Uttara Companion Animal Hospital', area: 'Uttara', address: 'House 8, Road 13, Sector 7, Uttara, Dhaka 1230', lat: 23.8720, lng: 90.3990, phone: '+880 1913-772245', email: 'uttara@companionvet.bd', rating: 4.6, reviews: 141, img: IMG.clinic2, hours: 'Daily 10:00 AM – 9:00 PM', open24: false, emergency: true, services: ['Surgery', 'Dental', 'Dermatology', 'Vaccination', 'X-ray'], verified: true, desc: 'Dermatology and dental specialists with a calm, cat-friendly waiting area.', facilities: ['Cat-only waiting room', 'Dental suite', 'X-ray'] },
  { id: 'h5', name: 'Bashundhara PetWell Hospital', area: 'Bashundhara', address: 'Block C, Road 5, Bashundhara R/A, Dhaka 1229', lat: 23.8165, lng: 90.4490, phone: '+880 1678-990112', email: 'petwell@bashundhara.bd', rating: 4.4, reviews: 87, img: IMG.vet, hours: 'Sat–Thu 9:00 AM – 8:00 PM', open24: false, emergency: false, services: ['Vaccination', 'Exotics & birds', 'General check-up', 'Ultrasound'], verified: true, desc: 'Exotic animals and bird care alongside general practice for dogs and cats.', facilities: ['Avian ward', 'Ultrasound'] },
  { id: 'h6', name: 'Mohammadpur Animal Health Centre', area: 'Mohammadpur', address: 'Tajmahal Road, Block C, Mohammadpur, Dhaka 1207', lat: 23.7640, lng: 90.3600, phone: '+880 1756-441820', email: 'mahc@animalhealth.bd', rating: 4.2, reviews: 64, img: IMG.clinic, hours: 'Daily 9:00 AM – 7:00 PM', open24: false, emergency: false, services: ['Vaccination', 'Deworming', 'General check-up'], verified: true, desc: 'Neighbourhood clinic with low-cost vaccinations and weekend deworming camps.', facilities: ['Vaccination clinic'] },
];

export const hospitalServices = [
  { id: 'sv1', hospitalId: 'h1', name: 'General check-up', price: 800, duration: '30 min', desc: 'Physical exam, weight, and wellness advice.', active: true },
  { id: 'sv2', hospitalId: 'h1', name: 'Rabies vaccination', price: 650, duration: '15 min', desc: 'Annual rabies shot with certificate.', active: true },
  { id: 'sv3', hospitalId: 'h1', name: 'DHPPi + L vaccine (dogs)', price: 1200, duration: '15 min', desc: 'Core combination vaccine for dogs.', active: true },
  { id: 'sv4', hospitalId: 'h1', name: 'Spay / neuter surgery', price: 6500, duration: 'Half day', desc: 'Includes pre-op bloodwork and pain relief.', active: true },
  { id: 'sv5', hospitalId: 'h1', name: 'Dental scaling', price: 3500, duration: '1–2 hours', desc: 'Under sedation, includes polishing.', active: true },
  { id: 'sv6', hospitalId: 'h1', name: 'Digital X-ray', price: 1800, duration: '20 min', desc: 'Per view, with vet report.', active: true },
  { id: 'sv7', hospitalId: 'h1', name: 'Grooming (full)', price: 1500, duration: '1.5 hours', desc: 'Bath, trim, nail clip, ear clean.', active: false },
];

export const doctors = [
  { id: 'd1', name: 'Dr. Farhana Rahman', qual: 'DVM (BAU), MS in Surgery', spec: 'Small animal surgery', exp: 11, fee: 1200, hospitalId: 'h1', area: 'Dhanmondi', rating: 4.9, reviews: 186, img: IMG.vet, online: true, bvc: 'BVC-04712', slots: ['10:00 AM', '10:30 AM', '11:00 AM', '04:00 PM', '04:30 PM', '05:00 PM'], about: 'Orthopedic and soft-tissue surgeon with over a decade of experience. Runs the post-operative rehabilitation program at Dhanmondi Pet Care Hospital.' },
  { id: 'd2', name: 'Dr. Tanvir Hossain', qual: 'DVM (CVASU)', spec: 'Emergency & critical care', exp: 8, fee: 1000, hospitalId: 'h2', area: 'Gulshan', rating: 4.8, reviews: 140, img: IMG.vet2, online: true, bvc: 'BVC-05530', slots: ['09:00 AM', '09:30 AM', '02:00 PM', '02:30 PM', '08:00 PM'], about: 'Leads the night emergency team at Gulshan Animal Clinic. Special interest in toxicology and trauma.' },
  { id: 'd3', name: 'Dr. Nusrat Jahan', qual: 'DVM, PG Dip. Dermatology', spec: 'Dermatology', exp: 7, fee: 900, hospitalId: 'h4', area: 'Uttara', rating: 4.7, reviews: 97, img: IMG.vet, online: false, bvc: 'BVC-06118', slots: ['11:00 AM', '11:30 AM', '12:00 PM', '06:00 PM'], about: 'Treats skin allergies, fungal infections and coat problems in dogs and cats.' },
  { id: 'd4', name: 'Dr. Arif Chowdhury', qual: 'DVM (BAU), ISFM Cert.', spec: 'Feline medicine', exp: 9, fee: 1000, hospitalId: 'h1', area: 'Dhanmondi', rating: 4.8, reviews: 121, img: IMG.vet2, online: true, bvc: 'BVC-05201', slots: ['03:00 PM', '03:30 PM', '06:30 PM', '07:00 PM'], about: 'Cat-only consultations in a low-stress room. Kidney disease, dental and behaviour cases.' },
  { id: 'd5', name: 'Dr. Sadia Islam', qual: 'DVM, MSc Avian Medicine', spec: 'Birds & exotics', exp: 6, fee: 800, hospitalId: 'h5', area: 'Bashundhara', rating: 4.6, reviews: 58, img: IMG.vet, online: false, bvc: 'BVC-06674', slots: ['10:00 AM', '12:00 PM', '05:00 PM'], about: 'Parrots, budgies, rabbits and small mammals. Nutrition and husbandry advice.' },
  { id: 'd6', name: 'Dr. Kamrul Hasan', qual: 'DVM (SAU)', spec: 'General practice', exp: 14, fee: 600, hospitalId: 'h3', area: 'Mirpur', rating: 4.5, reviews: 203, img: IMG.vet2, online: true, bvc: 'BVC-03390', slots: ['09:00 AM', '09:30 AM', '10:00 AM', '07:00 PM', '07:30 PM'], about: 'Family vet for vaccinations, deworming and everyday illness.' },
];

export const shops = [
  { id: 's1', name: 'PawMart Banani', area: 'Banani', address: 'Road 11, Block E, Banani, Dhaka 1213', lat: 23.7940, lng: 90.4030, phone: '+880 1715-660320', hours: 'Daily 10:00 AM – 10:00 PM', delivery: true, pickup: true, rating: 4.7, img: IMG.shop, verified: true },
  { id: 's2', name: 'Whiskers & Wags', area: 'Dhanmondi', address: 'Satmasjid Road, Dhanmondi 9/A, Dhaka 1209', lat: 23.7440, lng: 90.3720, phone: '+880 1822-114567', hours: 'Daily 11:00 AM – 9:30 PM', delivery: true, pickup: true, rating: 4.8, img: IMG.toy, verified: true },
  { id: 's3', name: 'Pet Bazaar Mirpur', area: 'Mirpur', address: 'Mirpur 1, Shah Ali Market area, Dhaka 1216', lat: 23.7980, lng: 90.3530, phone: '+880 1933-887612', hours: 'Sat–Thu 10:00 AM – 9:00 PM', delivery: false, pickup: true, rating: 4.3, img: IMG.food, verified: true },
  { id: 's4', name: 'Happy Tails Uttara', area: 'Uttara', address: 'Sector 4, Lake Drive Road, Uttara, Dhaka 1230', lat: 23.8640, lng: 90.4030, phone: '+880 1611-209934', hours: 'Daily 10:00 AM – 9:00 PM', delivery: true, pickup: false, rating: 4.5, img: IMG.leash, verified: true },
  { id: 's5', name: 'Furry Friends Bashundhara', area: 'Bashundhara', address: 'Jamuna Future Park area, Bashundhara, Dhaka 1229', lat: 23.8135, lng: 90.4240, phone: '+880 1777-506023', hours: 'Daily 10:00 AM – 10:00 PM', delivery: true, pickup: true, rating: 4.6, img: IMG.bed, verified: true },
];

export const productCategories = ['Food & treats', 'Toys', 'Collars & leashes', 'Grooming', 'Beds & cages', 'Accessories', 'Cleaning'];

export const products = [
  { id: 'p1', shopId: 's2', name: 'NutriPaw Adult Dog Food — Chicken & Rice, 3 kg', cat: 'Food & treats', brand: 'NutriPaw', price: 2450, stock: 34, img: IMG.food, rating: 4.7, desc: 'Complete dry food for adult dogs 1–7 years. 24% protein, added omega-3 for coat health.', species: 'Dog' },
  { id: 'p2', shopId: 's2', name: 'Meowly Ocean Fish Cat Food, 1.2 kg', cat: 'Food & treats', brand: 'Meowly', price: 1150, stock: 52, img: IMG.food, rating: 4.6, desc: 'Balanced dry food for adult cats with taurine and urinary-care minerals.', species: 'Cat' },
  { id: 'p3', shopId: 's1', name: 'Rope Tug Toy (Large)', cat: 'Toys', brand: 'PlayPup', price: 450, stock: 18, img: IMG.toy, rating: 4.5, desc: 'Braided cotton rope for tug-of-war and dental cleaning.', species: 'Dog' },
  { id: 'p4', shopId: 's2', name: 'Feather Wand Cat Teaser', cat: 'Toys', brand: 'Meowly', price: 320, stock: 4, img: IMG.toy, rating: 4.4, desc: 'Telescopic wand with replaceable feather attachment.', species: 'Cat' },
  { id: 'p5', shopId: 's4', name: 'Padded Nylon Harness & Leash Set (M)', cat: 'Collars & leashes', brand: 'TrailTail', price: 1350, stock: 22, img: IMG.leash, rating: 4.8, desc: 'Reflective stitching, quick-release buckles, 1.5 m leash included.', species: 'Dog' },
  { id: 'p6', shopId: 's1', name: 'Breakaway Cat Collar with Bell', cat: 'Collars & leashes', brand: 'Meowly', price: 280, stock: 40, img: IMG.leash, rating: 4.3, desc: 'Safety buckle releases under pressure.', species: 'Cat' },
  { id: 'p7', shopId: 's5', name: 'Oatmeal Soothing Pet Shampoo, 500 ml', cat: 'Grooming', brand: 'CleanCoat', price: 690, stock: 27, img: IMG.groom, rating: 4.6, desc: 'Gentle, soap-free shampoo for dry or itchy skin. Not a medicated product.', species: 'Dog & cat' },
  { id: 'p8', shopId: 's5', name: 'Slicker Brush with Self-Clean Button', cat: 'Grooming', brand: 'CleanCoat', price: 550, stock: 0, img: IMG.groom, rating: 4.5, desc: 'Removes loose undercoat and tangles.', species: 'Dog & cat' },
  { id: 'p9', shopId: 's5', name: 'Orthopedic Bolster Bed (Large)', cat: 'Beds & cages', brand: 'RestWell', price: 4200, stock: 6, img: IMG.bed, rating: 4.9, desc: 'Memory-foam base, washable cover, non-slip bottom.', species: 'Dog' },
  { id: 'p10', shopId: 's3', name: 'Foldable Wire Crate 30"', cat: 'Beds & cages', brand: 'SafeDen', price: 3600, stock: 9, img: IMG.bed, rating: 4.4, desc: 'Two doors, divider panel and plastic tray.', species: 'Dog' },
  { id: 'p11', shopId: 's4', name: 'Stainless Steel Double Bowl', cat: 'Accessories', brand: 'TrailTail', price: 520, stock: 30, img: IMG.toy, rating: 4.5, desc: 'Anti-skid stand, dishwasher safe.', species: 'Dog & cat' },
  { id: 'p12', shopId: 's3', name: 'Clumping Cat Litter, 10 L', cat: 'Cleaning', brand: 'FreshPaws', price: 890, stock: 3, img: IMG.groom, rating: 4.2, desc: 'Low-dust bentonite with odour control.', species: 'Cat' },
  { id: 'p13', shopId: 's2', name: 'Chicken Jerky Training Treats, 200 g', cat: 'Food & treats', brand: 'NutriPaw', price: 480, stock: 45, img: IMG.food, rating: 4.7, desc: 'Single-ingredient, oven-dried treats.', species: 'Dog' },
  { id: 'p14', shopId: 's1', name: 'Enzyme Stain & Odour Remover, 750 ml', cat: 'Cleaning', brand: 'FreshPaws', price: 640, stock: 15, img: IMG.groom, rating: 4.4, desc: 'Breaks down urine and pet odours on carpets and floors.', species: 'Dog & cat' },
];

export const pharmacies = [
  { id: 'ph1', name: 'VetMed Pharmacy', area: 'Farmgate', address: 'Indira Road, Farmgate, Dhaka 1215', lat: 23.7580, lng: 90.3880, phone: '+880 1714-332109', hours: 'Daily 9:00 AM – 11:00 PM', license: 'DGDA-VP-2219', rating: 4.7, verified: true },
  { id: 'ph2', name: 'PetRx Gulshan', area: 'Gulshan', address: 'Gulshan 1 Circle, Dhaka 1212', lat: 23.7808, lng: 90.4167, phone: '+880 1819-001245', hours: 'Daily 10:00 AM – 10:00 PM', license: 'DGDA-VP-3110', rating: 4.6, verified: true },
  { id: 'ph3', name: 'Animal Health Pharmacy', area: 'Mirpur', address: 'Mirpur 2, Dhaka 1216', lat: 23.8040, lng: 90.3620, phone: '+880 1556-708834', hours: 'Sat–Thu 9:00 AM – 9:00 PM', license: 'DGDA-VP-1874', rating: 4.4, verified: true },
];

export const medicineCategories = ['Antibiotics', 'Pain relief', 'Parasite control', 'Supplements', 'Ear & eye care', 'Skin care', 'Digestive'];

export const medicines = [
  { id: 'm1', pharmacyId: 'ph1', name: 'Doxycycline 100 mg tablets', cat: 'Antibiotics', pack: 'Strip of 10', price: 180, stock: 60, expiry: day(420), rx: true, desc: 'Broad-spectrum antibiotic. Dispensed only against a valid veterinary prescription.' },
  { id: 'm2', pharmacyId: 'ph1', name: 'Amoxicillin-Clavulanate 250 mg', cat: 'Antibiotics', pack: 'Strip of 6', price: 240, stock: 8, expiry: day(300), rx: true, desc: 'Antibiotic for bacterial infections. Prescription required.' },
  { id: 'm3', pharmacyId: 'ph1', name: 'Meloxicam oral suspension 1.5 mg/ml, 10 ml', cat: 'Pain relief', pack: 'Bottle', price: 520, stock: 14, expiry: day(40), rx: true, desc: 'Anti-inflammatory for dogs. Dose is set by your vet.' },
  { id: 'm4', pharmacyId: 'ph1', name: 'Fipronil spot-on (dogs 10–20 kg)', cat: 'Parasite control', pack: '3 pipettes', price: 950, stock: 33, expiry: day(510), rx: false, desc: 'Flea and tick treatment. Follow the weight band on the pack.' },
  { id: 'm5', pharmacyId: 'ph1', name: 'Praziquantel + Pyrantel dewormer', cat: 'Parasite control', pack: '4 tablets', price: 380, stock: 48, expiry: day(380), rx: false, desc: 'Broad-spectrum dewormer for dogs and cats.' },
  { id: 'm6', pharmacyId: 'ph1', name: 'Multivitamin syrup for pets, 100 ml', cat: 'Supplements', pack: 'Bottle', price: 340, stock: 25, expiry: day(260), rx: false, desc: 'General vitamin and mineral supplement.' },
  { id: 'm7', pharmacyId: 'ph1', name: 'Ear cleaning solution, 120 ml', cat: 'Ear & eye care', pack: 'Bottle', price: 450, stock: 5, expiry: day(600), rx: false, desc: 'Gentle cleanser for routine ear hygiene.' },
  { id: 'm8', pharmacyId: 'ph1', name: 'Chlorhexidine 2% medicated shampoo', cat: 'Skin care', pack: '200 ml', price: 620, stock: 19, expiry: day(-6), rx: false, desc: 'Antiseptic shampoo for skin infections.' },
  { id: 'm9', pharmacyId: 'ph1', name: 'Oral rehydration salts for pets', cat: 'Digestive', pack: '10 sachets', price: 150, stock: 70, expiry: day(25), rx: false, desc: 'Electrolyte replacement for mild dehydration.' },
  { id: 'm10', pharmacyId: 'ph1', name: 'Prednisolone 5 mg tablets', cat: 'Skin care', pack: 'Strip of 10', price: 90, stock: 41, expiry: day(330), rx: true, desc: 'Corticosteroid. Prescription required.' },
  { id: 'm11', pharmacyId: 'ph2', name: 'Probiotic paste for cats & dogs', cat: 'Digestive', pack: '15 ml syringe', price: 560, stock: 20, expiry: day(200), rx: false, desc: 'Supports gut flora after diarrhoea or antibiotics.' },
  { id: 'm12', pharmacyId: 'ph3', name: 'Eye drops (lubricating), 10 ml', cat: 'Ear & eye care', pack: 'Bottle', price: 280, stock: 12, expiry: day(150), rx: false, desc: 'Soothing lubricant for dry eyes.' },
];

export const initialPets = [
  { id: 'pet1', name: 'Bruno', species: 'Dog', breed: 'Labrador Retriever', dob: '2021-03-14', sex: 'Male', weight: '29 kg', img: IMG.dog1, allergies: 'Chicken by-products (mild itching)', notes: 'Loves fetch. Needs two walks a day. Nervous during thunderstorms.', vaccinations: [{ name: 'Rabies', date: day(-210), next: day(155) }, { name: 'DHPPi + L', date: day(-210), next: day(155) }, { name: 'Kennel cough', date: day(-400), next: day(-35) }], history: [{ date: day(-60), title: 'Ear infection', by: 'Dr. Farhana Rahman', note: 'Otitis externa, left ear. Ear drops 7 days. Resolved.' }, { date: day(-210), title: 'Annual check-up', by: 'Dhanmondi Pet Care Hospital', note: 'Healthy. Weight stable.' }] },
  { id: 'pet2', name: 'Mishti', species: 'Cat', breed: 'Persian mix', dob: '2022-08-02', sex: 'Female', weight: '4.1 kg', img: IMG.cat1, allergies: 'None known', notes: 'Indoor only. Eats wet food twice daily.', vaccinations: [{ name: 'Rabies', date: day(-90), next: day(275) }, { name: 'FVRCP', date: day(-90), next: day(275) }], history: [{ date: day(-90), title: 'Vaccination', by: 'Dr. Arif Chowdhury', note: 'Booster given. No reaction.' }] },
  { id: 'pet3', name: 'Kiwi', species: 'Bird', breed: 'Budgerigar', dob: '2024-01-10', sex: 'Male', weight: '38 g', img: IMG.budgie, allergies: 'None known', notes: 'Cage cover at night.', vaccinations: [], history: [] },
];

export const initialAppointments = [
  { id: 'A-1042', kind: 'hospital', providerId: 'h1', petId: 'pet1', service: 'General check-up', doctorId: null, date: day(2), time: '11:00 AM', reason: 'Limping slightly on front right leg after a walk.', status: 'Confirmed', price: 800, owner: 'Ayesha Rahman', ownerPhone: '+880 1712-345678', created: day(-3) },
  { id: 'A-1043', kind: 'doctor', providerId: 'd1', petId: 'pet1', service: 'Consultation', doctorId: 'd1', date: day(0), time: '04:30 PM', reason: 'Follow-up for ear infection.', status: 'Pending', price: 1200, owner: 'Ayesha Rahman', ownerPhone: '+880 1712-345678', created: day(-1), online: false },
  { id: 'A-1038', kind: 'doctor', providerId: 'd4', petId: 'pet2', service: 'Consultation', doctorId: 'd4', date: day(-12), time: '06:30 PM', reason: 'Reduced appetite for 3 days.', status: 'Completed', price: 1000, owner: 'Ayesha Rahman', ownerPhone: '+880 1712-345678', created: day(-15), reviewed: false },
  { id: 'A-1031', kind: 'hospital', providerId: 'h3', petId: 'pet1', service: 'Rabies vaccination', doctorId: null, date: day(-30), time: '10:00 AM', reason: 'Annual vaccination.', status: 'Cancelled', price: 650, owner: 'Ayesha Rahman', ownerPhone: '+880 1712-345678', created: day(-34) },
  // Other owners' bookings, seen from provider portals
  { id: 'A-1044', kind: 'hospital', providerId: 'h1', petName: 'Leo', petSpecies: 'Cat', petBreed: 'Deshi', service: 'Rabies vaccination', date: day(0), time: '12:00 PM', reason: 'Due for annual shot.', status: 'Pending', price: 650, owner: 'Shuvo Ahmed', ownerPhone: '+880 1819-223344', created: day(-1) },
  { id: 'A-1045', kind: 'hospital', providerId: 'h1', petName: 'Rocky', petSpecies: 'Dog', petBreed: 'German Shepherd', service: 'Digital X-ray', date: day(1), time: '03:00 PM', reason: 'Suspected hip dysplasia.', status: 'Pending', price: 1800, owner: 'Nabila Karim', ownerPhone: '+880 1715-998877', created: day(-1) },
  { id: 'A-1040', kind: 'hospital', providerId: 'h1', petName: 'Pumpkin', petSpecies: 'Cat', petBreed: 'Persian', service: 'Dental scaling', date: day(-2), time: '10:00 AM', reason: 'Bad breath, tartar.', status: 'Completed', price: 3500, owner: 'Tahmid Islam', ownerPhone: '+880 1911-102030', created: day(-8) },
  { id: 'A-1046', kind: 'doctor', providerId: 'd1', doctorId: 'd1', petName: 'Max', petSpecies: 'Dog', petBreed: 'Golden Retriever', service: 'Online consultation', date: day(1), time: '10:30 AM', reason: 'Post-surgery wound check.', status: 'Confirmed', price: 1200, owner: 'Sumaiya Akter', ownerPhone: '+880 1612-556677', created: day(-2), online: true },
  { id: 'A-1047', kind: 'doctor', providerId: 'd1', doctorId: 'd1', petName: 'Shadow', petSpecies: 'Cat', petBreed: 'Deshi', service: 'Consultation', date: day(0), time: '05:00 PM', reason: 'Vomiting since yesterday.', status: 'Confirmed', price: 1200, owner: 'Imran Kabir', ownerPhone: '+880 1714-454545', created: day(-1), online: false },
];

export const initialPrescriptions = [
  { id: 'RX-2201', doctorId: 'd1', apptId: 'A-1038', petId: 'pet1', petName: 'Bruno', owner: 'Ayesha Rahman', date: day(-60), status: 'Active', diagnosis: 'Otitis externa (left ear)', items: [{ med: 'Doxycycline 100 mg tablets', dose: '1 tablet', freq: 'Twice daily', duration: '7 days', note: 'Give with food' }, { med: 'Ear cleaning solution, 120 ml', dose: '5 drops', freq: 'Once daily', duration: '10 days', note: 'Clean before applying' }], notes: 'Recheck if not improved after 7 days.' },
];

export const initialOrders = [
  { id: 'ORD-5521', source: 'shop', providerId: 's2', customer: 'Ayesha Rahman', phone: '+880 1712-345678', items: [{ id: 'p1', name: 'NutriPaw Adult Dog Food — Chicken & Rice, 3 kg', qty: 1, price: 2450 }, { id: 'p13', name: 'Chicken Jerky Training Treats, 200 g', qty: 2, price: 480 }], total: 3470, delivery: 'Home delivery', address: 'Road 4, Dhanmondi, Dhaka', payment: 'Paid (bKash — prototype)', status: 'Out for delivery', date: day(-1) },
  { id: 'ORD-5498', source: 'shop', providerId: 's1', customer: 'Ayesha Rahman', phone: '+880 1712-345678', items: [{ id: 'p3', name: 'Rope Tug Toy (Large)', qty: 1, price: 450 }], total: 450, delivery: 'Store pickup', address: 'PawMart Banani', payment: 'Paid (card — prototype)', status: 'Completed', date: day(-14), reviewed: false },
  { id: 'ORD-5530', source: 'pharmacy', providerId: 'ph1', customer: 'Ayesha Rahman', phone: '+880 1712-345678', items: [{ id: 'm1', name: 'Doxycycline 100 mg tablets', qty: 1, price: 180, rx: true }, { id: 'm7', name: 'Ear cleaning solution, 120 ml', qty: 1, price: 450 }], total: 630, delivery: 'Home delivery', address: 'Road 4, Dhanmondi, Dhaka', payment: 'Pending', status: 'Prescription review', rxId: 'RX-2201', rxFile: 'prescription_bruno.pdf', date: day(0) },
  { id: 'ORD-5527', source: 'shop', providerId: 's2', customer: 'Fahim Reza', phone: '+880 1555-121212', items: [{ id: 'p2', name: 'Meowly Ocean Fish Cat Food, 1.2 kg', qty: 2, price: 1150 }], total: 2300, delivery: 'Home delivery', address: 'Lalmatia, Dhaka', payment: 'Cash on delivery', status: 'New', date: day(0) },
  { id: 'ORD-5525', source: 'shop', providerId: 's2', customer: 'Mehjabin Sultana', phone: '+880 1777-232323', items: [{ id: 'p4', name: 'Feather Wand Cat Teaser', qty: 1, price: 320 }, { id: 'p13', name: 'Chicken Jerky Training Treats, 200 g', qty: 1, price: 480 }], total: 800, delivery: 'Store pickup', address: 'Whiskers & Wags', payment: 'Paid (Nagad — prototype)', status: 'Processing', date: day(-1) },
  { id: 'ORD-5519', source: 'pharmacy', providerId: 'ph1', customer: 'Rafiq Uddin', phone: '+880 1819-343434', items: [{ id: 'm4', name: 'Fipronil spot-on (dogs 10–20 kg)', qty: 1, price: 950 }, { id: 'm5', name: 'Praziquantel + Pyrantel dewormer', qty: 1, price: 380 }], total: 1330, delivery: 'Home delivery', address: 'Kalabagan, Dhaka', payment: 'Paid (bKash — prototype)', status: 'Preparing', date: day(-1) },
  { id: 'ORD-5533', source: 'pharmacy', providerId: 'ph1', customer: 'Nadia Hossain', phone: '+880 1611-878787', items: [{ id: 'm3', name: 'Meloxicam oral suspension 1.5 mg/ml, 10 ml', qty: 1, price: 520, rx: true }], total: 520, delivery: 'Home delivery', address: 'Green Road, Dhaka', payment: 'Pending', status: 'Prescription review', rxFile: 'rx_scan_nadia.jpg', rxId: null, date: day(0) },
];

export const initialAds = [
  { id: 'AD-301', owner: 'Ayesha Rahman', mine: true, name: 'Kiwi & Pista', species: 'Bird', breed: 'Budgerigar pair', age: '1 year', type: 'For Sale', price: 2500, area: 'Dhanmondi', img: IMG.budgie, desc: 'Healthy, hand-tamed pair. Comes with cage and 2 kg seed mix.', health: 'Active, eating well. Vet check 2 months ago.', vacc: 'Not applicable', temperament: 'Friendly, used to people', care: 'Seed + fresh greens daily; clean cage weekly.', contact: 'In-app messages', status: 'Active', inquiries: 3, posted: day(-5), reports: 0 },
  { id: 'AD-288', owner: 'Ayesha Rahman', mine: true, name: 'Tom', species: 'Cat', breed: 'Deshi', age: '2 years', type: 'Rehoming', price: 0, area: 'Dhanmondi', img: IMG.cat3, desc: 'Moving abroad and looking for a loving indoor home.', health: 'Neutered, healthy', vacc: 'Rabies + FVRCP up to date', temperament: 'Calm, likes laps', care: 'Indoor only, dry + wet food', contact: 'In-app messages', status: 'Reserved', inquiries: 7, posted: day(-20), reports: 0 },
  { id: 'AD-310', owner: 'Sharmin Akter', name: 'Snowball', species: 'Cat', breed: 'Persian', age: '3 months', type: 'For Sale', price: 12000, area: 'Mohammadpur', img: IMG.kitten, desc: 'Litter-trained Persian kitten, first vaccine done.', health: 'Dewormed twice', vacc: 'FVRCP dose 1', temperament: 'Playful', care: 'Kitten food 3× daily', contact: 'In-app messages', status: 'Active', inquiries: 12, posted: day(-2), reports: 0 },
  { id: 'AD-311', owner: 'Mahmud Hasan', name: 'Deshi puppies (3)', species: 'Dog', breed: 'Deshi', age: '8 weeks', type: 'Free', price: 0, area: 'Mirpur', img: IMG.puppy, desc: 'Three healthy puppies looking for homes. Free to caring families.', health: 'Dewormed', vacc: 'First vaccine scheduled', temperament: 'Curious, gentle', care: 'Puppy food, warm bedding', contact: 'In-app messages', status: 'Active', inquiries: 21, posted: day(-1), reports: 0 },
  { id: 'AD-305', owner: 'Rezaul Karim', name: 'Rex', species: 'Dog', breed: 'German Shepherd', age: '4 months', type: 'For Sale', price: 25000, area: 'Uttara', img: IMG.gsd, desc: 'KCI-style lineage claimed, documents available on request.', health: 'Healthy', vacc: 'DHPPi dose 2', temperament: 'Alert, active', care: 'Large-breed puppy food', contact: 'In-app messages', status: 'Active', inquiries: 6, posted: day(-6), reports: 2, flagged: 'Price seems inconsistent; two users say photos are copied from the internet.' },
  { id: 'AD-299', owner: 'Tania Ferdous', name: 'Bunny pair', species: 'Rabbit', breed: 'Lionhead mix', age: '6 months', type: 'Free', price: 0, area: 'Gulshan', img: IMG.rabbit, desc: 'Bonded pair, must go together.', health: 'Healthy', vacc: 'Not applicable', temperament: 'Shy at first', care: 'Hay, pellets, fresh veg', contact: 'In-app messages', status: 'Active', inquiries: 4, posted: day(-9), reports: 0 },
  { id: 'AD-297', owner: 'Unknown seller 4471', name: 'Exotic parrot', species: 'Bird', breed: 'African Grey', age: '1 year', type: 'For Sale', price: 4000, area: 'Old Dhaka', img: IMG.bird, desc: 'Urgent sale, advance payment only.', health: '—', vacc: '—', temperament: '—', care: '—', contact: 'Phone only', status: 'Removed', inquiries: 1, posted: day(-11), reports: 5, flagged: 'Advance-payment request; protected species without papers.', modReason: 'Suspected fraud and possible wildlife trade. Removed under listing policy §4.' },
];

// Pet Borrow listings. exactPickup is only revealed to the confirmed parties.
export const initialBorrowListings = [
  { id: 'BL-01', petId: 'pet1', owner: 'Ayesha Rahman', mine: true, name: 'Bruno', species: 'Dog', breed: 'Labrador Retriever', age: '5 years', img: IMG.dog1, area: 'Dhanmondi', lat: 23.7490, lng: 90.3790, exactPickup: 'Road 4, House 22, Dhanmondi (gate 2)', returnPlace: 'Same as pickup', daily: 500, minDays: 1, maxDays: 5, availableFrom: day(0), availableTo: day(60), temperament: 'Gentle, loves kids, good with other dogs', care: 'Two walks a day, 300 g food twice daily, no chicken treats', rules: 'No off-leash walks near roads. Indoors at night.', supplies: 'Leash, bowl, food for the stay, bed', activities: 'Walks, park visits, fetch', safety: 'Must not be left alone more than 4 hours.', emergency: 'Dhanmondi Pet Care Hospital, +880 1711-204560', status: 'Active', rating: 4.9, borrows: 14 },
  { id: 'BL-02', petId: 'pet2', owner: 'Ayesha Rahman', mine: true, name: 'Mishti', species: 'Cat', breed: 'Persian mix', age: '4 years', img: IMG.cat1, area: 'Dhanmondi', lat: 23.7440, lng: 90.3810, exactPickup: 'Road 4, House 22, Dhanmondi (gate 2)', returnPlace: 'Same as pickup', daily: 350, minDays: 2, maxDays: 4, availableFrom: day(5), availableTo: day(40), temperament: 'Calm, shy with strangers for the first hour', care: 'Indoor only; wet food twice daily; litter cleaned daily', rules: 'Windows must have nets. No outdoor access.', supplies: 'Carrier, litter tray, food', activities: 'Indoor play', safety: 'Keep away from other cats.', emergency: 'Dr. Arif Chowdhury, Dhanmondi Pet Care Hospital', status: 'Paused', rating: 4.8, borrows: 5 },
  { id: 'BL-03', owner: 'Sabbir Ahmed', name: 'Tiger', species: 'Dog', breed: 'Deshi', age: '3 years', img: IMG.dog3, area: 'Mirpur', lat: 23.8110, lng: 90.3640, exactPickup: 'Mirpur 11, Avenue 3, near Mosque gate', returnPlace: 'Same as pickup', daily: 300, minDays: 1, maxDays: 7, availableFrom: day(0), availableTo: day(90), temperament: 'Energetic and loyal', care: 'Rice + chicken twice a day', rules: 'Leash outside at all times', supplies: 'Leash, collar, bowl', activities: 'Running, jogging partner', safety: 'Not used to cats', emergency: 'Mirpur Vet Hospital', status: 'Active', rating: 4.7, borrows: 9 },
  { id: 'BL-04', owner: 'Nafisa Chowdhury', name: 'Coco', species: 'Dog', breed: 'Shih Tzu', age: '2 years', img: IMG.dog4, area: 'Banani', lat: 23.7915, lng: 90.4010, exactPickup: 'Banani Road 17, Building "Lake View", reception', returnPlace: 'Same as pickup', daily: 600, minDays: 1, maxDays: 3, availableFrom: day(1), availableTo: day(30), temperament: 'Affectionate lap dog', care: 'Brush daily; small kibble 3× a day', rules: 'Air-conditioned room in summer', supplies: 'Brush, food, harness, pee pads', activities: 'Short walks, cuddles', safety: 'Prone to overheating', emergency: 'Gulshan Animal Clinic & Hospital', status: 'Active', rating: 4.9, borrows: 11 },
  { id: 'BL-05', owner: 'Rumana Haque', name: 'Luna', species: 'Cat', breed: 'Siamese mix', age: '3 years', img: IMG.cat2, area: 'Uttara', lat: 23.8700, lng: 90.3930, exactPickup: 'Uttara Sector 6, Road 2, House 14', returnPlace: 'Same as pickup', daily: 300, minDays: 2, maxDays: 6, availableFrom: day(0), availableTo: day(45), temperament: 'Talkative and curious', care: 'Wet food morning, dry food night', rules: 'Indoor only', supplies: 'Carrier, litter, scratching post', activities: 'Laser and feather toys', safety: 'Netted windows only', emergency: 'Uttara Companion Animal Hospital', status: 'Active', rating: 4.6, borrows: 6 },
  { id: 'BL-06', owner: 'Jubayer Alam', name: 'Mango', species: 'Bird', breed: 'Cockatiel', age: '2 years', img: IMG.bird, area: 'Bashundhara', lat: 23.8210, lng: 90.4470, exactPickup: 'Bashundhara Block D, Road 8, House 30', returnPlace: 'Same as pickup', daily: 250, minDays: 2, maxDays: 10, availableFrom: day(3), availableTo: day(70), temperament: 'Whistles tunes, hand-tamed', care: 'Seed mix + veg; fresh water daily', rules: 'No ceiling fans while out of cage', supplies: 'Travel cage, food', activities: 'Supervised out-of-cage time', safety: 'Keep away from kitchen fumes', emergency: 'Bashundhara PetWell Hospital', status: 'Active', rating: 4.8, borrows: 4 },
];

export const initialBorrowRequests = [
  // Incoming to Ayesha (owner of Bruno)
  { id: 'BR-7001', listingId: 'BL-01', borrower: 'Tasnim Hossain', borrowerPhone: '+880 1715-404040', owner: 'Ayesha Rahman', start: day(6), end: day(8), days: 2, daily: 500, message: 'I work from home and have a fenced rooftop. Would love Bruno to keep my kids company for the weekend.', carePlan: 'Two walks, will follow the food chart exactly.', status: 'Pending Owner Approval', payment: 'Not started', refund: '—', payout: '—', created: day(-1), direction: 'incoming' },
  { id: 'BR-6990', listingId: 'BL-01', borrower: 'Omar Faruq', borrowerPhone: '+880 1612-909090', owner: 'Ayesha Rahman', start: day(-2), end: day(1), days: 3, daily: 500, message: 'Running partner for the week.', carePlan: 'Morning jog at Dhanmondi Lake, evening walk.', status: 'Active', payment: 'Paid', refund: '—', payout: 'Scheduled after return', created: day(-9), direction: 'incoming', handoverAt: day(-2), handoverNote: 'Healthy, energetic. Collar + 3 kg food handed over.' },
  { id: 'BR-6950', listingId: 'BL-01', borrower: 'Sumaiya Akter', borrowerPhone: '+880 1612-556677', owner: 'Ayesha Rahman', start: day(-20), end: day(-18), days: 2, daily: 500, message: 'Weekend company.', carePlan: 'Walks + park.', status: 'Completed', payment: 'Paid', refund: '—', payout: 'Paid out', created: day(-26), direction: 'incoming', handoverAt: day(-20), returnAt: day(-18), returnNote: 'Returned on time, in good condition.' },
  // Outgoing from Ayesha
  { id: 'BR-7003', listingId: 'BL-04', borrower: 'Ayesha Rahman', borrowerPhone: '+880 1712-345678', owner: 'Nafisa Chowdhury', start: day(9), end: day(11), days: 2, daily: 600, message: 'Experienced with small dogs, have AC at home.', carePlan: 'Daily brushing and short walks.', status: 'Approved — Payment Required', payment: 'Awaiting payment', refund: '—', payout: '—', created: day(-2), direction: 'outgoing' },
  { id: 'BR-7005', listingId: 'BL-03', borrower: 'Ayesha Rahman', borrowerPhone: '+880 1712-345678', owner: 'Sabbir Ahmed', start: day(14), end: day(17), days: 3, daily: 300, message: 'Looking for a jogging buddy.', carePlan: 'Morning runs, evening walks.', status: 'Pending Owner Approval', payment: 'Not started', refund: '—', payout: '—', created: day(0), direction: 'outgoing' },
  { id: 'BR-6920', listingId: 'BL-05', borrower: 'Ayesha Rahman', borrowerPhone: '+880 1712-345678', owner: 'Rumana Haque', start: day(-40), end: day(-37), days: 3, daily: 300, message: 'Cat sitter experience.', carePlan: 'Indoor only.', status: 'Completed', payment: 'Paid', refund: '—', payout: 'Paid out', created: day(-45), direction: 'outgoing', handoverAt: day(-40), returnAt: day(-37), reviewed: true },
];

export const initialApplications = [
  { id: 'APP-118', type: 'Pet Hospital', name: 'Lalmatia Vet & Surgery', contact: 'Dr. Mizanur Rahman', email: 'lalmatia.vet@mail.bd', phone: '+880 1711-777000', area: 'Mohammadpur', submitted: day(-2), status: 'Pending Verification', docs: ['Trade licence 2026.pdf', 'DLS registration certificate.pdf', 'Clinic photos (6).zip'], notes: '' },
  { id: 'APP-119', type: 'Pet Doctor', name: 'Dr. Rifat Mahmud', contact: 'Dr. Rifat Mahmud', email: 'rifat.vet@mail.bd', phone: '+880 1819-121000', area: 'Badda', submitted: day(-1), status: 'Pending Verification', docs: ['BVC registration card.jpg', 'DVM certificate.pdf', 'National ID (masked).pdf'], notes: '' },
  { id: 'APP-116', type: 'Pharmacy', name: 'CareVet Pharma Point', contact: 'Hasib Uddin', email: 'carevet@mail.bd', phone: '+880 1556-300400', area: 'Motijheel', submitted: day(-5), status: 'Corrections Requested', docs: ['Drug licence (expired 2025).pdf', 'Trade licence.pdf'], notes: 'Drug licence copy is expired. Please upload the renewed DGDA licence.' },
  { id: 'APP-115', type: 'Pet Shop', name: 'Paws & Claws Badda', contact: 'Shahana Parvin', email: 'pawsclaws@mail.bd', phone: '+880 1777-600500', area: 'Badda', submitted: day(-8), status: 'Approved', docs: ['Trade licence.pdf', 'Shop photos.zip'], notes: 'All documents valid.' },
  { id: 'APP-112', type: 'Pet Doctor', name: 'Dr. X (unverified)', contact: 'Unknown', email: 'quickvet@mail.bd', phone: '+880 1300-000111', area: 'Old Dhaka', submitted: day(-12), status: 'Rejected', docs: ['Certificate.jpg'], notes: 'Registration number did not match the BVC register.' },
];

export const initialUsers = [
  { id: 'U-1001', name: 'Ayesha Rahman', email: 'user@petpaw.bd', type: 'User', status: 'Active', joined: '2025-11-02', activity: '3 pets · 12 bookings · 2 ads' },
  { id: 'U-1002', name: 'Shuvo Ahmed', email: 'shuvo@mail.bd', type: 'User', status: 'Active', joined: '2026-01-14', activity: '1 pet · 4 bookings' },
  { id: 'U-1003', name: 'Dhanmondi Pet Care Hospital', email: 'hospital@petpaw.bd', type: 'Pet Hospital', status: 'Active', joined: '2025-09-20', activity: '412 appointments' },
  { id: 'U-1004', name: 'Dr. Farhana Rahman', email: 'doctor@petpaw.bd', type: 'Pet Doctor', status: 'Active', joined: '2025-09-22', activity: '286 consultations' },
  { id: 'U-1005', name: 'VetMed Pharmacy', email: 'pharmacy@petpaw.bd', type: 'Pharmacy', status: 'Active', joined: '2025-10-05', activity: '930 orders' },
  { id: 'U-1006', name: 'Whiskers & Wags', email: 'shop@petpaw.bd', type: 'Pet Shop', status: 'Active', joined: '2025-10-11', activity: '1,240 orders' },
  { id: 'U-1007', name: 'Unknown seller 4471', email: 'cheap.pets4471@mail.bd', type: 'User', status: 'Suspended', joined: '2026-10-12', activity: '1 removed ad · 5 reports' },
  { id: 'U-1008', name: 'Rezaul Karim', email: 'rezaul.k@mail.bd', type: 'User', status: 'Restricted', joined: '2026-06-30', activity: '1 flagged ad · 2 reports' },
  { id: 'U-1009', name: 'Tasnim Hossain', email: 'tasnim.h@mail.bd', type: 'User', status: 'Active', joined: '2026-03-08', activity: '2 borrow requests' },
  { id: 'U-1010', name: 'Omar Faruq', email: 'omar.f@mail.bd', type: 'User', status: 'Active', joined: '2026-02-19', activity: '5 borrowings' },
];

export const initialReports = [
  { id: 'RP-901', category: 'Listing', target: 'AD-305 · Rex (German Shepherd)', by: 'Two users', date: day(-1), status: 'Open', priority: 'Medium', detail: 'Photos appear to be copied from another website; seller avoids video call.', notes: [], outcome: '' },
  { id: 'RP-902', category: 'Pet Borrow', target: 'BR-6990 · Bruno', by: 'Ayesha Rahman', date: day(0), status: 'Open', priority: 'Low', detail: 'Borrower asked to extend by one day via phone instead of the app.', notes: [], outcome: '' },
  { id: 'RP-897', category: 'Order', target: 'ORD-5480 · Pet Bazaar Mirpur', by: 'Kamal Hossain', date: day(-6), status: 'In review', priority: 'Medium', detail: 'Received cat food past its best-before date.', notes: ['Asked shop for batch photos — Rakib'], outcome: '' },
  { id: 'RP-890', category: 'Provider', target: 'Dr. X (unverified)', by: 'System', date: day(-12), status: 'Resolved', priority: 'High', detail: 'Provider claimed verified status in an ad outside the platform.', notes: ['Application rejected — Rakib'], outcome: 'Application rejected; account blocked from re-applying for 90 days.' },
];

export const initialReviews = [
  { id: 'RV-1', target: 'Dhanmondi Pet Care Hospital', targetType: 'hospital', targetId: 'h1', by: 'Tahmid Islam', rating: 5, text: 'Pumpkin’s dental scaling went smoothly and they called me after she woke up. Clean and calm place.', date: day(-1), status: 'Visible' },
  { id: 'RV-2', target: 'Dr. Farhana Rahman', targetType: 'doctor', targetId: 'd1', by: 'Sumaiya Akter', rating: 5, text: 'Explained the surgery plan clearly and checked on Max every day after.', date: day(-4), status: 'Visible' },
  { id: 'RV-3', target: 'Whiskers & Wags', targetType: 'shop', targetId: 's2', by: 'Mehjabin Sultana', rating: 4, text: 'Good range of cat toys. Delivery took a day longer than shown.', date: day(-3), status: 'Visible' },
  { id: 'RV-4', target: 'VetMed Pharmacy', targetType: 'pharmacy', targetId: 'ph1', by: 'Rafiq Uddin', rating: 5, text: 'They double-checked the weight band on the flea treatment before packing. Appreciated.', date: day(-6), status: 'Visible' },
  { id: 'RV-5', target: 'Dhanmondi Pet Care Hospital', targetType: 'hospital', targetId: 'h1', by: 'Anonymous 2290', rating: 1, text: 'Contact me on WhatsApp for cheaper vaccines!!! 01XXXXXXXXX', date: day(-2), status: 'Flagged', flag: 'Spam / external contact' },
  { id: 'RV-6', target: 'Bruno (Pet Borrow)', targetType: 'borrow', targetId: 'BL-01', by: 'Sumaiya Akter', rating: 5, text: 'Bruno was a gentleman. Clear care instructions and an easy handover.', date: day(-17), status: 'Visible' },
  { id: 'RV-7', target: 'Dr. Farhana Rahman', targetType: 'doctor', targetId: 'd1', by: 'Imran Kabir', rating: 4, text: 'Very knowledgeable. Waiting time was around 25 minutes.', date: day(-9), status: 'Visible' },
];

export const initialThreads = [
  { id: 'T-1', with: 'Sharmin Akter', about: 'Ad AD-310 · Snowball', messages: [{ me: true, text: 'Hi! Is Snowball still available? Has she had her first vaccine?', at: '10:12 AM' }, { me: false, text: 'Yes, still available. First FVRCP dose done last week. Happy to share the vet card.', at: '10:20 AM' }] },
  { id: 'T-2', with: 'Tasnim Hossain', about: 'Borrow request BR-7001 · Bruno', messages: [{ me: false, text: 'Hello! I sent a request for Bruno next weekend. Is he OK around a 6-year-old?', at: 'Yesterday' }] },
  { id: 'T-3', with: 'Nafisa Chowdhury', about: 'Borrow request BR-7003 · Coco', messages: [{ me: false, text: 'Approved! Please complete payment so the booking is confirmed. Coco needs her brush every evening.', at: '2 days ago' }, { me: true, text: 'Thank you! Will pay today.', at: '2 days ago' }] },
];

export const initialNotifications = {
  user: [
    { id: 'n1', text: 'Your appointment A-1042 at Dhanmondi Pet Care Hospital is confirmed.', at: '2h ago', read: false, link: '/user/appointments' },
    { id: 'n2', text: 'Nafisa Chowdhury approved your borrow request for Coco. Payment required to confirm.', at: '2 days ago', read: false, link: '/borrow/requests' },
    { id: 'n3', text: 'Order ORD-5521 is out for delivery.', at: '3h ago', read: true, link: '/user/orders' },
    { id: 'n4', text: 'Bruno’s kennel cough vaccine is overdue.', at: '1 day ago', read: false, link: '/user/pets/pet1' },
  ],
  admin: [
    { id: 'n1', text: '2 new provider applications are waiting for review.', at: '1h ago', read: false, link: '/admin/verification' },
    { id: 'n2', text: 'Listing AD-305 received a second report.', at: '1 day ago', read: false, link: '/admin/ads' },
  ],
  hospital: [
    { id: 'n1', text: 'New booking request A-1045 (Rocky — Digital X-ray).', at: '40m ago', read: false, link: '/hospital/appointments' },
    { id: 'n2', text: 'New 5★ review from Tahmid Islam.', at: '1 day ago', read: true, link: '/hospital/reviews' },
  ],
  doctor: [
    { id: 'n1', text: 'New consultation request from Ayesha Rahman for Bruno (today 4:30 PM).', at: '1h ago', read: false, link: '/doctor/appointments' },
    { id: 'n2', text: 'Online consultation with Max tomorrow at 10:30 AM.', at: '5h ago', read: true, link: '/doctor/consultations' },
  ],
  pharmacy: [
    { id: 'n1', text: '2 orders need prescription review.', at: '20m ago', read: false, link: '/pharmacy/prescriptions' },
    { id: 'n2', text: 'Chlorhexidine 2% shampoo batch has expired and was blocked from sale.', at: '1 day ago', read: false, link: '/pharmacy/stock' },
  ],
  shop: [
    { id: 'n1', text: 'New order ORD-5527 from Fahim Reza.', at: '15m ago', read: false, link: '/shop/orders' },
    { id: 'n2', text: 'Feather Wand Cat Teaser is low on stock (4 left).', at: '3h ago', read: false, link: '/shop/inventory' },
  ],
  borrow: [
    { id: 'n1', text: 'New borrow request from Tasnim Hossain for Bruno.', at: '1 day ago', read: false, link: '/borrow/incoming' },
    { id: 'n2', text: 'Bruno is due back from Omar Faruq tomorrow.', at: '3h ago', read: false, link: '/borrow/returns' },
  ],
};

export const initialActivity = [
  { at: `${day(-1)} 16:42`, who: 'Rakib Hasan', action: 'Approved provider application APP-115 (Paws & Claws Badda)' },
  { at: `${day(-2)} 11:05`, who: 'Rakib Hasan', action: 'Requested corrections on APP-116 (CareVet Pharma Point)' },
  { at: `${day(-11)} 09:30`, who: 'Rakib Hasan', action: 'Removed listing AD-297 — suspected fraud' },
  { at: `${day(-11)} 09:32`, who: 'Rakib Hasan', action: 'Suspended account U-1007' },
  { at: `${day(-12)} 14:18`, who: 'Nasrin Sultana', action: 'Rejected provider application APP-112' },
];

export const testimonials = [
  { name: 'Tahmid Islam', area: 'Lalmatia', text: 'Booked a dental scaling for my cat in two minutes and got a reminder the evening before. The hospital already had her vaccine history when we arrived.', pet: 'Pumpkin, Persian cat' },
  { name: 'Sumaiya Akter', area: 'Dhanmondi', text: 'I borrowed Bruno for a weekend before deciding to adopt my own dog. Clear care rules, easy handover, and the owner could see everything in the app.', pet: 'Borrowed Bruno, Labrador' },
  { name: 'Rafiq Uddin', area: 'Kalabagan', text: 'The pharmacy checked my dog’s weight before sending flea treatment. Feels safer than random online sellers.', pet: 'Tiger, Deshi dog' },
];

export const faqs = [
  { q: 'Is PetPaw free for pet owners?', a: 'Creating an account, adding pets and browsing are free. You pay providers directly for appointments and orders. Pet Borrow bookings include a platform service commission shown before you pay.' },
  { q: 'How are hospitals, doctors and shops verified?', a: 'Providers upload licences and registration documents when they sign up. Our admin team checks them before the provider gets a Verified badge. Unverified providers are not shown as verified anywhere on the platform.' },
  { q: 'Can I buy prescription medicine without a prescription?', a: 'No. Medicines marked Rx need a valid prescription from a registered vet. You can upload one or use a prescription your PetPaw doctor issued, and the pharmacy reviews it before dispensing.' },
  { q: 'How does Pet Borrow work?', a: 'Owners list pets for short, paid stays. You request dates, the owner approves or declines, and only then do you pay. The booking is confirmed after payment succeeds. Handover and return are recorded in the app.' },
  { q: 'Will my home address be shown to strangers?', a: 'No. Pet Borrow listings only show a general area. The exact pickup point is shared with the borrower after the owner approves and payment succeeds.' },
  { q: 'How do I report a suspicious ad or provider?', a: 'Use the Report button on any listing, provider profile, order or booking. Our team reviews every report and updates you on the outcome.' },
];
