const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json())
app.use(cors());
app.use('/login', require('./routes/players'));

app.listen(3001, ()=>{
    console.log('server started on port 3001');
});