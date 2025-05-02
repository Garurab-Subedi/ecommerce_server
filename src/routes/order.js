import {
    confimOrder,
    createOrder,
    getOderById,
    getOrders,
    updateOrder
} from "../controllers/order/order.js"
import { verifyToken } from "../middleware/verifyToken.js"

export const orderRoutes = async (fastify, options) => {
    fastify.addHook("preHandler", async (request, reply) => {
        const isAuthenticated = await verifyToken(request, reply);
        if(!isAuthenticated){
            return reply.code(401).send({ message: "Unauthorized"})
        }
    });

    fastify.post("/order", createOrder);
    fastify.get("/order", getOrders);
    fastify.patch("/order/:orderId/status", updateOrder);
    fastify.post("/order/:orderId/confirm", confimOrder);
    fastify.get("/order/:orderId", getOderById);
}