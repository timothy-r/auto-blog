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
    const resultPromise = s3Wrapper.getObjectBodyAsString(inboundMessage.event.bucket.name, inboundMessage.event.object.key);

    resultPromise.then(function(body){
        return renderHTMLFromMD(inboundMessage.pathName, body)
    }).then(function(message){
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

function renderHTMLFromMD(path, body) {
    // render into html
    return {
        html: marked.parse(body + ''),
        type: 'page',
        pathName: path
    }
};