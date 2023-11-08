//controllerFiles
const userCtr = require('../controllers/userController')

//validateModelFiles
const userModel = require('../validateModels/userModel')

const {checkUserAuth} = require("../middleware/auth")
const auth =require("../services/roleService")

const socketService = require('../services/socketService')

// for images Upload......................................
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  

module.exports=(app,validator)=>{
    app.post("/api/user/signup",upload.single('photo'), userCtr.addUser);//validator.body(userModel.userValidationSchema),
    app.post("/api/user/verifyEmail", userCtr.verifyEmail);
    app.post("/api/user/Login", validator.body(userModel.loginUsers), userCtr.loginUser);
    app.put("/api/user/update/:id", userCtr.updateUser);
    app.get("/api/user/getDetailsById/:id", userCtr.getDetailsById);
    app.delete("/api/user/delete/:_id", userCtr.userDelete);
    app.get("/api/user/getAllFriends/:id", userCtr.getAllFriends);
    app.get("/api/user/memberStatic", userCtr.memberStatic);
    app.get("/api/user/getAllUser",userCtr.getAllUser)

  
    // chat route
  
    app.get("/api/user/getChat" , socketService.getChats );
    app.get("/api/user/chatted" , socketService.getChattedUsers );

   
   }
