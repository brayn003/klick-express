require('dotenv').config();
require('module-alias/register');

const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const express = require('express');
const bodyParser = require('body-parser');

function dbConnect() {
  mongoose.set('useCreateIndex', true);
  mongoose.plugin(mongooseDelete, {
    overrideMethods: true,
    deletedAt: true,
  });
  mongoose.plugin((schema) => {
    if (schema.options.userAudits) {
      schema.add({
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
      });
    }
  });
  return mongoose.connect('mongodb://localhost:27017/klickApp', { useNewUrlParser: true });
}

async function main() {
  await dbConnect();

  const app = express();
  const port = process.env.PORT;

  // application level middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // routes
  app.use('/', require('./routes'));

  // app launch
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

main();
