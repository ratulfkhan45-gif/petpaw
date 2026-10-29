import React, { useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Banknote, Boxes, Edit3, Package, PackagePlus, Plus, Receipt, Save, Store, Trash2, Truck, Upload } from 'lucide-react';
import PortalLayout from '../components/PortalLayout.jsx';
import { BarChart, Chip, Empty, Field, Img, Modal, PageHeader, StatCard, Table } from '../components/ui.jsx';
import { money, newId, useApp } from '../context/AppContext.jsx';
import { IMG, productCategories } from '../data/mock.js';
import { Categories, DeliveryBoard, OrdersTable } from './PharmacyPortal.jsx';
import { LocationEditor, NotificationsPage, ProviderReviewsPage, SettingsPage, VerifiedBadge } from './shared.jsx';

const SID = 's2';
const crumbs = (label) => [{ label: 'Dashboard', to: '/shop/dashboard' }, { label }];

function Dashboard() {
  const { db } = useApp();
  const prods = db.products.filter((p) => p.shopId === SID);
  const orders = db.orders.filter((o) => o.source === 'shop' && o.providerId === SID);
  const sales = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
  return (
    <div className="stack lg">
      <PageHeader title={db.auth.name} sub={<span className="row" style={{ gap: 8 }}><VerifiedBadge pending={db.auth.pending} /> · Dhanmondi</span>} actions={<Link to="/shop/add" className="btn btn-primary"><PackagePlus size={16} /> Add product</Link>} />
      <div className="grid g4">
        <StatCard icon={Receipt} label="New orders" value={orders.filter((o) => o.status === 'New').length} to="/shop/orders" />
        <StatCard icon={Package} label="Active products" value={prods.filter((p) => p.stock > 0).length} tone="teal" to="/shop/products" />
        <StatCard icon={Boxes} label="Low-stock products" value={prods.filter((p) => p.stock <= 5).length} tone="red" to="/shop/inventory" />
        <StatCard icon={Banknote} label="Sales (all orders)" value={money(sales)} tone="orange" to="/shop/reports" />
      </div>
      <div className="split">
        <div className="card">
          <div className="card-title"><h3>Recent orders</h3><Link to="/shop/orders" className="small">All</Link></div>
          <Table rows={orders} pageSize={5} columns={[{ label: 'Order', key: 'id' }, { label: 'Customer', key: 'customer' }, { label: 'Total', num: true, render: (o) => money(o.total) }, { label: 'Fulfilment', render: (o) => <span className="small">{o.delivery}</span> }, { label: 'Status', render: (o) => <Chip status={o.status} /> }]} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Recent activity</h3></div>
          <div className="stack sm">{(db.notifications.shop || []).map((n) => <div key={n.id} className="small">{n.text}<div className="tiny muted">{n.at}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { db, set, toast } = useApp();
  const s = db.shops.find((x) => x.id === SID);
  const [f, setF] = useState({ desc: 'Neighbourhood pet store for cats and dogs: premium food, toys and grooming supplies. Same-day delivery in Dhanmondi and Lalmatia.', email: 'hello@whiskerswags.bd', ...s });
  const [err, setErr] = useState('');
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="stack lg">
      <PageHeader title="Shop Profile" crumbs={crumbs('Shop Profile')} actions={<button className="btn btn-primary" onClick={() => { if (f.address.trim().length < 10) return setErr('Enter a complete address'); setErr(''); set('shops', (ss) => ss.map((x) => (x.id === SID ? f : x))); toast('Shop profile saved. Map pin updated.'); }}><Save size={16} /> Save</button>} />
      <div className="grid g2">
        <div className="card stack">
          <div className="row between"><div className="row"><div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden' }}><Img src={f.img} alt="" /></div><strong>{f.name}</strong></div><VerifiedBadge pending={db.auth.pending} /></div>
          <div className="form-grid">
            <Field label="Shop name" full htmlFor="sh-n"><input id="sh-n" className="input" value={f.name} onChange={up('name')} /></Field>
            <Field label="Phone" htmlFor="sh-p"><input id="sh-p" className="input" value={f.phone} onChange={up('phone')} /></Field>
            <Field label="Email" htmlFor="sh-e"><input id="sh-e" className="input" value={f.email} onChange={up('email')} /></Field>
            <Field label="Opening hours" full htmlFor="sh-h"><input id="sh-h" className="input" value={f.hours} onChange={up('hours')} /></Field>
            <Field label="Description" full htmlFor="sh-d"><textarea id="sh-d" className="textarea" value={f.desc} onChange={up('desc')} /></Field>
          </div>
          <label className="upload"><input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && toast(`Logo “${e.target.files[0].name}” uploaded (prototype)`)} /><Upload size={18} style={{ margin: '0 auto 4px' }} /> Upload shop logo</label>
        </div>
        <div className="card stack"><h3>Address & map location</h3><p className="small muted">Shown on the Pet Shop map with View Shop and Directions.</p><LocationEditor value={f} onChange={setF} error={err} /></div>
      </div>
    </div>
  );
}

function ProductForm({ prod, onDone }) {
  const { set, toast } = useApp();
  const [f, setF] = useState(prod || { name: '', cat: productCategories[0], brand: '', price: '', stock: '', desc: '', species: 'Dog', photo: '' });
  const [err, setErr] = useState({});
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const er = {};
    if (!f.name.trim()) er.name = 'Enter a product name';
    if (!(Number(f.price) > 0)) er.price = 'Enter a price';
    if (f.stock === '' || Number(f.stock) < 0) er.stock = 'Enter stock quantity';
    if (/antibiotic|tablet|mg\b|prescription|steroid/i.test(f.name)) er.name = 'Medicines must be sold through a licensed pharmacy, not the Pet Shop';
    setErr(er);
    if (Object.keys(er).length) return;
    const rec = { ...f, price: Number(f.price), stock: Number(f.stock) };
    if (prod) set('products', (p) => p.map((x) => (x.id === prod.id ? rec : x)));
    else set('products', (p) => [{ ...rec, id: newId('p'), shopId: SID, img: f.cat === 'Food & treats' ? IMG.food : f.cat === 'Toys' ? IMG.toy : f.cat === 'Grooming' ? IMG.groom : f.cat === 'Beds & cages' ? IMG.bed : IMG.leash, rating: 0 }, ...p]);
    toast(prod ? 'Product updated' : 'Product published');
    onDone();
  };
  return (
    <div className="stack">
      <div className="form-grid">
        <div className="full">{f.photo ? <div className="doc-thumb"><Upload size={15} /> {f.photo}</div> : <label className="upload"><input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files[0] && setF({ ...f, photo: e.target.files[0].name })} /><Upload size={18} style={{ margin: '0 auto 4px' }} /> Product images</label>}</div>
        <Field label="Product name" required error={err.name} full htmlFor="pr-n"><input id="pr-n" className={`input ${err.name ? 'invalid' : ''}`} value={f.name} onChange={up('name')} /></Field>
        <Field label="Category" htmlFor="pr-c"><select id="pr-c" className="select" value={f.cat} onChange={up('cat')}>{productCategories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Brand" htmlFor="pr-b"><input id="pr-b" className="input" value={f.brand} onChange={up('brand')} /></Field>
        <Field label="Price (৳)" required error={err.price} htmlFor="pr-p"><input id="pr-p" type="number" min="0" className={`input ${err.price ? 'invalid' : ''}`} value={f.price} onChange={up('price')} /></Field>
        <Field label="Stock quantity" required error={err.stock} htmlFor="pr-s"><input id="pr-s" type="number" min="0" className={`input ${err.stock ? 'invalid' : ''}`} value={f.stock} onChange={up('stock')} /></Field>
        <Field label="Suitable for" htmlFor="pr-sp"><select id="pr-sp" className="select" value={f.species} onChange={up('species')}><option>Dog</option><option>Cat</option><option>Dog & cat</option><option>Bird</option><option>Small pets</option></select></Field>
        <Field label="Description" full htmlFor="pr-d"><textarea id="pr-d" className="textarea" value={f.desc} onChange={up('desc')} /></Field>
      </div>
      <div className="alert alert-info small">Medicines and prescription items can’t be listed here. They belong in a licensed pharmacy’s inventory.</div>
      <div className="row end"><button className="btn btn-primary" onClick={save}><Save size={16} /> Save product</button></div>
    </div>
  );
}

