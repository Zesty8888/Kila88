import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'luxe-mall-secret-key-2024';

app.use(cors());
app.use(express.json());

/* ═══════════ AUTH MIDDLEWARE ═══════════ */
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ success: false, error: '请先登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.json({ success: false, error: 'Token已过期' });
  }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role !== 'admin') return res.json({ success: false, error: '无管理员权限' });
    next();
  });
}

const ok = (data) => ({ success: true, data });

/* ═══════════ AUTH ROUTES ═══════════ */
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) return res.json({ success: false, error: '请填写完整信息' });
  const existing = db.prepare('SELECT id FROM users WHERE email=?').get(email);
  if (existing) return res.json({ success: false, error: '邮箱已注册' });
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (email,password,name,phone,points) VALUES (?,?,?,?,100)').run(email, hash, name, phone || '');
  const user = { id: result.lastInsertRowid, email, name, phone: phone || '', role: 'user' };
  db.prepare('INSERT INTO points_log (user_id,amount,type,description) VALUES (?,100,"earn","注册奖励")').run(user.id);
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
  res.json(ok({ user, token }));
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.json({ success: false, error: '邮箱或密码错误' });
  const payload = { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json(ok({ user: payload, token }));
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id,email,name,phone,role,avatar,group_tag,points,created_at FROM users WHERE id=?').get(req.user.id);
  res.json(ok({ user }));
});

/* ═══════════ PRODUCTS ═══════════ */
app.get('/api/products', (req, res) => {
  const { q, category, sort, sale, limit } = req.query;
  let sql = "SELECT * FROM products WHERE status='active'";
  const params = [];
  if (q) { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  if (category && category !== 'all') { sql += ' AND category=?'; params.push(category); }
  if (sale === 'true') sql += ' AND is_on_sale=1';
  if (sort === 'price-asc') sql += ' ORDER BY price ASC';
  else if (sort === 'price-desc') sql += ' ORDER BY price DESC';
  else if (sort === 'sales') sql += ' ORDER BY sales DESC';
  else sql += ' ORDER BY sales DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(Number(limit)); }
  const products = db.prepare(sql).all(...params).map(formatProduct);
  res.json(ok({ products }));
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
  if (!product) return res.json({ success: false, error: '商品不存在' });
  const reviews = db.prepare(`SELECT r.*, u.name as user_name, u.avatar as user_avatar FROM reviews r JOIN users u ON r.user_id=u.id WHERE r.product_id=? ORDER BY r.created_at DESC`).all(req.params.id);
  res.json(ok({ product: formatProduct(product), reviews }));
});

/* Admin: product CRUD */
app.post('/api/admin/products', adminAuth, (req, res) => {
  const { name, price, original_price, description, images, category, stock, is_on_sale, tags } = req.body;
  const result = db.prepare('INSERT INTO products (name,price,original_price,description,images,category,stock,is_on_sale,tags,merchant_id,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(name, price, original_price || null, description || '', JSON.stringify(images || []), category || '', stock || 0, is_on_sale ? 1 : 0, JSON.stringify(tags || []), null, 'active');
  res.json(ok({ id: result.lastInsertRowid }));
});

app.put('/api/admin/products/:id', adminAuth, (req, res) => {
  const { name, price, original_price, description, images, category, stock, is_on_sale, tags, status } = req.body;
  db.prepare('UPDATE products SET name=?,price=?,original_price=?,description=?,images=?,category=?,stock=?,is_on_sale=?,tags=?,status=? WHERE id=?').run(name, price, original_price || null, description || '', JSON.stringify(images || []), category || '', stock || 0, is_on_sale ? 1 : 0, JSON.stringify(tags || []), status || 'active', req.params.id);
  res.json(ok({ updated: true }));
});

app.delete('/api/admin/products/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json(ok({ deleted: true }));
});

/* ═══════════ CART ═══════════ */
app.get('/api/cart', auth, (req, res) => {
  const items = db.prepare(`SELECT c.quantity, c.product_id, p.* FROM cart c JOIN products p ON c.product_id=p.id WHERE c.user_id=?`).all(req.user.id);
  const cart = items.map(i => ({ product: formatProduct(i), quantity: i.quantity }));
  res.json(ok({ cart }));
});

app.post('/api/cart', auth, (req, res) => {
  const { productId, quantity } = req.body;
  db.prepare('INSERT INTO cart (user_id,product_id,quantity) VALUES (?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=quantity+?').run(req.user.id, productId, quantity || 1, quantity || 1);
  res.json(ok({ added: true }));
});

app.put('/api/cart/:productId', auth, (req, res) => {
  db.prepare('UPDATE cart SET quantity=? WHERE user_id=? AND product_id=?').run(req.body.quantity, req.user.id, req.params.productId);
  res.json(ok({ updated: true }));
});

app.delete('/api/cart/:productId', auth, (req, res) => {
  db.prepare('DELETE FROM cart WHERE user_id=? AND product_id=?').run(req.user.id, req.params.productId);
  res.json(ok({ deleted: true }));
});

/* ═══════════ FAVORITES ═══════════ */
app.get('/api/favorites', auth, (req, res) => {
  const favs = db.prepare(`SELECT f.product_id, p.* FROM favorites f JOIN products p ON f.product_id=p.id WHERE f.user_id=?`).all(req.user.id);
  const favorites = favs.map(f => ({ productId: f.product_id, product: formatProduct(f) }));
  const ids = favs.map(f => String(f.product_id));
  res.json(ok({ favorites, ids }));
});

app.post('/api/favorites/:productId', auth, (req, res) => {
  const existing = db.prepare('SELECT id FROM favorites WHERE user_id=? AND product_id=?').get(req.user.id, req.params.productId);
  if (existing) {
    db.prepare('DELETE FROM favorites WHERE id=?').run(existing.id);
    res.json(ok({ favorited: false, message: '已取消收藏' }));
  } else {
    db.prepare('INSERT INTO favorites (user_id,product_id) VALUES (?,?)').run(req.user.id, req.params.productId);
    res.json(ok({ favorited: true, message: '已加入收藏' }));
  }
});

/* ═══════════ ORDERS ═══════════ */
app.get('/api/orders', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
  res.json(ok({ orders: orders.map(formatOrder) }));
});

