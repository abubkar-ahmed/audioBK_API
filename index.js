require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConn');
const credintials = require('./middleware/credintials');
const corsOptions = require('./config/corsOptions');
const upload = require('express-fileupload');
const verifyJWT = require('./middleware/verifyJWT') ;
const PORT = process.env.PORT || 3500 ;

connectDB();

app.use(credintials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(cookieParser());

// Routes

app.use(upload());
app.use('/register' , require('./routes/register'));
app.use('/login' , require('./routes/login'));
app.use('/refresh' , require('./routes/refresh'));
app.use('/logout' , require('./routes/logout'));
app.use('/products' , require('./routes/products'));
app.use('/comment' , require('./routes/commnets'));
app.use('/cart' , require('./routes/cart'));
app.use('/purchase' , require('./routes/purchases'));
app.use('/edit-user' , require('./routes/editUser'))


mongoose.connection.once('open' , () => {
    console.log('connect to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})