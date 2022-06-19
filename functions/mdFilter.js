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
    const resultPromise = s3Wrapper.getObjectBodyAsString(inboundMessage.bucket, inboundMessage.key);

    resultPromise.then(function(body){
        return renderHTMLFromMD(body)
    }).then(function(html){
        // add more attributes to the message
        var message = JSON.parse(JSON.stringify(inboundMessage));
        message['html'] = html
        message['type'] = 'page'
        return snsWrapper.publish(
            'md.html.generated',
            message,
            process.env.RENDER_TOPIC
        );
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function renderHTMLFromMD(body) {

    return marked.parse(body + '');
};