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

    resultPromise.then(function(result){
        return sendUploadedMessage(inboundMessage, result)
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function sendUploadedMessage(inboundMessage, objectMetadata) {

    console.log(inboundMessage.bucket.name + '/' + inboundMessage.object.key + " = " + JSON.stringify(objectMetadata))
    
    const k = inboundMessage.object.key
    const pathName = k.substring(0, k.lastIndexOf('.'))
    const ext = k.substring(k.lastIndexOf('.')+1)
    // if content type is binary/octet-stream then use the file extension
    const topic = contentTypeHandler.selectTopic(objectMetadata['ContentType'], ext);

    if (topic) {
        const outboundMessage = {
            event: inboundMessage,
            pathName: pathName
        }

        const result = snsWrapper.publish('object.created', outboundMessage, topic);

        if (! result) {
            console.error("Failed to send message to : " + topic)
        }
    } else {
        console.error('Unhandled content type: ' + objectMetadata['ContentType']);
    }
}