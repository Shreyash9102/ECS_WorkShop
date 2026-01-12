import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'

import CategoryModel from './models/category.model.js'
import SubCategoryModel from './models/subCategory.model.js'
import ProductModel from './models/product.model.js'

const app = express()
app.use(cors({
    credentials : true,
    origin : process.env.FRONTEND_URL
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT = 8080 || process.env.PORT 

app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)

async function bootstrapDataIfNeeded() {
    try {
        const catCount = await CategoryModel.countDocuments();
        const prodCount = await ProductModel.countDocuments();
        if (catCount > 0 || prodCount > 0) {
            console.log('✅ Database already has data, skipping bootstrap');
            return;
        }

        console.log('🔧 Bootstrapping initial categories, subcategories and products...');

        const sampleCategories = [
            { name: 'Grocery', image: 'https://via.placeholder.com/150?text=Grocery' },
            { name: 'Electronics', image: 'https://via.placeholder.com/150?text=Electronics' },
            { name: 'Home & Kitchen', image: 'https://via.placeholder.com/150?text=Home+Kitchen' },
            { name: 'Beauty & Personal Care', image: 'https://via.placeholder.com/150?text=Beauty' },
            { name: 'Sports & Outdoors', image: 'https://via.placeholder.com/150?text=Sports' }
        ];

        const insertedCats = await CategoryModel.insertMany(sampleCategories);
        const catMap = {};
        insertedCats.forEach(c => { catMap[c.name] = c._id });

        const sampleSubCategories = [
            { name: 'Dairy & Milk', categoryName: 'Grocery' },
            { name: 'Vegetables', categoryName: 'Grocery' },
            { name: 'Fruits', categoryName: 'Grocery' },
            { name: 'Snacks & Beverages', categoryName: 'Grocery' },
            { name: 'Mobiles & Accessories', categoryName: 'Electronics' },
            { name: 'Headphones', categoryName: 'Electronics' },
            { name: 'Cookware', categoryName: 'Home & Kitchen' },
            { name: 'Skincare', categoryName: 'Beauty & Personal Care' }
        ];

        const subDocs = sampleSubCategories.map(s => ({
            name: s.name,
            image: `https://via.placeholder.com/150?text=${encodeURIComponent(s.name)}`,
            category: [ catMap[s.categoryName] ]
        }));

        const insertedSubs = await SubCategoryModel.insertMany(subDocs);
        const subMap = {};
        insertedSubs.forEach(s => { subMap[s.name] = s._id });

        const sampleProducts = [
            { name: 'Amul Milk 1L', category: 'Grocery', subCategory: 'Dairy & Milk', image: ['https://via.placeholder.com/300?text=Amul+Milk'], unit: '1L', price: 65, discount: 5, stock: 100, description: 'Fresh pure milk' },
            { name: 'Paneer 400g', category: 'Grocery', subCategory: 'Dairy & Milk', image: ['https://via.placeholder.com/300?text=Paneer'], unit: '400g', price: 220, discount: 10, stock: 50, description: 'Fresh paneer' },
            { name: 'Tomato 1kg', category: 'Grocery', subCategory: 'Vegetables', image: ['https://via.placeholder.com/300?text=Tomato'], unit: '1kg', price: 35, discount: 5, stock: 200, description: 'Red tomatoes' },
            { name: 'iPhone 14 Case', category: 'Electronics', subCategory: 'Mobiles & Accessories', image: ['https://via.placeholder.com/300?text=iPhone+Case'], unit: 'piece', price: 499, discount: 15, stock: 40, description: 'Protective case' },
            { name: 'Wireless Earbuds', category: 'Electronics', subCategory: 'Headphones', image: ['https://via.placeholder.com/300?text=Earbuds'], unit: 'pair', price: 2499, discount: 25, stock: 50, description: 'Wireless earbuds' },
            { name: 'Non-stick Pan', category: 'Home & Kitchen', subCategory: 'Cookware', image: ['https://via.placeholder.com/300?text=Pan'], unit: 'piece', price: 599, discount: 10, stock: 30, description: 'Non-stick pan' }
        ];

        const prodDocs = sampleProducts.map(p => ({
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
            publish: true
        }));

        const insertedProds = await ProductModel.insertMany(prodDocs);
        console.log(`✅ Bootstrapped: ${insertedCats.length} categories, ${insertedSubs.length} subcategories, ${insertedProds.length} products`);
    } catch (err) {
        console.error('⚠️ Bootstrap failed:', err.message);
    }
}

connectDB().then(async ()=>{
    await bootstrapDataIfNeeded();
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)
    })
})

