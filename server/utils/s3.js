const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Config = {
    region: process.env.AWS_REGION || 'us-east-1'
};

// Check for standard AWS environment variables, custom keys, or fallback to IAM Role credentials on Elastic Beanstalk
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
} else if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    };
}

const s3Client = new S3Client(s3Config);
const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'placementprojectzema';

const uploadBufferToS3 = async (fileBuffer, fileName, mimeType) => {
    // Replace spaces or special characters in the filename
    const sanitizedFileName = fileName.replace(/\s+/g, '_');
    const key = `resumes/${Date.now()}-${sanitizedFileName}`;
    const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType
    };

    await s3Client.send(new PutObjectCommand(params));
    
    // Construct public URL representation
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { url, key };
};

const getPresignedUrl = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key
    };
    const command = new GetObjectCommand(params);
    // Expires in 15 minutes
    return await getSignedUrl(s3Client, command, { expiresIn: 900 });
};

module.exports = {
    s3Client,
    uploadBufferToS3,
    getPresignedUrl
};
