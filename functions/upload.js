'use strict';

const s3Wrapper = require('./lib/s3Wrapper');
const snsWrapper = require('./lib/snsWrapper');
const contentTypeHandler = require('./lib/contentTypeHandler');

/**
 * Handle S3 object events
 * Update static web pages in S3
 * Files (text, image) are uploaded to one bucket, pages are stored & served from another bucket
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = event.Records[0].s3;

    // if size is 0 this is a 'directory' object - ignore these events
    if (inboundMessage.object.size == 0) {
        return callback(null, {});
    }

    // get s3 object metadata
    const resultPromise = s3Wrapper.headObject(inboundMessage.bucket.name, inboundMessage.object.key);

    resultPromise.then(function(result) {
        return generateMessage(inboundMessage, result)
    })
    .then(function(message){
        topic = message.topic;
        delete message.topic;
        return snsWrapper.publish('object.created', message, topic);
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

/**
 * Extracts S3 object data fir use by other functions
 * 
 * @param {*} inboundMessage 
 * @param {*} objectMetadata 
 * @returns 
 */
function generateMessage(inboundMessage, objectMetadata) {
    
    const k = inboundMessage.object.key
    const pathName = k.substring(0, k.lastIndexOf('.'))
    const ext = k.substring(k.lastIndexOf('.')+1)
    // if content type is binary/octet-stream then use the file extension
    const topic = contentTypeHandler.selectTopic(objectMetadata['ContentType'], ext);
    const fileName = pathName.substring(pathName.lastIndexOf('/')+1)

    if (topic) {
        
        return {
            source: inboundMessage.bucket.name + "/" + inboundMessage.object.key,
            bucket: inboundMessage.bucket.name,
            // full path, file & extension
            key: inboundMessage.object.key,
            // path & file
            pathName: pathName,
            // just file name, without extension
            fileName: fileName,
            // file extension
            ext: ext,
            // don't set topic
            topic: topic
        }
    } else {
        throw 'Unhandled content type: ' + objectMetadata['ContentType']
    }
}