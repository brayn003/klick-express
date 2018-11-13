require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT;

mongoose.connect('mongodb://localhost:27017/express-todo', { useNewUrlParser: true });

app.use('/', require('./routes'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));