'use strict';

const { S3Client, HeadObjectCommand, GetObjectCommand, CopyObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");

/**
 * return the response from the S3 object head request
 */
module.exports.headObject = async (bucket, key) => {

    const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key
    });
    return executeCommand(command);
};

/**
 * return the object contents
 */
module.exports.getObject = async (bucket, key) => {

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    
    return executeCommand(command)
};

/**
 * Copies source to bucket/key
 * @returns promise 
 */
module.exports.copyObject = async (source, bucket, key, acl) => {

    const command = new CopyObjectCommand({
        CopySource: source,
        Bucket: bucket,
        Key: key,
        ACL: acl
    });
    
    return executeCommand(command)
};

module.exports.putObject = async (body, bucket, key, acl, contentType) => {

    const command = new PutObjectCommand({
        Body: body,
        Bucket: bucket,
        Key: key,
        ACL: acl,
        ContentType: contentType
    })
    return executeCommand(command)
};

async function executeCommand(command){
    
    try { 
        const config = {}
        const client = new S3Client(config);
        const response = await client.send(command);
        return response

    } catch (err){
        return false;
    }
}