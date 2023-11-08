 // profile data.....
 
 const userCtr = require('../controllers/uploadGalleryImages')

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



module.exports = (app,validator) =>{
    app.post('/api/uploadGelleryImages',upload.array('images',9), userCtr.addProfileImages);
    app.get('/api/getGellery/:_id', userCtr.getGalleryImages);
    app.get('/api/getAllGellery', userCtr.getAllGalleryImages);

}

