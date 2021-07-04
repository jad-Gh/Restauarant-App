let router = require('express').Router();
const {registerValidation,loginValidation} = require('../validation.js');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verify = require('./verifyToken');

//register route
router.post('/register', async (req,res)=>{

    //validate input
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check if already a user
    try{
        let emailExists = await User.findOne({email: req.body.email});
        if (emailExists) return res.status(400).send('Email already Exists')
    }catch(err){
        res.status(400).send(err);
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        address: "",
        longitude: 0,
        latitude: 0,
        order:"",
    });

    try{
        const savedUser = await user.save();
        //assign an accesstoken
        const accesstoken = jwt.sign({_id: user._id,isAdmin: user.isAdmin},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30s'});
        const refreshtoken = jwt.sign({_id: user._id,isAdmin: user.isAdmin},process.env.REFRESH_TOKEN_SECRET);
        refreshtokens.push(refreshtoken);
        res.header('auth-token', accesstoken).send({accesstoken: accesstoken, refreshtoken: refreshtoken});
        
    }catch(err){
        res.status(400).send(err);
    }

});

//stores refresh tokens
let refreshtokens = [];

router.post('/login',async(req,res)=>{
    //validate
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check if email exists
    const user = await User.findOne({email:req.body.email});
    if (!user) return res.status(400).send('Email does not exist');

    const validPass = await bcrypt.compare(req.body.password,user.password);
    if (!validPass) return res.status(400).send('invalid passwrd');

    //check if disabled
    const enabled = user.isEnabled;
    if (!enabled) return res.status(400).send('disabled account');


    //assign an accesstoken
    const accesstoken = jwt.sign({_id: user._id,isAdmin: user.isAdmin},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'});
    const refreshtoken = jwt.sign({_id: user._id,isAdmin: user.isAdmin},process.env.REFRESH_TOKEN_SECRET);
    refreshtokens.push(refreshtoken);
    res.header('auth-token', accesstoken).send({accesstoken: accesstoken, refreshtoken: refreshtoken});
    
});


//uses refresh token to generate new access token
router.post('/gentoken', (req,res)=>{
    const token = req.header('auth-token').split(' ')[1];
    if (!token) return res.status(401).send('access denied');

    if (!refreshtokens.includes(token)) return res.status(403)

    try{
        const verified = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const accesstoken = jwt.sign({_id: verified._id,isAdmin: verified.isAdmin},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30m'});
        res.json(accesstoken);
    }catch (err){
        res.status(400).send('invalid Token');
    }

});

router.delete('/logout', verify,(req,res)=>{
    const token = req.header('auth-token').split(' ')[1];
    if (!token) return res.status(401).send('access denied');
    refreshtokens = [];
    res.status(204).send('I can access delete verified');
});



module.exports = router;