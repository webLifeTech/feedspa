const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  	projectId: 'utility-span-279606',
  	keyFilename: './My First Project-6f5d6c442a15.json'
})

exports.init = function(fileName, bucketName) {
	const bucket = storage.bucket(bucketName);
	return bucket.file(fileName)
}

exports.initBucket = function(bucketName) {
	return storage.bucket(bucketName);
}