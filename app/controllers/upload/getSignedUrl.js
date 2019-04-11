const { getSignedUrl } = require('~/helpers/upload-service');

const controller = async (req, res) => {
  const { query } = req;
  const urls = await getSignedUrl(query.fileName);
  return res.status(201).json(urls);
};

module.exports = controller;
