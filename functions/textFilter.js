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

    const resultPromise = s3Wrapper.getObjectBodyAsString(inboundMessage.bucket, inboundMessage.key);

    resultPromise.then(function(body){
        return renderHTMLFromTXT(body)
    }).then(function(html){
        var message = JSON.parse(JSON.stringify(inboundMessage));
        message['html'] = html
        message['type'] = 'page'

        return snsWrapper.publish(
            'text.html.generated',
            message,
            process.env.RENDER_TOPIC
        );
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function renderHTMLFromTXT(body){
    return '<pre>' + body +  '</pre>';

    // return {
    //     html: '<pre>' + body +  '</pre>',
    //     type: 'page',
    //     pathName: path
    // }
};