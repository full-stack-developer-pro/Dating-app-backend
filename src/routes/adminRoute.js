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
    app.put("/api/admin/update",validator.body(adminValidator.updateAdmin),adminCtr.adminUpdate)
    app.post("/api/admin/changePassword",validator.body(adminValidator.changePassword),adminCtr.changePassword)

    app.post("/api/admin/forgetPassword",validator.body(adminValidator.forgetAdmin),adminCtr.forgetPasswordUsePhone)
    app.post("/api/admin/verifyOtp",validator.body(adminValidator.verifyOtp),adminCtr.verifyOTPNumber)
    app.post("/api/admin/restPassword",validator.body(adminValidator.restPassword),adminCtr.resetPassword)
    // addAbouts.............................
    app.post("/api/admin/aboutAs",validator.body(adminValidator.about),adminCtr.addAbout)
    app.get("/api/admin/getAboutAs",adminCtr.getAbout)
    // addContacts...............................
    app.post("/api/admin/contactAs",validator.body(adminValidator.contact),adminCtr.addContact)
    app.get("/api/admin/getcontactAs",adminCtr.getContact)
    // addSocialLinks.....................
    app.post("/api/admin/socialLinks",validator.body(adminValidator.socialLinks),adminCtr.addSocialLink)
    app.get("/api/admin/getSocialLinks",adminCtr.getSocialLink)
    // addPolicy..........
    app.post("/api/admin/policy&Privacy",validator.body(adminValidator.policy),adminCtr.addPolicy)
    app.get("/api/admin/getPolicy&Privacy",adminCtr.getPolicy)
    // addTerm...........
    app.post("/api/admin/terms&condition",adminCtr.addTermsAndCondition)
    app.get("/api/admin/getTerms&Condition",adminCtr.getTermsAndCondition)
    // addBlog...........
    app.post('/api/admin/blog',upload.array('images',5),adminCtr.addBlog)
    app.get("/api/admin/getBlog",adminCtr.getblog)
    app.get("/api/admin/getOneBlog/:_id",adminCtr.getOneblog)
    // getUser.........
    app.get("/api/user/getAllUserByAdmin",adminCtr.getAllUserByAdmin)
    app.get("/api/user/getOneUserByAdmin/:_id",adminCtr.getOneUserByAdmin)
    // topBanner........
    app.post('/api/admin/topBanner',upload.array('images',5),adminCtr.addTopBanner)
    app.get("/api/admin/getTopBanner",adminCtr.getTopBanner)
  //  middleBanner...........
    app.post('/api/admin/middleBanner',upload.array('images',5),adminCtr.addMiddleBanner)
    app.get("/api/admin/getMiddleBanner",adminCtr.getMiddleBanner)
    // secondLastMiddle............
    app.post('/api/admin/secondLastBanner',upload.array('images',5),adminCtr.addSecondLastBanner)
    app.get("/api/admin/getsecondLastBanner",adminCtr.getSecondLastBanner)

     // LastMiddle............
     app.post('/api/admin/lastBanner',upload.array('images',5),adminCtr.addLastBanner)
     app.get("/api/admin/geLastBanner",adminCtr.getLastBanner)

    //credits.....................................
    app.post('/api/admin/addcredit',adminCtr.addCredit)
    app.get("/api/admin/getCredit/:_id",adminCtr.getCreditById)
    app.delete("/api/admin/deleteCredit/:_id",adminCtr.deleteCredit)
    app.put("/api/admin/updateCredit/:_id",validator.body(adminValidator.credits),adminCtr.updateCredit)
    app.get("/api/admin/getAllCredit",adminCtr.getAllCredits)


    // profile approve
    
    app.post('/api/admin/approve-profile/:_id',adminCtr.approveProfile)
    app.post('/api/admin/reject-profile/:_id',adminCtr.rejectProfile)

    // images approve
    app.post('/api/admin/approve-images/:_id/:imageId',adminCtr.approveImage)
    app.post('/api/admin/reject-images/:_id/:imageId',adminCtr.rejectImage)


  }
  