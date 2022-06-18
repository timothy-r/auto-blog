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
    
    // const elements = inboundMessage.event.object.key.split('.');
    const newName = "images/" + inboundMessage.pathName + '.' + inboundMessage.ext;
    // const source = "/" + inboundMessage.bucket + "/" + inboundMessage.key;
    const acl = "public-read";

    var outboundMessage = JSON.parse(JSON.stringify(inboundMessage));
    outboundMessage['targetFile'] = newName;

    // should resize large images down to something smaller
    const resultPromise = s3Wrapper.copyObject(inboundMessage.source, process.env.WEB_BUCKET, newName, acl);

    resultPromise.then(function(response){
        return snsWrapper.publish(
            'image.copied',
            outboundMessage,
            process.env.IMAGE_PAGE_TOPIC);
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};
