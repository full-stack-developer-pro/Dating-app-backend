const adminCtr = require('../controllers/adminController')
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



//validateModelFiles
const adminValidator = require('../validateModels/adminModel')



module.exports=(app,validator)=>{    
    app.post("/api/admin/signin",validator.body(adminValidator.loginAdmin), adminCtr.loginAdmin)
    app.put("/api/admin/update",validator.body(adminValidator.updateAdmin),adminCtr.userUpdate)
    app.delete("/api/admin/delete",validator.body(adminValidator.deleteAdmin),adminCtr.adminDelete)
    app.get("/api/admin/getAllUser",adminCtr.getAllUser)
    app.post("/api/admin/changePassword",validator.body(adminValidator.changePassword),adminCtr.changePassword)

    app.post("/api/admin/forgetPassword",validator.body(adminValidator.forgetAdmin),adminCtr.forgetPasswordUsePhone)
    app.post("/api/admin/verifyOtp",validator.body(adminValidator.verifyOtp),adminCtr.verifyOTPNumber)
    app.post("/api/admin/restPassword",validator.body(adminValidator.restPassword),adminCtr.resetPassword)
    app.post("/api/admin/aboutAs",validator.body(adminValidator.about),adminCtr.addAbout)
    app.get("/api/admin/getAboutAs",adminCtr.getAbout)
    app.post("/api/admin/contactAs",validator.body(adminValidator.contact),adminCtr.addContact)
    app.get("/api/admin/getcontactAs",adminCtr.getContact)
    app.post("/api/admin/socialLinks",validator.body(adminValidator.socialLinks),adminCtr.addSocialLink)
    app.get("/api/admin/getSocialLinks",adminCtr.getSocialLink)
    app.post("/api/admin/policy&Privacy",validator.body(adminValidator.policy),adminCtr.addPolicy)
    app.get("/api/admin/getPolicy&Privacy",adminCtr.getPolicy)
    app.post("/api/admin/terms&condition",adminCtr.addTermsAndCondition)
    app.get("/api/admin/getTerms&Condition",adminCtr.getTermsAndCondition)

    app.post('/api/admin/blog',upload.array('images',5),adminCtr.addBlog)
    app.get("/api/admin/getBlog",adminCtr.getblog)
    app.get("/api/admin/getOneBlog/:_id",adminCtr.getOneblog)
    app.get("/api/user/getAllUserByAdmin",adminCtr.getAllUserByAdmin)
    app.get("/api/user/getOneUserByAdmin/:_id",adminCtr.getOneUserByAdmin)



  }
  