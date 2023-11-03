const mongoose = require('mongoose');
const uuid = require('uuid');

const paymentsSchema = new mongoose.Schema({
    saleID: {
        type: String
    },
    userId: {
        type: String
    },
    shopID: {
        type: String
    },
    referenceID: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    priceAmount: {
        type: String
    },
    priceCurrency: {
        type: String
    },
    description: {
        type: String
    },
    saleResult: {
        type: String
    }
});

module.exports = mongoose.model('payments', paymentsSchema);