function Products({ stockView }) {
  const { db, set, toast, confirm } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [edit, setEdit] = useState(null);
  const [adj, setAdj] = useState({});
  const list = db.products.filter((p) => p.shopId === SID && (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!cat || p.cat === cat)).sort((a, b) => (stockView ? a.stock - b.stock : 0));
  return (
    <div className="stack lg">
      <PageHeader title={stockView ? 'Inventory / Stock' : 'My Products'} crumbs={crumbs(stockView ? 'Inventory / Stock' : 'My Products')} sub={stockView ? 'Lowest stock first. Out-of-stock products show as unavailable to customers.' : 'Pet Shop products only — kept separate from pharmacy medicines.'} actions={!stockView && <Link to="/shop/add" className="btn btn-primary"><Plus size={16} /> Add product</Link>} />
      <div className="card pad-sm row">
        <input className="input" style={{ maxWidth: 280 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
        <select className="select" style={{ maxWidth: 220 }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category"><option value="">All categories</option>{productCategories.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <Table rows={list} pageSize={10} columns={[
        { label: 'Product', render: (p) => <div className="row" style={{ flexWrap: 'nowrap' }}><div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><Img src={p.img} alt="" /></div><div><strong className="small">{p.name}</strong><div className="tiny muted">{p.brand}</div></div></div> },
        { label: 'Category', key: 'cat' }, { label: 'Price', num: true, render: (p) => money(p.price) },
        { label: 'Stock', num: true, render: (p) => <span style={{ color: p.stock <= 5 ? 'var(--bad)' : undefined, fontWeight: p.stock <= 5 ? 700 : 400 }}>{p.stock}</span> },
        { label: 'Availability', render: (p) => <Chip status={p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? 'Low stock' : 'In stock'} /> },
        stockView
          ? { label: 'Restock', render: (p) => <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><input type="number" min="1" className="input" style={{ width: 80 }} value={adj[p.id] || ''} onChange={(e) => setAdj({ ...adj, [p.id]: e.target.value })} placeholder="+qty" aria-label={`Restock ${p.name}`} /><button className="btn btn-outline btn-sm" disabled={!(Number(adj[p.id]) > 0)} onClick={() => { set('products', (x) => x.map((y) => (y.id === p.id ? { ...y, stock: y.stock + Number(adj[p.id]) } : y))); setAdj({ ...adj, [p.id]: '' }); toast('Stock updated'); }}>Add</button></div> }
          : { label: '', render: (p) => <div className="row" style={{ gap: 4, flexWrap: 'nowrap' }}><button className="btn btn-ghost btn-sm" onClick={() => setEdit(p)} aria-label="Edit"><Edit3 size={14} /></button><button className="btn btn-ghost btn-sm" style={{ color: 'var(--bad)' }} aria-label="Delete" onClick={() => confirm({ title: `Delete ${p.name}?`, body: 'The product will be removed from your shop. Past orders are not affected.', danger: true, confirmLabel: 'Delete', onConfirm: () => { set('products', (x) => x.filter((y) => y.id !== p.id)); toast('Product deleted', 'info'); } })}><Trash2 size={14} /></button></div> },
      ]} />
      <Modal open={!!edit} wide onClose={() => setEdit(null)} title={`Edit ${edit?.name}`}>{edit && <ProductForm prod={edit} onDone={() => setEdit(null)} />}</Modal>
    </div>
  );
}

function AddProduct() {
  const nav = useNavigate();
  return <div className="stack lg"><PageHeader title="Add Product" crumbs={crumbs('Add Product')} /><div className="card"><ProductForm onDone={() => nav('/shop/products')} /></div></div>;
}

function DeliverySettings() {
  const { db, set, toast } = useApp();
  const [d, setD] = useState(db.shopDelivery);
  return (
    <div className="card stack">
      <h3>Fulfilment options</h3>
      <div className="row" style={{ gap: 20 }}>
        <label className="check"><input type="checkbox" checked={d.delivery} onChange={(e) => setD({ ...d, delivery: e.target.checked })} /> Home delivery</label>
        <label className="check"><input type="checkbox" checked={d.pickup} onChange={(e) => setD({ ...d, pickup: e.target.checked })} /> Store pickup</label>
      </div>
      <div className="grid g4">
        <Field label="Inside Dhaka (৳)" htmlFor="dl-i"><input id="dl-i" type="number" className="input" value={d.insideDhaka} disabled={!d.delivery} onChange={(e) => setD({ ...d, insideDhaka: Number(e.target.value) })} /></Field>
        <Field label="Outside Dhaka (৳)" htmlFor="dl-o"><input id="dl-o" type="number" className="input" value={d.outsideDhaka} disabled={!d.delivery} onChange={(e) => setD({ ...d, outsideDhaka: Number(e.target.value) })} /></Field>
        <Field label="Free delivery above (৳)" htmlFor="dl-f"><input id="dl-f" type="number" className="input" value={d.freeAbove} disabled={!d.delivery} onChange={(e) => setD({ ...d, freeAbove: Number(e.target.value) })} /></Field>
        <Field label="Delivery time" htmlFor="dl-t"><input id="dl-t" className="input" value={d.eta} disabled={!d.delivery} onChange={(e) => setD({ ...d, eta: e.target.value })} /></Field>
      </div>
      {!d.delivery && !d.pickup && <span className="error-text">Turn on at least one option so customers can order.</span>}
      <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!d.delivery && !d.pickup} onClick={() => { set('shopDelivery', d); set('shops', (ss) => ss.map((s) => (s.id === SID ? { ...s, delivery: d.delivery, pickup: d.pickup } : s))); toast('Delivery settings saved'); }}><Save size={16} /> Save options</button>
    </div>
  );
}

