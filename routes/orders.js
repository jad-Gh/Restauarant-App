const verify = require('./verifyToken');
const router = require('express').Router();
const Order = require('../models/order');
const Branch = require('../models/branch');
const User = require('../models/User');
const Item = require('../models/item');



router.post('/',verify,async(req,res)=>{
    try{
        //get all stores and user
        const stores = await Branch.find();
        const user = await User.findById(req.user._id);
        //my target store
        let targetStore = "";

        //search for which store is less than 5 km away
        for (let i=0;i<stores.length;i++){

            var R = 6371; // Radius of the earth in km
            var dLat = (stores[i].latitude - user.latitude)* (Math.PI/180);  // deg2rad below
            var dLon = (stores[i].longitude - user.longitude)* (Math.PI/180); 
            var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos((user.latitude)* (Math.PI/180)) * Math.cos((stores[i].latitude)* (Math.PI/180)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            var d = R * c; // Distance in km

            if (d <= 5 ){
                targetStore = stores[i];
                break;
            }

        }

        const newOrder = new Order({
            owner: user._id,
            Store: targetStore._id
        });

        const status = await newOrder.save();
        const savetoUser = await User.updateOne({_id:req.user._id},{$set:{order:newOrder._id}});

        res.json(newOrder);

    }catch(err){
        res.status(400).send('adding order failed '+ err)
    }
});

//add items to the order and increase price
router.patch('/:itemId',verify,async (req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        const itemClicked = await Item.findById(req.params.itemId);
        let order = await Order.findById(user.order);
        
        let totalPrice = itemClicked.price + order.total;

        const status = await Order.updateOne({_id:user.order},{$set:{total:totalPrice}});
        const status2 = await Order.updateOne({_id:user.order},{$push:{items:[req.params.itemId]}});

        res.send('patch success');

    }catch(err){
        res.status(400).send('patch order failed '+ err)
    }

});

//delete order
router.delete('/:orderId',verify,async (req,res)=>{
    try{
        const orderUsed = await Order.findById(req.params.orderId);

        if (orderUsed.status !== "pending")  return res.status(400).send('cant delete what is not pending');

        const status = await Order.deleteOne({_id:req.params.orderId});
        const status2= await User.updateOne({_id:req.user._id},{$set: {order: " "}});
        res.send('delete successful');
    }catch(err){
        res.status(400).send('delete order failed '+ err)
    }
});

module.exports = router;