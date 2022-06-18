'use strict';

const { marked } = require('marked');
const snsWrapper = require('./lib/snsWrapper');
const s3Wrapper = require('./lib/s3Wrapper');

/**
 * process md file objects - render into html
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = snsWrapper.getSnsMessage(event);

    // get s3 object
    const resultPromise = s3Wrapper.getObject(inboundMessage.bucket.name, inboundMessage.object.key);

    resultPromise.then(function(result){
        return renderHTMLFromMD(inboundMessage, result.Body)
    }).then(function(message){
        return sendMessage(message)
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function renderHTMLFromMD(inboundMessage, body) {
    // render into html
    return {
        html: marked.parse(body + ''),
        type: 'page',
        pathName: inboundMessage.pathName
    }
};

function sendMessage(message) {

    if (! snsWrapper.publish(
        'md.html.generated',
        message,
        process.env.RENDER_TOPIC
    )) {
        console.error("Failed to send message to : " + process.env.RENDER_TOPIC)
    }
};