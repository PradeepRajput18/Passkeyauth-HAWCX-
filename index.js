const express = require('express')
const crypto = require("node:crypto")

if(!globalThis.crypto){
    globalThis.crypto = crypto
}

const {generateAuthenticationOptions} = require('@simplewebauthn/server')

const PORT = 3000

const app = express()



app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));



//  user details are stored like ids in Userdata field
const usersData={}
const passkeyData={}  // storing userid passkeys


app.post('/register', (req, res) => {
    const { username, password } = req.body
    const id = `user_${Date.now()}`

    const user = {
        id,
        username,
        password
    }

    usersData[id] = user

    console.log(`User is been registered and this are the details`, usersData[id])

    return res.json({ id })

})


app.post('/register-passkey',async (req,res)=>{

    const {userId}=req.body

    // check is user is there or not
    if(!usersData[userId]){
        return res.status(400).json({error:"User is not there first register go to signup.html"})
    }

    const user = usersData[userId]

    const passkeyinformation = await generateAuthenticationOptions({
        rpID: 'localhost',  // mentioning on what frontend application is running
        rpName: 'Hawcx challegen auth',
        username:user.username,

    })


    passkeyData[userId]=passkeyinformation.challenge   // hee challenge means data of passkey

    return res.json({options : passkeyinformation})

})






app.listen(PORT , ()=> console.log(`Server is running on the PORT number : ${PORT}`));
