import { Customer, DeliveryPartner } from "../../model/user.js";
import Branch from "../../model/branch.js";
import Order from "../../model/order.js";


export const createOrder = async(req, reply) => {
    try {
        const { userId } = req.user;
        const { items, branch, totalPrice } = req.body;

        const customerData = await Customer.findById(userId);
        const branchData = await Branch.findById(branch);

        if(!customerData){
            return reply.status(404).send({ message: "Customer not found"})
        }

        const newOrder = new Order({
            customer:userId,
            items:items.map((item)=>({
                id:item.id,
                item:item.item,
                count:item.count
            })),
            branch,
            totalPrice,
            deliveryLocation:{
                latitude: customerData.liveLocation.latitude,
                longitude: customerData.liveLocation.longitude,
                address:customerData.address || "No adddress available"
            },
            pickupLocation:{
                latitude: branchData.liveLocation.latitude,
                longitude: branchData.liveLocation.longitude,
                address: branchData.address || "No adddress available"
            },
        });

        const savedOrder = await newOrder.save()
        return reply.status(201).send(savedOrder)

    } catch (error) {
        console.log(error);
        return reply.status(500).send({ message: "Failed to create project", error})
    }
}

export const confimOrder = async(req, reply) =>{
    try {
        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation } = req.body;

        const deliveryperson = await DeliveryPartner.findById(userId);
        if(!deliveryperson){
            return reply.status(404).send({ message: "Delivery persion not found"});
        }
        const order = await Order.findById(orderId);
        if(!order){
            return reply.status(404).send({ message: "Order not found"});
        }
        if(order.status !== "available") {
            return reply.status(400).send({ message: "Order is not available"});
        }

        order.status = "confirmed";

        order.deliveryPartner= userId;
        order.deliveryPersonLocation = {
            latitude: deliveryPersonLocation?.latitude,
            longitude: deliveryPersonLocation?.longitude,
            address: deliveryPersonLocation.address || "",
        }

        req.server.io.to(orderId).emit('orderConfirmed',order);
        await order.save()

        return reply.send(order);

        
    } catch (error) {
        return reply
        .status(500)
        .send({ message: "failed to confirm order", error})
    }
}

export const updateOrder = async(req, reply) => {
    try {

        const { orderId } = req.params;
        const { userId } = req.user;
        const { deliveryPersonLocation, status } = req.body;

        const deliveryperson = await DeliveryPartner.findById(userId);
        if(!deliveryperson){
            return reply.status(404).send({ message: "Delivery persion not found"});
        }
        const order = await Order.findById(orderId);
        if(!order){
            return reply.status(404).send({ message: "Order not found"});
        }

        if(["cancelled", "deliverd"].includes(order.status)){
            return reply.status(400).send({ message: "Order cannot be updates"});
        }

        if(order.deliveryPartner.toString() !== userId){
            return reply.status(403).send({ message: "Unauthorized"});
        }

        order.status = status;
        order.deliveryPersonLocation = deliveryPersonLocation;
        await order.save();

        req.server.io.to(orderId).emit("liveTrackingUpdated", order);

        return reply.send(order);
        
    } catch (error) {
        return reply
        .status(500)
        .send({ message: " Failed to update order status", error})
    }
}

export const getOrders = async(req, reply) => {
    try {
        const { status, customerId, deliveryPartnerId, branchId} = req.query;
        let query={};

        if(status){
            query.status = status;
        }
        if(customerId){
            query.customer = customerId;
        }
        if(deliveryPartnerId){
            query.deliveryPartner = deliveryPartnerId;
        }

        const orders = await Order.find(query).populate(
            "customer branch items.item deliveryPartner"
        );

        return reply.send(orders);
    } catch (error) {
        return reply
        .status(500)
        .message({ message:"Failed to get the order", error});
    }
}

export const getOderById = async(req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate(
            "customer branch items.item deliveryPartner"
        )

        if(!order){
            return reply.status(404).send({ message: "Order not found"})
        }

        return reply.send(order);
    } catch (error) {
        return reply
        .status(500)
        .send({ message: "Failed to retrieve order", error})
    }
}