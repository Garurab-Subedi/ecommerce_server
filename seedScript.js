import dotenv from "dotenv";
import mongoose from "mongoose";
import { Category, Product } from "./src/model/index.js";
import { categories, products } from "./seedData.js";
dotenv.config();


async function seedDatabse(){
    try {
        await mongoose.connect(process.env.MONGO_URL);
        await Product.deleteMany({});
        await Category.deleteMany({});

        const categoryDocs = await Category.insertMany(categories);

        const categoryMap = categoryDocs.reduce((map, category) => {
            map[category.name] = category._id;
            return map;
        }, {});

        const productWithCategoryIds = products.map((product) => ({
            ...product,
            category: categoryMap[product.category],
        }));
        await Product.insertMany(productWithCategoryIds);
        
        
    } catch (error) {
        console.error("Error seeding database:", error);
       
    }
}

seedDatabse();