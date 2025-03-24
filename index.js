const express = require('express')

const port = 5000

const app = express()



app.use(express.static('./devfiles'))

app.use(express.json())

app.listen(port , ()=> console.log(`Server is running on the port number : ${port}`));
