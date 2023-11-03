const paymentController = require('../controllers/paymentController')
const {checkUserAuth} = require("../middleware/auth")


module.exports = (app,validator) =>{
    app.post('/api/payment/create-customer', paymentController.createCustomer);
    app.post('/api/payment/add-card', paymentController.addNewCard);
    app.post('/api/payment/create-charges', paymentController.createCharges);

    //For credit card billing gateway..
    app.post('/api/payment/generate-link', checkUserAuth, paymentController.generateLink);
    app.post('/api/payment/verify-payment', paymentController.verifyPayment);
}