function SalesReports() {
  const { db } = useApp();
  const prods = db.products.filter((p) => p.shopId === SID);
  const sales = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((m, i) => ({ label: m, value: 68000 + i * 7200 + (i % 2) * 5000 }));
  const top = prods.map((p, i) => ({ id: p.id, name: p.name, sold: 120 - i * 17, revenue: (120 - i * 17) * p.price, stock: p.stock })).sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="stack lg">
      <PageHeader title="Sales & Reports" crumbs={crumbs('Sales & Reports')} />
      <div className="card"><div className="card-title"><h3>Monthly sales</h3><span className="tiny muted">Sample figures</span></div><BarChart data={sales} valueFmt={(v) => `${Math.round(v / 1000)}k`} /></div>
      <div className="card"><div className="card-title"><h3>Product performance</h3></div><Table rows={top} columns={[{ label: 'Product', key: 'name' }, { label: 'Units sold', num: true, key: 'sold' }, { label: 'Revenue', num: true, render: (r) => money(r.revenue) }, { label: 'Stock left', num: true, key: 'stock' }]} /></div>
    </div>
  );
}

export default function ShopPortal() {
  const { db } = useApp();
  return (
    <Routes>
      <Route element={<PortalLayout portal="shop" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="products" element={<Products />} />
        <Route path="add" element={<AddProduct />} />
        <Route path="categories" element={<Categories items={db.products.filter((p) => p.shopId === SID)} setKey="products" crumbsArr={crumbs('Categories & Pricing')} base={SID} idKey="shopId" cats={productCategories} />} />
        <Route path="inventory" element={<Products stockView />} />
        <Route path="orders" element={<OrdersTable source="shop" providerId={SID} crumbsArr={crumbs('Orders')} statuses={['New', 'Processing', 'Out for delivery', 'Ready for pickup', 'Delivered', 'Completed', 'Cancelled']} />} />
        <Route path="delivery" element={<DeliveryBoard source="shop" providerId={SID} crumbsArr={crumbs('Delivery / Pickup')} title="Delivery / Pickup" extra={<DeliverySettings />} />} />
        <Route path="reviews" element={<ProviderReviewsPage portal="shop" type="shop" id={SID} name={db.auth?.name || 'your shop'} />} />
        <Route path="reports" element={<SalesReports />} />
        <Route path="notifications" element={<NotificationsPage portal="shop" />} />
        <Route path="settings" element={<SettingsPage portal="shop" />} />
        <Route path="*" element={<Empty title="Page not found" />} />
      </Route>
    </Routes>
  );
}
