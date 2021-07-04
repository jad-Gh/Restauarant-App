const verify = require('./verifyToken');
const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/order');

//enable and disable users
router.patch('/handle',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized to enable/disable');

    try{
    const operation = await User.updateOne({email: req.body.email},{$set:{isEnabled: req.body.enableStatus}});
    res.send('operation complete');
    }catch(err){
        res.status(400).send(err);
    }

});

//get all orders
router.get('/orders',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized to enable/disable');
    try{
        const allOrders = await Order.find();
        res.json(allOrders);
    }catch(err){
        res.status(400).send(err);
    }
});

//patch orders by changing status
router.patch('/orderStatus/:orderId',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized to enable/disable');
    try{
        const status = await Order.updateOne({_id:req.params.orderId},{$set:{status:req.body.status}});
        res.send('update good');
    }catch(err){
        res.status(400).send(err);
    }

});


module.exports = router;