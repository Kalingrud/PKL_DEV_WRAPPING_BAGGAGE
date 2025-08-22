const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const siswaRoutes = require('./routes/siswa');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use('/api/siswa', siswaRoutes);

app.get('/', (req, res) => {
    res.send('API Siswa berjalan!');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
