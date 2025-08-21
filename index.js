<<<<<<< HEAD
=======
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

>>>>>>> 1b2b3379f84a674e59ed5aca82135986a29f16fd