app.post('/api/orders', auth, (req, res) => {
  const { addressName, addressPhone, addressDetail } = req.body;
  const cartItems = db.prepare(`SELECT c.quantity, p.* FROM cart c JOIN products p ON c.product_id=p.id WHERE c.user_id=?`).all(req.user.id);
  if (cartItems.length === 0) return res.json({ success: false, error: '购物车为空' });
  const items = cartItems.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price * i.quantity, name: i.name, image: JSON.parse(i.images)[0] }));
  const total = items.reduce((s, i) => s + i.price, 0);
  const orderId = `ORD-${Date.now()}`;
  db.prepare('INSERT INTO orders (id,user_id,items,total_price,status,address_name,address_phone,address_detail) VALUES (?,?,?,?,?,?,?,?)').run(orderId, req.user.id, JSON.stringify(items), total, 'pending', addressName, addressPhone, addressDetail);
  // Award points
  const points = Math.floor(total / 10);
  db.prepare('UPDATE users SET points=points+? WHERE id=?').run(points, req.user.id);
  db.prepare('INSERT INTO points_log (user_id,amount,type,description) VALUES (?,?,"earn",?)').run(req.user.id, points, `订单 ${orderId} 获得积分`);
  // Clear cart
  db.prepare('DELETE FROM cart WHERE user_id=?').run(req.user.id);
  // Update product sales
  for (const item of cartItems) {
    db.prepare('UPDATE products SET sales=sales+?, stock=stock-? WHERE id=?').run(item.quantity, item.quantity, item.id);
  }
  res.json(ok({ orderId, points }));
});

/* ═══════════ COUPONS ═══════════ */
app.get('/api/coupons', (req, res) => {
  const coupons = db.prepare("SELECT * FROM coupons WHERE status='active' ORDER BY created_at DESC").all();
  res.json(ok({ coupons }));
});

