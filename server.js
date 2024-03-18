const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json())
app.use(cors());
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));

app.listen(3001, ()=>{
    console.log('server started on port 3001');
});