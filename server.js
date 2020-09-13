if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

const express = require('express')
const fs = require('fs')
const app = express()


app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static('public')) // public folder contains static files to be server on browser
const stripe = require('stripe')(stripeSecretKey)
PORT = 3000

app.listen(PORT)

app.get('/store', (req, res) => {
    fs.readFile('items.json', (err, data) => {
        if (err)
            return res.status(500).end()

        return res.render('store.ejs', {
            stripePublicKey: stripePublicKey,
            items: JSON.parse(data)
        })
    })


})

// stripe purchase route
app.post('/purchase', (req, res) => {
    fs.readFile('items.json', (err, data) => {
        if (err)
            return res.status(500).end()

        const itemsJson = JSON.parse(data)
        const itemsArray = itemsJson.music.concat(itemsJson.merch)
        let total = 0
        req.body.items.forEach( (item) => {
            const itemJson = itemsArray.find( (i) => {
                return i.id == item.id
            })
            total += itemJson.price * item.quantity
        })
        stripe.charges.create({
            amount: total,
            source: req.body.stripeTokenId,
            currency: 'usd'
        }).then( () => {
            console.log('Charge Successful')
            res.json({message: 'Successfully purchased items'})
        }).catch( (err) => {
            console.log('Charge fail')
            res.status(500).end()
        })
    })


})

console.log(`server running at ${PORT}`)