const ejs = require('ejs');
const path = require('path');

const viewPath = path.join(__dirname, '../..', 'app/view');

const renderHTML = (filename, data) => {
  const filePath = path.join(viewPath, `${filename}.ejs`);
  return new Promise((resolve, reject) => {
    ejs.renderFile(filePath, data, {}, (err, html) => {
      if (err) reject(err);
      else resolve(html);
    });
  });
};

module.exports = {
  renderHTML,
};
