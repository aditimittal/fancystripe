import React, { Component } from 'react'
import {  injectStripe } from 'react-stripe-elements'
import { Checkbox } from 'antd'
import {loadStripe} from '@stripe/stripe-js';
import {
    CardElement,
    useElements,
    useStripe,
    ElementsConsumer,
    Elements
} from "@stripe/react-stripe-js";

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

class CheckoutForm extends Component {
    constructor( props ) {
        super( props )
        this.state = { complete: false }
        this.submit = this.submit.bind( this )
    }

    async submit( ev ) {
        const { elements, stripe } = this.props
        const cardElement = elements.getElement(CardElement)
        const {error, paymentMethod} = await stripe.createPaymentMethod({
                                                                            type: 'card',
                                                                            card: cardElement,
                                                                        });
        let response = null
        const formName = document.getElementById( 'name' ).value
        // const card = elements.getElement( CardElement )
        // Did the user check the REMEMBER button?
        if ( document.querySelector( '.remember input' ).checked ) {
            // If so, did the user check also the SUBSCRIBE button?
            if ( document.querySelector( '.subscribe input' ).checked ) {
                response = await fetch( '/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: token.id
                } )
            } else {
                // The user wants a ONLY ONCE payment, but he/she wants to be remembered
                response = await fetch( '/chargeAndRemember', {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify( { client: token.id, name: formName } )
                } )
            }
        } else {
            await fetch( '/create-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( { id: paymentMethod.id } )
            } ).then(function ( data ) {
                return data.json()
            } ).then(function ( data ) {
                    fetch( '/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify( { clientSecret: data.clientSecret } )
                    } )
                        .then( function ( data ) {
                            return data.json()
                        } ).then( function ( data ) {
                            console.log( paymentMethod.id )
                            console.log( data.clientSecret )
                            fetch( "/confirm", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify( { "paymentMethod" : paymentMethod.id, "paymentIntent": data.clientSecret } )
                            } ).then( function ( data ) {
                                return data.json()
                            } ).then( function ( data ) {
                                const {paymentIntent, error} = stripe.confirmCardPayment(
                                    data.clientSecret,
                                    {
                                        payment_method: paymentMethod.id
                                    },
                                );
                            } )
                        } )
                } )
        }

        this.setState( { complete: true } )
    }

    onSubscribe() {
        if ( document.querySelector( '.subscribe input' ).checked ) {
            document.querySelector( '.remember input' ).checked = 'checked'
        }
    }

    render() {
        if ( this.state.complete ) return <h1>Purchase Completed!</h1>

        return (
            <div className="checkout">
                <h1>Confirm Payment</h1>
                <input id="name" name="name" type="text" placeholder="Name" required />
                <input id="email" name="email" type="email" placeholder="Email" required />

                <CardElement />
                <div id="billed">
                    <h4>Total billed:</h4>
                    <h4 id="quantity">20€</h4>
                </div>
                <div id="extra-actions">
                    <Checkbox key="remember" className="remember">Remember me</Checkbox>
                    <Checkbox key="subscribe" className="subscribe" onChange={this.onSubscribe}>Subscribe MONTHLY</Checkbox>
                </div>
                <button onClick={this.submit}>Send</button>
            </div>
        )
    }
}
const InjectedCheckoutForm = () => {
    return (
        <ElementsConsumer>
            {({elements, stripe}) => (
                <CheckoutForm elements={elements} stripe={stripe} />
            )}
        </ElementsConsumer>
    );
};

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51IOeZKEEEyvCd8EfTCLGmJaivnDoyrMLBAR0NVgaQWkMINWmbfAcCKo448DxHk6R74SACa0bZ5RRPJ3wSxKBqQn500CIdsvRqx');

const App = () => {
    return (
        <Elements stripe={stripePromise}>
            <InjectedCheckoutForm />
        </Elements>
    );
};
export default injectStripe( App )
