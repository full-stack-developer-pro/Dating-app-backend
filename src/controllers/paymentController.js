const { STRIPE_SECRET_KEY } = process.env;
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const createCustomer = async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      name: req.body.name,
      email: req.body.email,
    });

    res.status(200).send(customer);
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

const addNewCard = async (req, res) => {
  try {
    // Create a card token
    const cardToken = await stripe.tokens.create({
      card: {
        name: req.body.card_Name,
        number: req.body.card_Number,
        exp_month: req.body.card_ExpMonth,
        exp_year: req.body.card_ExpYear,
        cvc: req.body.card_CVC,
      },
    });
    console.log(cardToken)
    // Add the card to the customer
    const card = await stripe.customers.createSource(req.body.customer_Id, {
      source: cardToken.id,
    });

    res.status(200).send({ card: card.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Card addition failed' });
  }
};

const createCharges = async (req, res) => {
  try {
    // Create a charge
    const createCharge = await stripe.charges.create({
      receipt_email: req.body.email,
      amount: req.body.amount * 100, // Amount in the smallest currency unit
      currency: 'usd', // Currency code (e.g., 'usd' for US dollars)
      source: req.body.card_ID, // Card ID for the payment
    });

    res.status(200).send(createCharge);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Charge creation failed' });
  }
};

module.exports = {
  createCustomer,
  addNewCard,
  createCharges,
};
