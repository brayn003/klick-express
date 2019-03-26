const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.AWS_S3_BUCKET;
const expiry = parseInt(process.env.AWS_SIGNED_URL_EXPIRY, 10);
const region = process.env.AWS_S3_REGION;

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region,
});

const getReadUrl = (params) => {
  const {
    region: awsRegion,
    bucket: awsBucket,
    key,
  } = params;
  return `https://s3.${awsRegion}.amazonaws.com/${awsBucket}/${key}`;
};

const getSignedUrl = (fileName) => {
  let key = fileName;
  if (!fileName) {
    key = `api-uploads/${uuidv4()}`;
  }
  const params = {
    ACL: 'public-read',
    Bucket: bucket,
    Key: key,
    Expires: expiry,
  };
  const urls = {
    writeUrl: s3.getSignedUrl('putObject', params),
    readUrl: getReadUrl({ bucket, region, key }),
  };
  return urls;
};

module.exports = {
  getSignedUrl,
};
