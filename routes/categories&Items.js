const verify = require('./verifyToken');
const router = require('express').Router();
const Category = require('../models/category');
const Item = require('../models/item');
const multer = require('multer');
const mongoose = require('mongoose');

//multer file management
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });

//add a category
router.post('/',verify, upload.single('image'), async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');

    try{
        let newCategory = new Category({
            name: req.body.name,
            image: req.file.path,
        });

        const status = newCategory.save();
        res.send('category added successfully');

    }catch(err){
        res.status(400).send('category add failed ' +err);
    }

});

//list all categories
router.get('/', async (req,res)=>{
    try{
        const categoriesFetched = await Category.find();
        res.json(categoriesFetched);
    }catch(err){
        res.status(400).send('category fetching failed ' +err);
    }

});

//edit a category
router.patch('/:categoryId',verify,upload.single('image'),async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');

    try{
        const update = await Category.updateOne({_id:req.params.categoryId},
            {$set:{
                name: req.body.name,
                image:req.file.path,
            }});
        res.send('successful edit');

    }catch(err){
        res.status(400).send('category editing failed ' +err);
    }

});

//delete category
router.delete('/:categoryId',verify,async(req,res)=>{
    try{
        const del = await Category.deleteOne({_id:req.params.categoryId});
        res.send('delete successful');
    }catch(err){
        res.status(400).send('category delete failed ' +err);
    }
});

//add item
router.post('/item',verify,upload.single('image'),async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');

    try{
        const newItem = new Item({
            name:req.body.name,
            price:req.body.price,
            category:req.body.category.toLowerCase(),
            image: req.file.path
        });

        const status = await newItem.save();
        const categoryToAddInto = await Category.updateOne({name: req.body.category.toLowerCase()},{$push:{items:[newItem._id]}});
        res.send('post item success!')
            
     }catch(err){
        res.status(400).send('item post failed ' +err);
    }

});

//edit item
router.patch('/item/:itemId',verify,upload.single('image'),async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');

    try{
        const updateStatus = await Item.updateOne({_id:req.params.itemId},{$set:{
            name:req.body.name,
            price:req.body.price,
            category:req.body.category.toLowerCase(),
            image: req.file.path
        }});
        res.send('successful edit');

    }catch(err){
        res.status(400).send('item edit failed ' +err);
    }
});

//delete item
router.delete('/item/:itemId',verify,async (req,res)=>{
    if (!req.user.isAdmin) return res.status(403).send('you are not authorized');

    try{
        const itemGot = await Item.findOne({_id:req.params.itemId});
        const del = await Item.deleteOne({_id:req.params.itemId});
        const categoryToDeleteFrom = await Category.updateOne({name: itemGot.category},
            {$pullAll:{items:[mongoose.Types.ObjectId(itemGot._id)]}});
        res.send('deleted successfully');

    }catch(err){
        res.status(400).send('item delete failed ' + err);
    }

});

//get items by category filter
router.get('/:categoryId',async (req,res)=>{
    try{
        const categorySelected = await Category.findById(req.params.categoryId);
        const itemsSelected = categorySelected.items;

        let itemsReturned = []

        for (let i=0;i<itemsSelected.length;i++){
            const item = await Item.findById(itemsSelected[i]);
            itemsReturned.push(item);
        }

         res.json(itemsReturned);

    }catch(err){
        res.status(400).send('filter failed ' + err);
    }
});

//pagination for items
router.get('/item',async (req,res)=>{
    try{
        const allItems = await Item.find();
        res.json(allItems)

    }catch(err){
        res.status(400).send('pagination failed ' + err);
    }
});

//search by name for items
router.get('/item/:name',async (req,res)=>{
    try{
        const item = await Item.findOne({name:req.params.name});
        res.json(item);

    }catch(err){
        res.status(400).send('pagination failed ' + err);
    }
});


module.exports = router;