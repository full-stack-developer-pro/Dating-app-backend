const paymentController = require('../controllers/paymentController')


module.exports = (app,validator) =>{
    app.post('/api/payment/create-customer', paymentController.createCustomer);
    app.post('/api/payment/add-card', paymentController.addNewCard);
    app.post('/api/payment/create-charges', paymentController.createCharges);

}