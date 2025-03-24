const express = require('express')

const PORT = 3000

const app = express()



app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));



//  user details are stored like ids in Userdata field
const usersData={}


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







app.listen(PORT , ()=> console.log(`Server is running on the PORT number : ${PORT}`));
