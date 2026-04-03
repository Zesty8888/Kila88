import bcrypt from 'bcryptjs';
import db from './db.js';

export function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount > 0) return; // Already seeded

  console.log('🌱 Seeding database...');

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  /* ─── Users ─── */
  const insertUser = db.prepare(`INSERT INTO users (email, password, name, phone, role, group_tag, points) VALUES (?,?,?,?,?,?,?)`);
  insertUser.run('admin@luxe.com', hash('admin123'), '系统管理员', '13800000000', 'admin', '管理员', 0);
  insertUser.run('merchant@luxe.com', hash('merchant123'), '品质优选店', '13900001111', 'merchant', '金牌商家', 500);
  insertUser.run('user@luxe.com', hash('user123'), '小明', '13800008888', 'user', '活跃用户', 2680);
  insertUser.run('alice@test.com', hash('123456'), '爱丽丝', '13700002222', 'user', '新用户', 100);
  insertUser.run('bob@test.com', hash('123456'), '鲍勃', '13600003333', 'user', '活跃用户', 1500);
  insertUser.run('charlie@test.com', hash('123456'), '查理', '13500004444', 'user', 'VIP用户', 5200);
  insertUser.run('diana@test.com', hash('123456'), '黛安娜', '13400005555', 'user', '普通用户', 320);
  insertUser.run('evan@test.com', hash('123456'), '伊万', '13300006666', 'user', '沉默用户', 50);

  /* ─── Products ─── */
  const insertProduct = db.prepare(`INSERT INTO products (name,price,original_price,description,images,category,stock,rating,review_count,sales,is_on_sale,tags,merchant_id,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const prods = [
    ['索尼 WH-1000XM5 降噪耳机',2299,2999,'行业领先的降噪技术，30小时超长续航，舒适轻量设计，Hi-Res认证音质，多点连接功能。','["/images/product-electronics.png"]','电子产品',156,4.8,2341,8920,1,'["热销","限时特价"]',2,'active'],
    ['意大利手工真皮斜挎包',1599,2199,'甄选头层牛皮，意大利手工匠人精心缝制，复古优雅设计，可调节肩带，大容量内衬。','["/images/product-fashion.png"]','服装',89,4.7,876,3210,1,'["新品"]',2,'active'],
    ['海蓝之谜精华修护露 30ml',1980,null,'深海焕活精华，密集修护肌肤屏障，改善细纹与暗沉，适合所有肤质，奢华护肤体验。','["/images/product-beauty.png"]','美妆',234,4.9,5678,15600,0,'["口碑好物"]',2,'active'],
    ['Apple Watch Ultra 2 智能手表',5999,6499,'钛金属表壳，超亮视网膜显示屏，精准双频GPS，100米防水，最长72小时续航。','["/images/product-watch.png"]','电子产品',67,4.9,1234,4560,1,'["热销"]',2,'active'],
    ['Nike Air Max 270 跑步鞋',899,1299,'经典Max Air气垫技术，超轻网面透气鞋面，柔软内衬带来极致舒适脚感。','["/images/product-sneakers.png"]','服装',312,4.6,3456,12800,1,'["限时特价","热销"]',2,'active'],
    ['iPhone 16 Pro Max 256GB',9999,null,'全新A18 Pro芯片，钛金属设计，4800万像素四摄系统，超视网膜XDR显示屏。','["/images/product-phone.png"]','电子产品',45,4.8,8765,32100,0,'["热销"]',2,'active'],
    ['索尼 Alpha 7C II 全画幅微单',12999,14999,'3300万像素全画幅传感器，BIONZ XR处理器，5轴防抖，4K 60p视频录制。','["/images/product-camera.png"]','电子产品',28,4.7,456,1230,1,'["新品"]',2,'active'],
    ['迪奥花漾甜心淡香水 100ml',1150,1350,'清新花果香调，牡丹与玫瑰精萃，持久留香8小时，精致瓶身设计。','["/images/product-perfume.png"]','美妆',178,4.8,2345,9870,1,'["口碑好物"]',2,'active'],
    ['优衣库 SUPIMA COTTON 精梳棉T恤',99,149,'美国SUPIMA顶级棉花，触感丝滑柔软，版型挺括不变形，基础百搭款。','["/images/product-tshirt.png"]','服装',890,4.5,12345,56700,1,'["限时特价"]',2,'active'],
  ];
  for (const p of prods) insertProduct.run(...p);

  /* ─── Reviews ─── */
  const insertReview = db.prepare(`INSERT INTO reviews (user_id,product_id,rating,content,reply,created_at) VALUES (?,?,?,?,?,?)`);
  insertReview.run(3,1,5,'降噪效果非常好，佩戴舒适，音质超棒！长途飞机上简直是救星。','','2024-03-15');
  insertReview.run(4,1,4,'整体很满意，降噪能力一流。唯一缺点是头梁有点紧。','','2024-03-10');
  insertReview.run(5,6,5,'拍照能力太强了，尤其是夜景模式。Pro Motion显示屏流畅度满分。','','2024-03-20');
  insertReview.run(6,3,5,'用了一个月，皮肤明显变得更有光泽，细纹也淡了不少。','','2024-03-18');
  insertReview.run(3,5,4,'气垫很软穿着很舒服。颜值也高，就是鞋码偏小建议买大半码。','感谢评价！建议参考尺码表。','2024-03-12');
  insertReview.run(4,2,5,'皮质手感非常好，做工精细，容量比想象的大。','','2024-03-08');
  insertReview.run(5,4,5,'手表质感没话说，钛合金外壳非常耐刮。运动追踪很精确。','','2024-03-22');
  insertReview.run(6,7,4,'画质非常好，对焦速度快。机身小巧便携，出门旅行首选。','','2024-03-19');
  insertReview.run(7,8,5,'非常甜美的花香，适合春夏。留香很持久，瓶身也好看。','','2024-03-16');
  insertReview.run(8,9,4,'面料确实比普通棉好很多，穿起来很舒服。建议选深色。','','2024-03-14');

  /* ─── Orders ─── */
  const insertOrder = db.prepare(`INSERT INTO orders (id,user_id,items,total_price,status,address_name,address_phone,address_detail,tracking_number,carrier,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  insertOrder.run('ORD-20240320-001',3,'[{"productId":1,"quantity":1,"price":2299,"name":"索尼 WH-1000XM5 降噪耳机","image":"/images/product-electronics.png"}]',2299,'pending','张三','138****8888','上海市浦东新区陆家嘴金融中心1号楼','','','2024-03-20 14:30');
  insertOrder.run('ORD-20240319-002',4,'[{"productId":2,"quantity":1,"price":1599,"name":"意大利手工真皮斜挎包","image":"/images/product-fashion.png"},{"productId":9,"quantity":2,"price":198,"name":"SUPIMA COTTON T恤","image":"/images/product-tshirt.png"}]',1797,'paid','李四','139****6666','北京市朝阳区三里屯太古里','','','2024-03-19 10:15');
  insertOrder.run('ORD-20240318-003',5,'[{"productId":6,"quantity":1,"price":9999,"name":"iPhone 16 Pro Max","image":"/images/product-phone.png"}]',9999,'shipped','王五','137****5555','广州市天河区珠江新城','SF1234567890','顺丰速运','2024-03-18 09:00');
  insertOrder.run('ORD-20240317-004',6,'[{"productId":3,"quantity":2,"price":3960,"name":"海蓝之谜精华修护露","image":"/images/product-beauty.png"}]',3960,'delivered','赵六','136****4444','深圳市南山区科技园','YT9876543210','圆通快递','2024-03-17 16:45');
  insertOrder.run('ORD-20240316-005',7,'[{"productId":5,"quantity":1,"price":899,"name":"Nike Air Max 270","image":"/images/product-sneakers.png"},{"productId":8,"quantity":1,"price":1150,"name":"迪奥花漾甜心淡香水","image":"/images/product-perfume.png"}]',2049,'delivered','孙七','135****3333','成都市锦江区春熙路','ZT1122334455','中通快递','2024-03-16 11:20');

  /* ─── Coupons ─── */
  const insertCoupon = db.prepare(`INSERT INTO coupons (code,name,type,value,min_purchase,total_count,used_count,start_date,end_date,status) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  insertCoupon.run('NEW50','新人专享满200减50','fixed',50,200,1000,236,'2024-01-01','2024-12-31','active');
  insertCoupon.run('SPRING20','春季换新8折券','percent',20,500,500,89,'2024-03-01','2024-05-31','active');
  insertCoupon.run('VIP100','VIP满1000减100','fixed',100,1000,200,45,'2024-01-01','2024-12-31','active');
  insertCoupon.run('BEAUTY15','美妆专区85折','percent',15,300,300,120,'2024-03-01','2024-06-30','active');
  insertCoupon.run('EXPIRED10','已过期优惠券','fixed',10,50,100,100,'2023-01-01','2023-12-31','expired');

  /* ─── User Coupons ─── */
  const insertUserCoupon = db.prepare(`INSERT INTO user_coupons (user_id,coupon_id,used) VALUES (?,?,?)`);
  insertUserCoupon.run(3,1,0);
  insertUserCoupon.run(3,2,1);
  insertUserCoupon.run(3,3,0);
  insertUserCoupon.run(4,1,0);
  insertUserCoupon.run(5,2,0);

  /* ─── Notifications ─── */
  const insertNotif = db.prepare(`INSERT INTO notifications (title,content,type,target,created_at) VALUES (?,?,?,?,?)`);
  insertNotif.run('春季大促开启！','全场商品低至5折，更有满减优惠券等你领取！','promo','all','2024-03-20 09:00');
  insertNotif.run('您的订单已发货','订单 ORD-20240318-003 已发货，顺丰速运 SF1234567890','order','user:5','2024-03-18 15:00');
  insertNotif.run('系统维护通知','平台将于3月25日凌晨2:00-4:00进行系统维护','system','all','2024-03-24 10:00');
  insertNotif.run('新品推荐','索尼 Alpha 7C II 全画幅微单新品上架，限时优惠中！','recommend','all','2024-03-15 12:00');

  /* ─── Points Log ─── */
  const insertPoints = db.prepare(`INSERT INTO points_log (user_id,amount,type,description,created_at) VALUES (?,?,?,?,?)`);
  insertPoints.run(3,100,'earn','注册奖励','2024-01-15');
  insertPoints.run(3,230,'earn','购买 索尼耳机 获得积分','2024-03-20');
  insertPoints.run(3,500,'earn','购买 iPhone 获得积分','2024-03-18');
  insertPoints.run(6,500,'earn','注册奖励','2024-01-20');
  insertPoints.run(6,2000,'earn','累计消费满5000奖励','2024-03-01');
  insertPoints.run(6,-300,'spend','兑换优惠券','2024-03-10');

  console.log('✅ Database seeded successfully!');
}