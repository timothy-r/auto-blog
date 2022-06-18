'use strict';

const snsWrapper = require('./lib/snsWrapper');
const s3Wrapper = require('./lib/s3Wrapper');

/**
 * process text file objects - render into html
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = snsWrapper.getSnsMessage(event);

    const resultPromise = s3Wrapper.getObjectBodyAsString(inboundMessage.event.bucket.name, inboundMessage.event.object.key);

    resultPromise.then(function(body){
        return renderHTMLFromTXT(inboundMessage.pathName, body)
    }).then(function(message){
        return sendMessage(message)
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function renderHTMLFromTXT(path, body){
    
    return {
        html: '<pre>' + body +  '</pre>',
        type: 'page',
        pathName: path
    }
};

function sendMessage(message) {

    if (! snsWrapper.publish(
        'text.html.generated',
        message,
        process.env.RENDER_TOPIC
    )) {
        console.error("Failed to send message to : " + process.env.RENDER_TOPIC)
    }
};