const sendgrid = require('@sendgrid/mail');

sendgrid.setApiKey(process.env.SENDGRID_KEY);

function mail(message) {
  return sendgrid.send(message);
}

module.exports = {
  mail,
};
