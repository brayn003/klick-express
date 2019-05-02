const { Readable } = require('stream');
const webshot = require('webshot');
const htmlPdf = require('html-pdf');

// returns buffer
const convertToImage = (htmlString, options = {}) => new Promise((resolve, reject) => {
  const stream = webshot(htmlString, {
    streamType: 'jpeg',
    siteType: 'html',
    ...options,
  });
  const readableStream = new Readable().wrap(stream);
  const bufferArr = [];
  readableStream.on('data', (data) => { bufferArr.push(data); });
  readableStream.on('end', () => { resolve(Buffer.concat(bufferArr)); });
  readableStream.on('error', (err) => { reject(err); });
});

const convertToPDF = async (html, options) => new Promise((resolve, reject) => {
  htmlPdf.create(html, options).toBuffer((err, buffer) => {
    if (err) {
      reject(err);
    } else {
      resolve(buffer);
    }
  });
});

module.exports = { convertToImage, convertToPDF };
