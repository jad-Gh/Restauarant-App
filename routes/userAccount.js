const verify = require('./verifyToken');
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');


//view profile
router.get('/profile',verify,async(req,res)=>{
    const id = req.user._id;

    try{
    const user = await User.findById(id);
    res.json(user);
    }catch (err){
        res.status(400).send(err);
    }

});

//update profile
router.patch('/profile',verify,async(req,res)=>{

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    try{
        const update = await User.updateOne({_id:req.user._id},
            {$set:{
                name:req.body.name,
                password:hashedPassword,
                address:req.body.address,
                longitude:req.body.longitude,
                latitude:req.body.latitude
            }});
            res.send('update complete');
    }catch(err){
        res.status(400).send(err);
    }
});


module.exports = router;