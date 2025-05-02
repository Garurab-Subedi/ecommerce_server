import 'dotenv/config';
import fastify from 'fastify';
import { PORT } from './src/config/configure.js';
import { connectDB } from './src/config/connect.js';

const start = async () => {
   await connectDB(process.env.MONGO_URI);
   const app = fastify()

   app.listen({port:PORT,host:'0.0.0.0'},(err,addr)=>{
    if(err){
        console.log(err);
    }else{
        console.log(`Ecommerce app running on http://localhost:${PORT}`)
    }
   })
}

start()