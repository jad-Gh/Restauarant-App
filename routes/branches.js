const verify = require('./verifyToken');
const router = require('express').Router();
const Branch = require('../models/branch');


//list all branches
router.get('/',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');
    try{
    const branches = await Branch.find();
    res.json(branches);
    }catch(err){
        res.status(400).send('error retrievig branches ' +err);
    }
});

//add branches
router.post('/',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');
    try{
        let newBranch = new Branch({
            name:req.body.name,
            longitude:req.body.longitude,
            latitude:req.body.latitude,
        });

        const saved = await newBranch.save();
        res.json(newBranch);

    }catch(err){
        res.status(400).send('could not add '+err);
    }
})

//update branch
router.patch('/:id',verify,async(req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');
    try{
        const update = await Branch.updateOne({_id:req.params.id},
            {$set:{
                name:req.body.name,
                longitude:req.body.longitude,
                latitude:req.body.latitude
            }});
        res.send('update successful');

    }catch(err){
        res.status(400).send('could not update '+err);
    }

});

//delete branch
router.delete('/:id',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');
    try{
        const del = await Branch.remove({_id:req.params.id});
        res.send('delete successful');
    }catch(err){
        res.status(400).send('could not delete '+err);
    }

});


module.exports = router;