const express = require('express')
const crypto = require("node:crypto")

if(!globalThis.crypto){
    globalThis.crypto = crypto
}

const {generateAuthenticationOptions,verifyRegistrationResponse , verifyAuthenticationResponse} = require('@simplewebauthn/server')

const PORT = 3000

const app = express()



app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));



//  user details are stored like ids in Userdata field
const usersData={}
const passkeyData={}  // storing userid passkeys

// to take new user details
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

// to get passkey from new user
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
    
    console.log(passkeyinformation);
    
    return res.json({options : passkeyinformation})

})


// to veryfy existing user
app.post('/registeruser-verify', (req, res) => {
    const { userId, cred } = req.body

    if(!usersData[userId]){
        return res.status(400).json({error:"User is not there first register go to signup.html"})
    }

    const user = usersData[userId]
    const passkey = passkeyData[userId]

    const verifyRegistrationResponsedata = verifyAuthenticationResponse({
        // credential: cred,
        expectedChallenge: passkey,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        response:cred,
    })


    if(!verifyRegistrationResponsedata.verified){
        return res.status(400).json({error:"User is not verified bad credentials"})
    }


    // usersData[userId].passkey = verifyRegistrationResponsedata.authenticatorData.attestation.authData.publicKeyJwk
    usersData[userId].passkey = verifyRegistrationResponsedata.regitrationinfo

    return res.json({verified:true})
})





app.listen(PORT , ()=> console.log(`Server is running on the PORT number : ${PORT}`));
