require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT;

mongoose.connect('mongodb://localhost:27017/klickApp', { useNewUrlParser: true });
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', require('./routes'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
