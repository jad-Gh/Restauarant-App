const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/userAccount');
const adminRoute = require('./routes/adminAccount');
const branchRoute = require('./routes/branches');
const categoryRoute = require('./routes/categories&Items');
const orderRoute = require('./routes/orders');

dotenv.config();
const app = express();

//middleware
app.use(cors());
app.use(express.json());
//Routing middleware
app.use('/',authRoute);
app.use('/user',userRoute);
app.use('/admin',adminRoute);
app.use('/branch',branchRoute);
app.use('/category',categoryRoute);
app.use('/order',orderRoute);

//mongoose connection establishement
const url = process.env.MONGOOSE_LINK;
mongoose.connect(url, { useNewUrlParser: true ,useUnifiedTopology:true});
const db = mongoose.connection
db.once('open', _ => {
  console.log('Database connected:', url)
})
db.on('error', err => {
  console.error('connection error:', err)
})


//start listening on port 3000
app.listen(3000,()=>{console.log('Server Running On port 3000')});
