const express = require('express')
const crypto = require("node:crypto");
const { 
    generateRegistrationOptions, 
    verifyRegistrationResponse, 
    generateAuthenticationOptions, 
    verifyAuthenticationResponse 
} = require('@simplewebauthn/server')


if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

const PORT = 3000
const app = express();

app.use(express.static('./public'))
app.use(express.json())

const cors = require('cors');
app.use(cors({ 
  origin: 'http://localhost:3000',
  credentials: true 
}));



//  user details are stored like ids in Userdata field
const userData = {}
const passkeyData = {} // storing userid passkeys


// storing userid passkeys
app.post('/register', (req, res) => {
    const { username, email ,password } = req.body
    const id = `user_${Date.now()}`

    const user = {
        id,
        username,
        email,
        password
    }
    userData[id] = user
    console.log(`User details taken and stored`, userData[id])
    return res.json({ id })

})


// to get passkey from new user 
app.post('/register-challenge', async (req, res) => {
    const { userId } = req.body

    if (!userData[userId]) return res.status(404).json({ error: 'user not found!' })

    const user = userData[userId]

    const passkeyinfo = await generateRegistrationOptions({
        rpID: 'localhost',  // mentioning on what frontend application is running
        rpName: 'My Localhost Machine',
        attestationType: 'none',
        userName: user.username,
        timeout: 30_000,
    })

    passkeyData[userId] = passkeyinfo.challenge
    return res.json({ options: passkeyinfo })
})

app.post('/register-verify', async (req, res) => {
    const { userId, cred }  = req.body
    if (!userData[userId]) return res.status(404).json({ error: 'user not found!' })
    const user = userData[userId]
    const passkey = passkeyData[userId]
    const verificationResult = await verifyRegistrationResponse({
        expectedChallenge: passkey,
        expectedOrigin: 'http://localhost:3000',
        expectedRPID: 'localhost',
        response: cred,
    })

    if (!verificationResult.verified) return res.json({ error: 'could not verify' });
    user.passkey = verificationResult.registrationInfo

    return res.json({ verified: true })

})


// to veryfy existing user 
app.post('/login-challenge', async (req, res) => {
    const { userId } = req.body
    if (!userData[userId]) return res.status(404).json({ error: 'user not found!' })
    
    const opts = await generateAuthenticationOptions({
        rpID: 'localhost',
    })
    passkeyData[userId] = opts.challenge
    return res.json({ options: opts })
})

// Getting user data
app.post('/user', (req, res) => {
    const { userId } = req.body;
    if (!userData[userId]) return res.status(404).json({ error: 'User not found!' });

    return res.json(userData[userId]);
});



app.listen(PORT, () => console.log(`Server started on PORT:${PORT}`))