app.post('/api/coupons/claim/:id', auth, (req, res) => {
  const existing = db.prepare('SELECT id FROM user_coupons WHERE user_id=? AND coupon_id=?').get(req.user.id, req.params.id);
  if (existing) return res.json({ success: false, error: '已领取过该优惠券' });
  const coupon = db.prepare("SELECT * FROM coupons WHERE id=? AND status='active'").get(req.params.id);
  if (!coupon) return res.json({ success: false, error: '优惠券不存在或已过期' });
  if (coupon.used_count >= coupon.total_count) return res.json({ success: false, error: '优惠券已领完' });
  db.prepare('INSERT INTO user_coupons (user_id,coupon_id) VALUES (?,?)').run(req.user.id, req.params.id);
  db.prepare('UPDATE coupons SET used_count=used_count+1 WHERE id=?').run(req.params.id);
  res.json(ok({ claimed: true }));
});

app.get('/api/my-coupons', auth, (req, res) => {
  const coupons = db.prepare(`SELECT uc.*, c.code, c.name, c.type, c.value, c.min_purchase, c.end_date FROM user_coupons uc JOIN coupons c ON uc.coupon_id=c.id WHERE uc.user_id=?`).all(req.user.id);
  res.json(ok({ coupons }));
});

/* ═══════════ POINTS ═══════════ */
app.get('/api/points', auth, (req, res) => {
  const user = db.prepare('SELECT points FROM users WHERE id=?').get(req.user.id);
  const log = db.prepare('SELECT * FROM points_log WHERE user_id=? ORDER BY created_at DESC LIMIT 20').all(req.user.id);
  res.json(ok({ points: user.points, log }));
});

/* ═══════════ NOTIFICATIONS ═══════════ */
app.get('/api/notifications', (req, res) => {
  const notifs = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
  res.json(ok({ notifications: notifs }));
});

/* ═══════════ ADMIN ROUTES ═══════════ */

