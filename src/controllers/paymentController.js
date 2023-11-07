// const { STRIPE_SECRET_KEY } = process.env;
// const stripe = require('stripe')(STRIPE_SECRET_KEY);
const ccbilling = {
  url : 'https://secure.billing.creditcard',
  shopID : '130332',
  signatureKey : 'a2AQKSFdy6BXAFZpdfYBfyj8hRS7eS',
}

const yaml = require('js-yaml');
const axios = require('axios') 

const paymentModel = require("../models/paymentModel");

// const createCustomer = async (req, res) => {
//   try {
//     const customer = await stripe.customers.create({
//       name: req.body.name,
//       email: req.body.email,
//     });

//     res.status(200).send(customer);
//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// }; 

// const addNewCard = async (req, res) => {
//   try {
//     // Create a card token
//     const cardToken = await stripe.tokens.create({
//       card: {
//         name: req.body.card_Name,
//         number: req.body.card_Number,
//         exp_month: req.body.card_ExpMonth,
//         exp_year: req.body.card_ExpYear,
//         cvc: req.body.card_CVC,
//       },
//     });
//     console.log(cardToken)
//     // Add the card to the customer
//     const card = await stripe.customers.createSource(req.body.customer_Id, {
//       source: cardToken.id,
//     });

//     res.status(200).send({ card: card.id });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: 'Card addition failed' });
//   }
// };

// const createCharges = async (req, res) => {
//   try {
//     // Create a charge
//     const createCharge = await stripe.charges.create({
//       receipt_email: req.body.email,
//       amount: req.body.amount * 100, // Amount in the smallest currency unit
//       currency: 'usd', // Currency code (e.g., 'usd' for US dollars)
//       source: req.body.card_ID, // Card ID for the payment
//     });

//     res.status(200).send(createCharge);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: 'Charge creation failed' });
//   }
// };

const generateLink = async (req, res) => {
  try {

    const { amount, userId} = req.body;
 
    if(userId && amount && amount > 0){

      var allparams = {
        description : 'Credits Payment',
        priceAmount : amount,
        priceCurrency : 'USD',
        referenceID : userId,
        shopID: ccbilling.shopID,
        type: 'purchase',
        version: '3.4'
      }
  
      //make string..
      var stringArr = [ccbilling.signatureKey];
      for (const [key, value] of Object.entries(allparams)) {
        stringArr.push(`${key}=${value}`);
      }
      
      var signature = await makeHash(stringArr.join(':'));
      allparams.signature = signature;
        
      var queryArr = [];
      for (const [key, value] of Object.entries(allparams)) {
        queryArr.push(`${key}=${value}`);
      }
  
      var url = encodeURI(`${ccbilling.url}/startorder?${queryArr.join('&')}`);
  
      res.status(200).send({success: true, message: 'Link generated successfully!', data: {url}});
    
    }else{
      res.status(500).send({success: false, message: 'All parameters are required! (userId|amount)', data: null});
    }

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Generate link failed!' });
  }
};

const verifyPayment = async (req, res) => {
  try {
     
    const { userId, saleId} = req.body;
 
    if(!userId && !saleId){
      res.status(500).send({success: false, message: 'All parameters are required! (userId|saleId)', data: null});
    }

    var allparams = {
      saleID : saleId,
      shopID: ccbilling.shopID,
      version: '3.5',
    }

    //make string..
    var stringArr = [ccbilling.signatureKey];
    for (const [key, value] of Object.entries(allparams)) {
      stringArr.push(`${key}=${value}`);
    }
    
    var signature = await makeHash(stringArr.join(':'));
    allparams.signature = signature;
      
    var queryArr = [];
    for (const [key, value] of Object.entries(allparams)) {
      queryArr.push(`${key}=${value}`);
    }

    var url = encodeURI(`${ccbilling.url}/status/order?${queryArr.join('&')}`);

    await axios.get(url) 
      
      // Show response data 
      .then(async (ress) => {

        const doc = await yaml.load(ress.data);
        if(doc && doc.response && doc.response == 'FOUND' && doc.referenceID && doc.referenceID == userId && doc.saleResult && doc.saleResult == 'APPROVED'){

          //check for sale id already exits or not..
          const existingPayment = await paymentModel.findOne({
            saleID: doc.saleID, 
            shopID: doc.shopID,
          });

          if(existingPayment){
            return res.status(500).json({ success: false, message: 'Payment already linked to another account!', data: null });
          }

          //make new entry..
          const addUPayment = await paymentModel.create({
            saleID: doc.saleID,
            userId: userId,
            shopID: doc.shopID,
            referenceID: doc.referenceID,
            paymentMethod: doc.paymentMethod,
            priceAmount: doc.priceAmount,
            priceCurrency: doc.priceCurrency,
            description: doc.description,
            saleResult: doc.saleResult
          });

          res.status(200).send({ success: true, message: 'Payment verified!', data: addUPayment });

        }else{
          res.status(500).send({ success: false, message: 'Payment not verified!', data: null });
        }
       
      }) 
      .catch(err => {
        res.status(500).send({ error: 'Postback response failed!' });
      })
       
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Postback response failed!' });
  }
};


const makeHash = async (string) => {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

module.exports = {
  // createCustomer,
  // addNewCard,
  // createCharges,
  generateLink,
  verifyPayment
};
