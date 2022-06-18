'use strict';

const snsWrapper = require('./lib/snsWrapper');

/**
 * create html to insert for a page with a single image file
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = snsWrapper.getSnsMessage(event);

    const outboundMessage = {
        html: '<img src="/' + inboundMessage.key +  '" />',
        type: 'page',
        pathName: inboundMessage.pathName
    }

    const responsePromise = snsWrapper.publish(
        'image.html.generated',
        outboundMessage,
        process.env.RENDER_TOPIC
    );

    responsePromise.then(function(result){
        console.log("Sent message")
    }).catch(function(error){
        console.error(error)
    })

    return callback(null, {})
};