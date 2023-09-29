const express=require("express");
require('dotenv').config();
var app = express();
var bodyParser = require('body-parser');
const validator = require('express-joi-validation').createValidator({passError:true})
const http = require('http');
const server = http.createServer(app);



const port = 3000

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


// Import the socket service and initialize Socket.io
const initializeSocketServer = require('./src/services/socketService');
initializeSocketServer(server);


//connect database......
require('./src/db/dbConnection').connectdb();

//routes
require('./src/routes/userRoute')(app,validator)
require('./src/routes/adminRoute')(app,validator)
require('./src/routes/friendRoute')(app)
require('./src/routes/listRoute')(app,validator)

app.use((err, req, res, next) => {
    if(err && err.error && err.error.message){
        res.status(400).send({sucees:false,message:err.error.message})
    }else{
        next()
    }
})
 app.listen(port ,() => {
  console.log('Server is listening on Port:', port)
})




