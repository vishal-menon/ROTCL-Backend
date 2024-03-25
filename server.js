const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsConfig = {
    origin : true,
    credentials : true,
}

app.use(cors(corsConfig))
app.options('*', cors(corsConfig))
app.use(express.json());
app.use(cookieParser());

app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/stats', require('./routes/stats'));
app.use('/pets', require('./routes/pets'))
app.use('/monsters', require('./routes/monsters'))

app.listen(3001, ()=>{
    console.log('server started on port 3001');
});``