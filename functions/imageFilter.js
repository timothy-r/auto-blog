'use strict';

const s3Wrapper = require('./lib/s3Wrapper');
const snsWrapper = require('./lib/snsWrapper');

/**
 * process image objects - add to the web bucket in /images, generate a unique file name
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = snsWrapper.getSnsMessage(event);
    const elements = inboundMessage.event.object.key.split('.');
    const newName = "images/" + inboundMessage.pathName + '.' + elements.pop();
    const source = "/" + inboundMessage.event.bucket.name + "/" + inboundMessage.event.object.key;
    const acl = "public-read";

    const outboundMessage = {
        bucket: process.env.WEB_BUCKET, 
        key: newName, 
        pathName: inboundMessage.pathName
    }

    // should resize large images down to something smaller
    const resultPromise = s3Wrapper.copyObject(source, process.env.WEB_BUCKET, newName, acl);

    resultPromise.then(function(response){
        return sendMessage(outboundMessage)
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function sendMessage(outboundMessage) {
    if (! snsWrapper.publish(
        'image.copied',
        outboundMessage,
        process.env.IMAGE_PAGE_TOPIC)) 
        {
            console.error("Failed to send message to : " + process.env.IMAGE_PAGE_TOPIC)
        } 
};
