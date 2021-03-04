const express = require( 'express' )
const helmet = require( 'helmet' )
const stripe = require( 'stripe' )( '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' )
const _  = require( 'lodash' )
const path = require('path');
const bodyParser = require('body-parser')
// const ejs =require('ejs');
const app = express()
const cors = require( 'cors' )


app.use( helmet() )
app.use( express.static( 'public' ) )
app.use( require( 'body-parser' ).text() )

app.use( cors() )
app.use( express.json() )


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.post( '/chargeAndRemember', async ( req, res ) => {
    try {
        const customer = await stripe.customers.create( {
            source: req.body,
            email: 'juan.perez@ejemplo.com'
        } )

        const { status } = await stripe.charges.create( {
            amount: 2000,
            currency: 'usd',
            description: 'An example charge',
            customer: customer.id
        } )

        res.json( { status } )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).end()
    }
} )

app.post( '/subscribe', async ( req, res ) => {
    try {
        const customer = await stripe.customers.create( {
            source: req.body,
            email: 'juan.perez@ejemplo.com'
        } )

        const plan = await stripe.plans.create( {
            amount: 2000,
            currency: 'usd',
            interval: 'month',
            product: {
                name: 'An example (monthly) subscription'
            }
        } )

        const { status } = await stripe.subscriptions.create( {
            customer: customer.id,
            plan: plan.id
        } )

        res.json( { status } )
    } catch ( err ) {
        console.log( err )
        res.status( 500 ).end()
    }
} )

app.post("/create-customer", async (req, res) => {
    const items  = req.body
    console.log(req.body)
    try {
        const customer = await stripe.customers.create( {
                                                          description: 'My First Test Customer (created for API docs)',
                                                          email: 'juan.perez@ejemplo.com',
                                                          name: 'testUser'
                                                      } )
        const paymentMethod2 = await stripe.paymentMethods.attach(
            items.id,
            { customer: customer.id } )
        res.json( { clientSecret: paymentMethod2.id + '_' + customer.id } )
   } catch ( err ) {
        console.log( err )
        res.status( 500 ).end()
    }
})

app.post("/create-payment-intent", async (req, res) => {
    const paymentMethod  = req.body;
    // Create a PaymentIntent with the order amount and currency
    console.log(req.body);
    console.log(paymentMethod.clientSecret)
    var result = paymentMethod.clientSecret.split('_')
    const paymentIntent = await stripe.paymentIntents.create({
                                                                 amount: 100,
                                                                 currency: "inr",
                                                                 payment_method: result[0]+'_'+result[1],
                                                                customer: result[2]+'_'+result[3]
                                                             });
    res.json({
                 clientSecret: paymentIntent.client_secret
             });
});

app.post("/confirm", async (req, res) => {
    const payment_method = req.body;
    // Create a PaymentIntent with the order amount and currency
    console.log(req.body);
    console.log(payment_method.paymentMethod);
    var result = payment_method.paymentIntent.split('_');
    var payment_intent= result[0]+'_'+result[1];

    const paymentIntent2 = await stripe.paymentIntents.confirm(
        // "pi_1HF19PGz03sGbVedIHyeBeLq",
        payment_intent,
        { payment_method: payment_method.paymentMethod });

    res.json({
                 clientSecret: paymentIntent2.client_secret
             });
})

const port = 8000
app.listen( port, () => {
    console.log( `running at localhost: ${port}` )
} )
