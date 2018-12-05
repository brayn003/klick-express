const sendgrid = require('@sendgrid/mail');

sendgrid.setApiKey(process.env.SENDGRID_KEY);

function mail(message) {
  if (!process.env.MAIL_SERVICE !== 'on') {
    console.log('[WARNING] Mail service is not turned on');
    return Promise.resolve(true);
  }
  const m = message;
  if (process.env.NODE_ENV === 'development') {
    m.to = [{ email: process.env.DEV_MAIL_TO }];
  }
  return sendgrid.send(m);
}

module.exports = {
  mail,
};
