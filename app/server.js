require('dotenv').config();
require('module-alias/register');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes');

const app = express();
const port = process.env.PORT;


function dbConnect() {
  mongoose.set('useCreateIndex', true);
  return mongoose.connect('mongodb://localhost:27017/klickApp', { useNewUrlParser: true });
}

async function main() {
  await dbConnect();

  // application level middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // routes
  app.use('/', routes);

  // app launch
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

main();
