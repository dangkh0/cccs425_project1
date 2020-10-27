const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get("/sourcecode", (req, res) => {
    res.send(require('fs').readFileSync(__filename).toString())
    })

app.listen(process.env.PORT || 3000)
