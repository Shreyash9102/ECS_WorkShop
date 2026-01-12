// MongoDB init script for BlinkIt Clone
// This script runs automatically when the official MongoDB image
// initializes an empty database (mounted at /docker-entrypoint-initdb.d).

(function() {
  const dbName = 'blinkit_clone_db';
  const conn = new Mongo();
  const db = conn.getDB(dbName);

  // Helper: safe drop collections if they exist
  try { db.categories.drop(); } catch (e) {}
  try { db.subcategories.drop(); } catch (e) {}
  try { db.products.drop(); } catch (e) {}

  const categories = [
    { name: 'Grocery', image: 'https://via.placeholder.com/150?text=Grocery', createdAt: new Date() },
    { name: 'Electronics', image: 'https://via.placeholder.com/150?text=Electronics', createdAt: new Date() },
    { name: 'Home & Kitchen', image: 'https://via.placeholder.com/150?text=Home+Kitchen', createdAt: new Date() },
    { name: 'Beauty & Personal Care', image: 'https://via.placeholder.com/150?text=Beauty', createdAt: new Date() },
    { name: 'Sports & Outdoors', image: 'https://via.placeholder.com/150?text=Sports', createdAt: new Date() }
  ];

  const catRes = db.categories.insertMany(categories);
  const catMap = {};
  categories.forEach((c, i) => { catMap[c.name] = catRes.insertedIds[i]; });

  const subCategories = [
    { name: 'Dairy & Milk', categoryName: 'Grocery' },
    { name: 'Vegetables', categoryName: 'Grocery' },
    { name: 'Fruits', categoryName: 'Grocery' },
    { name: 'Snacks & Beverages', categoryName: 'Grocery' },
    { name: 'Bread & Bakery', categoryName: 'Grocery' },
    { name: 'Mobiles & Accessories', categoryName: 'Electronics' },
    { name: 'Laptops', categoryName: 'Electronics' },
    { name: 'Headphones', categoryName: 'Electronics' },
    { name: 'Cookware', categoryName: 'Home & Kitchen' },
    { name: 'Kitchen Appliances', categoryName: 'Home & Kitchen' },
    { name: 'Bedding', categoryName: 'Home & Kitchen' },
    { name: 'Skincare', categoryName: 'Beauty & Personal Care' },
    { name: 'Hair Care', categoryName: 'Beauty & Personal Care' },
    { name: 'Fragrances', categoryName: 'Beauty & Personal Care' },
    { name: 'Sports Equipment', categoryName: 'Sports & Outdoors' },
    { name: 'Outdoor Gear', categoryName: 'Sports & Outdoors' }
  ];

  const subDocs = subCategories.map(sc => ({
    name: sc.name,
    image: `https://via.placeholder.com/150?text=${encodeURIComponent(sc.name)}`,
    category: catMap[sc.categoryName],
    createdAt: new Date()
  }));

  const subRes = db.subcategories.insertMany(subDocs);
  const subMap = {};
  subCategories.forEach((s, i) => { subMap[s.name] = subRes.insertedIds[i]; });

  const products = [
    { name: 'Amul Milk 1L', category: 'Grocery', subCategory: 'Dairy & Milk', image: ['https://via.placeholder.com/300?text=Amul+Milk'], unit: '1L', price: 65, discount: 5, stock: 100, description: 'Fresh pure milk from Amul dairy' },
    { name: 'Paneer 400g', category: 'Grocery', subCategory: 'Dairy & Milk', image: ['https://via.placeholder.com/300?text=Paneer'], unit: '400g', price: 220, discount: 10, stock: 50, description: 'Premium quality fresh paneer' },
    { name: 'Tomato 1kg', category: 'Grocery', subCategory: 'Vegetables', image: ['https://via.placeholder.com/300?text=Tomato'], unit: '1kg', price: 35, discount: 5, stock: 200, description: 'Fresh red tomatoes' },
    { name: 'Banana 1kg', category: 'Grocery', subCategory: 'Fruits', image: ['https://via.placeholder.com/300?text=Banana'], unit: '1kg', price: 50, discount: 5, stock: 120, description: 'Fresh yellow bananas' },
    { name: 'Lay\'s Chips 30g', category: 'Grocery', subCategory: 'Snacks & Beverages', image: ['https://via.placeholder.com/300?text=Chips'], unit: '30g', price: 20, discount: 5, stock: 200, description: 'Classic potato chips' },
    { name: 'iPhone 14 Case', category: 'Electronics', subCategory: 'Mobiles & Accessories', image: ['https://via.placeholder.com/300?text=iPhone+Case'], unit: 'piece', price: 499, discount: 15, stock: 40, description: 'Protective phone case for iPhone 14' },
    { name: 'USB Type-C Cable', category: 'Electronics', subCategory: 'Mobiles & Accessories', image: ['https://via.placeholder.com/300?text=USB+Cable'], unit: 'piece', price: 299, discount: 20, stock: 100, description: '2m fast charging cable' },
    { name: 'Wireless Earbuds', category: 'Electronics', subCategory: 'Headphones', image: ['https://via.placeholder.com/300?text=Earbuds'], unit: 'pair', price: 2499, discount: 25, stock: 50, description: 'Premium wireless earbuds with ANC' },
    { name: 'Non-stick Pan', category: 'Home & Kitchen', subCategory: 'Cookware', image: ['https://via.placeholder.com/300?text=Pan'], unit: 'piece', price: 599, discount: 10, stock: 30, description: 'Durable non-stick cooking pan' },
    { name: 'Kitchen Knife Set', category: 'Home & Kitchen', subCategory: 'Cookware', image: ['https://via.placeholder.com/300?text=Knives'], unit: 'set', price: 1299, discount: 15, stock: 25, description: 'Complete kitchen knife set - 5 pieces' }
  ];

  const prodDocs = products.map(p => ({
    name: p.name,
    image: p.image,
    category: [ catMap[p.category] ],
    subCategory: [ subMap[p.subCategory] ],
    unit: p.unit,
    stock: p.stock,
    price: p.price,
    discount: p.discount,
    description: p.description,
    more_details: {},
    publish: true,
    createdAt: new Date()
  }));

  const prodRes = db.products.insertMany(prodDocs);

  print('✅ MongoDB initialization script completed');
  print('  - Categories:', catRes.insertedCount);
  print('  - Subcategories:', subRes.insertedCount);
  print('  - Products:', prodRes.insertedCount);

})();
