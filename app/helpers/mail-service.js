const sendgrid = require('@sendgrid/mail');

sendgrid.setApiKey(process.env.SENDGRID_KEY);

function mail(message) {
  const m = message;
  if (process.env.NODE_ENV === 'development') {
    m.to = [{ email: process.env.DEV_MAIL_TO }];
  }
  return sendgrid.send(m);
}

module.exports = {
  mail,
};
