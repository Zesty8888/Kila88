import type { Product, Review } from '@/types'

export const products: Product[] = [
  {
    id: '1',
    name: '索尼 WH-1000XM5 降噪耳机',
    price: 2299,
    originalPrice: 2999,
    description: '行业领先的降噪技术，30小时超长续航，舒适轻量设计，Hi-Res认证音质，多点连接功能。采用全新V1集成处理器，自动降噪优化器可根据环境自动调节。',
    images: ['/images/product-electronics.png'],
    category: '电子产品',
    stock: 156,
    rating: 4.8,
    reviewCount: 2341,
    sales: 8920,
    isOnSale: true,
    tags: ['热销', '限时特价'],
  },
  {
    id: '2',
    name: '意大利手工真皮斜挎包',
    price: 1599,
    originalPrice: 2199,
    description: '甄选头层牛皮，意大利手工匠人精心缝制，复古优雅设计，可调节肩带，大容量内衬。每一处细节都彰显匠心品质。',
    images: ['/images/product-fashion.png'],
    category: '服装',
    stock: 89,
    rating: 4.7,
    reviewCount: 876,
    sales: 3210,
    isOnSale: true,
    tags: ['新品'],
  },
  {
    id: '3',
    name: '海蓝之谜精华修护露 30ml',
    price: 1980,
    description: '深海焕活精华，密集修护肌肤屏障，改善细纹与暗沉，适合所有肤质，奢华护肤体验。蕴含深海巨藻精华，为肌肤注入源源能量。',
    images: ['/images/product-beauty.png'],
    category: '美妆',
    stock: 234,
    rating: 4.9,
    reviewCount: 5678,
    sales: 15600,
    tags: ['口碑好物'],
  },
  {
    id: '4',
    name: 'Apple Watch Ultra 2 智能手表',
    price: 5999,
    originalPrice: 6499,
    description: '钛金属表壳，超亮视网膜显示屏，精准双频GPS，100米防水，最长72小时续航。专为探险、户外运动和极限耐力设计。',
    images: ['/images/product-watch.png'],
    category: '电子产品',
    stock: 67,
    rating: 4.9,
    reviewCount: 1234,
    sales: 4560,
    isOnSale: true,
    tags: ['热销'],
  },
  {
    id: '5',
    name: 'Nike Air Max 270 跑步鞋',
    price: 899,
    originalPrice: 1299,
    description: '经典Max Air气垫技术，超轻网面透气鞋面，柔软内衬带来极致舒适脚感，适合日常与运动穿搭。270度可视气垫单元提供缓震。',
    images: ['/images/product-sneakers.png'],
    category: '服装',
    stock: 312,
    rating: 4.6,
    reviewCount: 3456,
    sales: 12800,
    isOnSale: true,
    tags: ['限时特价', '热销'],
  },
  {
    id: '6',
    name: 'iPhone 16 Pro Max 256GB',
    price: 9999,
    description: '全新A18 Pro芯片，钛金属设计，4800万像素四摄系统，超视网膜XDR显示屏，全天候续航。影像能力再次飞跃。',
    images: ['/images/product-phone.png'],
    category: '电子产品',
    stock: 45,
    rating: 4.8,
    reviewCount: 8765,
    sales: 32100,
    tags: ['热销'],
  },
  {
    id: '7',
    name: '索尼 Alpha 7C II 全画幅微单',
    price: 12999,
    originalPrice: 14999,
    description: '3300万像素全画幅传感器，BIONZ XR处理器，5轴防抖，4K 60p视频录制，紧凑轻量机身。创作无限可能。',
    images: ['/images/product-camera.png'],
    category: '电子产品',
    stock: 28,
    rating: 4.7,
    reviewCount: 456,
    sales: 1230,
    isOnSale: true,
    tags: ['新品'],
  },
  {
    id: '8',
    name: '迪奥花漾甜心淡香水 100ml',
    price: 1150,
    originalPrice: 1350,
    description: '清新花果香调，牡丹与玫瑰精萃，持久留香8小时，精致瓶身设计，送礼自用皆宜。',
    images: ['/images/product-perfume.png'],
    category: '美妆',
    stock: 178,
    rating: 4.8,
    reviewCount: 2345,
    sales: 9870,
    isOnSale: true,
    tags: ['口碑好物'],
  },
  {
    id: '9',
    name: '优衣库 SUPIMA COTTON 精梳棉T恤',
    price: 99,
    originalPrice: 149,
    description: '美国SUPIMA顶级棉花，触感丝滑柔软，版型挺括不变形，基础百搭款，多色可选。',
    images: ['/images/product-tshirt.png'],
    category: '服装',
    stock: 890,
    rating: 4.5,
    reviewCount: 12345,
    sales: 56700,
    isOnSale: true,
    tags: ['限时特价'],
  },
]