// Dashboard stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_price),0) as s FROM orders WHERE status IN ('paid','shipped','delivered')").get().s;
  const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='pending'").get().c;
  const todayOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at)=date('now','localtime')").get().c;
  const newUsers7d = db.prepare("SELECT COUNT(*) as c FROM users WHERE created_at >= datetime('now','-7 days','localtime')").get().c;
  const lowStock = db.prepare("SELECT COUNT(*) as c FROM products WHERE stock < 50 AND status='active'").get().c;

  // Sales by day (last 7 days)
  const salesByDay = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total_price),0) as revenue
    FROM orders WHERE created_at >= datetime('now','-7 days','localtime')
    GROUP BY date(created_at) ORDER BY date
  `).all();

  // Top products by sales
  const topProducts = db.prepare("SELECT id,name,sales,price,stock,images FROM products WHERE status='active' ORDER BY sales DESC LIMIT 5").all().map(p => ({ ...p, images: JSON.parse(p.images) }));

  // Category distribution
  const categoryStats = db.prepare("SELECT category, COUNT(*) as count, SUM(sales) as total_sales FROM products WHERE status='active' GROUP BY category").all();

  // Order status distribution
  const orderStats = db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status').all();

  // User group distribution
  const userGroups = db.prepare("SELECT group_tag, COUNT(*) as count FROM users WHERE role='user' GROUP BY group_tag").all();

  res.json(ok({
    totalUsers, totalProducts, totalOrders, totalRevenue,
    pendingOrders, todayOrders, newUsers7d, lowStock,
    salesByDay, topProducts, categoryStats, orderStats, userGroups
  }));
});

// Users management
app.get('/api/admin/users', adminAuth, (req, res) => {
  const users = db.prepare('SELECT id,email,name,phone,role,group_tag,points,avatar,created_at FROM users ORDER BY created_at DESC').all();
  res.json(ok({ users }));
});

app.put('/api/admin/users/:id', adminAuth, (req, res) => {
  const { name, phone, role, group_tag } = req.body;
  db.prepare('UPDATE users SET name=?,phone=?,role=?,group_tag=? WHERE id=?').run(name, phone, role, group_tag, req.params.id);
  res.json(ok({ updated: true }));
});

// All products (admin)
app.get('/api/admin/products', adminAuth, (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all().map(formatProduct);
  res.json(ok({ products }));
});

// All orders (admin)
app.get('/api/admin/orders', adminAuth, (req, res) => {
  const orders = db.prepare(`SELECT o.*, u.name as user_name, u.email as user_email FROM orders o JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC`).all().map(formatOrder);
  res.json(ok({ orders }));
});

app.put('/api/admin/orders/:id', adminAuth, (req, res) => {
  const { status, tracking_number, carrier } = req.body;
  db.prepare('UPDATE orders SET status=?,tracking_number=?,carrier=? WHERE id=?').run(status, tracking_number || '', carrier || '', req.params.id);
  res.json(ok({ updated: true }));
});

// Coupons management
app.get('/api/admin/coupons', adminAuth, (req, res) => {
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
  res.json(ok({ coupons }));
});

app.post('/api/admin/coupons', adminAuth, (req, res) => {
  const { code, name, type, value, min_purchase, total_count, start_date, end_date } = req.body;
  const result = db.prepare('INSERT INTO coupons (code,name,type,value,min_purchase,total_count,start_date,end_date) VALUES (?,?,?,?,?,?,?,?)').run(code, name, type, value, min_purchase || 0, total_count || 100, start_date, end_date);
  res.json(ok({ id: result.lastInsertRowid }));
});

app.put('/api/admin/coupons/:id', adminAuth, (req, res) => {
  const { name, type, value, min_purchase, total_count, start_date, end_date, status } = req.body;
  db.prepare('UPDATE coupons SET name=?,type=?,value=?,min_purchase=?,total_count=?,start_date=?,end_date=?,status=? WHERE id=?').run(name, type, value, min_purchase, total_count, start_date, end_date, status, req.params.id);
  res.json(ok({ updated: true }));
});

// Notifications
app.get('/api/admin/notifications', adminAuth, (req, res) => {
  const notifs = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
  res.json(ok({ notifications: notifs }));
});

app.post('/api/admin/notifications', adminAuth, (req, res) => {
  const { title, content, type, target } = req.body;
  const result = db.prepare('INSERT INTO notifications (title,content,type,target) VALUES (?,?,?,?)').run(title, content, type || 'promo', target || 'all');
  res.json(ok({ id: result.lastInsertRowid }));
});

// Points management (admin view)
app.get('/api/admin/points', adminAuth, (req, res) => {
  const logs = db.prepare(`SELECT pl.*, u.name as user_name, u.email FROM points_log pl JOIN users u ON pl.user_id=u.id ORDER BY pl.created_at DESC LIMIT 50`).all();
  const totalEarned = db.prepare("SELECT COALESCE(SUM(amount),0) as s FROM points_log WHERE type='earn'").get().s;
  const totalSpent = db.prepare("SELECT COALESCE(SUM(ABS(amount)),0) as s FROM points_log WHERE type='spend'").get().s;
  res.json(ok({ logs, totalEarned, totalSpent }));
});

// Reviews management
app.get('/api/admin/reviews', adminAuth, (req, res) => {
  const reviews = db.prepare(`SELECT r.*, u.name as user_name, p.name as product_name FROM reviews r JOIN users u ON r.user_id=u.id JOIN products p ON r.product_id=p.id ORDER BY r.created_at DESC`).all();
  res.json(ok({ reviews }));
});

/* ═══════════ HELPERS ═══════════ */
function formatProduct(p) {
  return { ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images, tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags, isOnSale: !!p.is_on_sale, originalPrice: p.original_price, reviewCount: p.review_count };
}

function formatOrder(o) {
  return { ...o, items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items, totalPrice: o.total_price, createdAt: o.created_at, addressName: o.address_name, addressPhone: o.address_phone, addressDetail: o.address_detail };
}

/* ═══════════ START ═══════════ */
seedDatabase();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 LUXE Mall Backend API running on port ${PORT}`);
  console.log(`\n📋 Admin account: admin@luxe.com / admin123`);
  console.log(`📋 User account:  user@luxe.com / user123\n`);
});