const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');

app.use(credentials());
app.use(cors())
app.use(express.json());
app.use(cookieParser());

app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

app.listen(3001, ()=>{
    console.log('server started on port 3001');
});