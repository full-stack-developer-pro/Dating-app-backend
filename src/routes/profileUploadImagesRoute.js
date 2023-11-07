const uploadImagesController = require('../controllers/uploadProfileImages');

const {checkUserAuth} = require("../middleware/auth")
const auth = require("../services/roleService")
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


module.exports = (app) =>{
    app.post('/api/profileUploadImages',upload.array('images',5), uploadImagesController.addProfileImages);
  
}