export const categories = [
  { id: 'all', name: '全部', icon: 'Grid3X3' },
  { id: '电子产品', name: '电子产品', icon: 'Smartphone' },
  { id: '服装', name: '服装', icon: 'Shirt' },
  { id: '美妆', name: '美妆', icon: 'Sparkles' },
  { id: '家居', name: '家居', icon: 'Home' },
  { id: '运动', name: '运动', icon: 'Dumbbell' },
]

export const reviews: Review[] = [
  {
    id: 'r1', userName: '小明', avatar: '', productId: '1', rating: 5,
    content: '降噪效果非常好，佩戴舒适，音质超棒！长途飞机上简直是救星，电池续航也很给力。',
    date: '2024-03-15',
  },
  {
    id: 'r2', userName: '阿花', avatar: '', productId: '1', rating: 4,
    content: '整体很满意，降噪能力一流。唯一缺点是头梁有点紧，戴久了耳朵会有点热。',
    date: '2024-03-10',
  },
  {
    id: 'r3', userName: '科技爱好者', avatar: '', productId: '6', rating: 5,
    content: '拍照能力太强了，尤其是夜景模式。Pro Motion显示屏流畅度满分，值得升级。',
    date: '2024-03-20',
  },
  {
    id: 'r4', userName: '美妆达人', avatar: '', productId: '3', rating: 5,
    content: '用了一个月，皮肤明显变得更有光泽，细纹也淡了不少。贵是贵但真的有效果！',
    date: '2024-03-18',
  },
  {
    id: 'r5', userName: '跑步爱好者', avatar: '', productId: '5', rating: 4,
    content: '气垫很软，穿着很舒服。颜值也高，就是鞋码偏小建议买大半码。',
    date: '2024-03-12',
    reply: '感谢您的评价！关于鞋码问题，建议参考我们的尺码表选购。',
  },
  {
    id: 'r6', userName: '时尚买手', avatar: '', productId: '2', rating: 5,
    content: '皮质手感非常好，做工精细，容量比想象的大。搭配什么风格都好看！',
    date: '2024-03-08',
  },
  {
    id: 'r7', userName: '数码发烧友', avatar: '', productId: '4', rating: 5,
    content: '手表质感没话说，钛合金外壳非常耐刮。运动追踪很精确，潜水也完全没问题。',
    date: '2024-03-22',
  },
  {
    id: 'r8', userName: '摄影师小王', avatar: '', productId: '7', rating: 4,
    content: '画质非常好，对焦速度快。机身小巧便携，出门旅行首选。不过菜单逻辑需要适应。',
    date: '2024-03-19',
  },
  {
    id: 'r9', userName: '香水控', avatar: '', productId: '8', rating: 5,
    content: '非常甜美的花香，适合春夏。留香很持久，瓶身也好看，送给女朋友她超喜欢。',
    date: '2024-03-16',
  },
  {
    id: 'r10', userName: '极简主义者', avatar: '', productId: '9', rating: 4,
    content: '面料确实比普通棉好很多，穿起来很舒服。不过白色的容易皱，建议选深色。',
    date: '2024-03-14',
  },
]

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getReviewsByProductId(productId: string): Review[] {
  return reviews.filter(r => r.productId === productId)
}

export function searchProducts(query: string, category: string, sort: string, saleOnly: boolean): Product[] {
  let result = [...products]

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category)
  }

  if (query) {
    const q = query.toLowerCase()
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }

  if (saleOnly) {
    result = result.filter(p => p.isOnSale)
  }

  switch (sort) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'sales':
      result.sort((a, b) => b.sales - a.sales)
      break
  }

  return result
}