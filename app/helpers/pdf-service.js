const htmlPdf = require('html-pdf');

const renderPDF = async (html, options) => new Promise((resolve, reject) => {
  htmlPdf.create(html, options).toBuffer((err, buffer) => {
    if (err) {
      reject(err);
    } else {
      resolve(buffer);
    }
  });
});

module.exports = {
  renderPDF,
};
