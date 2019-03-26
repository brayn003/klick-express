const { getSignedUrl } = require('~/helpers/upload-service');
const { transformError } = require('~/helpers/error-handlers');

const controller = async (req, res) => {
  const { query } = req;
  try {
    const urls = await getSignedUrl(query.fileName);
    return res.status(201).json(urls);
  } catch (e) {
    return res.status(400).json(transformError(e));
  }
};

module.exports = controller;
