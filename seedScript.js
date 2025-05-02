import "dotenv/config.js";
import mongoose from "mongoose";
import { Category, Product } from "./src/model/index.js";
import { categories, products } from "./seedData.js";

async function seedDatabse(){
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
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