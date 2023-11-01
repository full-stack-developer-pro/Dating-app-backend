require('dotenv').config();
const express=require("express");
var app = express();
var bodyParser = require('body-parser');
const validator = require('express-joi-validation').createValidator({passError:true})
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const initializeSocketServer = require('./src/services/socketService');

const port = process.env.PORT

// multer file
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


//app.set('io', io);

app.use(cors());



const server = http.createServer(app);

const io = require('socket.io')(server, { cors: { origin: '*' } });
app.set('socketio', io);

initializeSocketServer.initializeSocketServer(io);





//connect database......
require('./src/db/dbConnection').connectdb();

//routes
require('./src/routes/userRoute')(app,validator)
require('./src/routes/adminRoute')(app,validator)
require('./src/routes/friendRoute')(app)
require('./src/routes/listRoute')(app,validator)
require('./src/routes/paymentRoute')(app,validator)


app.use((err, req, res, next) => {
    if(err && err.error && err.error.message){
        res.status(400).send({success:false,message:err.error.message})
    }else{
        next()
    }
})
server.listen(port ,() => {
  console.log('Server is listening on Port:', port)
})





