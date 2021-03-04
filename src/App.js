import React, { Component } from 'react'
import { Elements, StripeProvider } from 'react-stripe-elements'
import CheckoutForm from './CheckoutForm.js'

class App extends Component {
    render() {
        return (
            <StripeProvider apiKey="pk_live_51IOeZKEEEyvCd8EfDKkM4i4Q1y5s1Ez7dyAql2NLCFtfYjG4PBOkDJJxsfOCRgeUb27sQDUr9tbngNXPPmPIW8xO00AJVCb2iK">
                <div className="example">
                    <img src="https://www.donempleo.com/img/logos/95514p.png" id="logo" />
                    <Elements>
                        <CheckoutForm />
                    </Elements>
                </div>
            </StripeProvider>
        )
    }
}

export default App
