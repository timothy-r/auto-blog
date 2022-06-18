'use strict';


// const AWS = require('aws-sdk');
//var sns = new AWS.SNS({apiVersion: '2010-03-31'});
const snsWrapper = require('lib/snsWrapper');


/**
 * create html to insert for a page with a single image file
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var message = snsWrapper.getSnsMessage(event);
    var html = '<img src="/' + message.key +  '" />';

    snsWrapper.publish(
        'image.html.generated',
        {
            html: html,
            type: 'page',
            pathName: message.pathName
        },
        process.env.RENDER_TOPIC,
        callback
    );
};