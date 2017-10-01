'use strict';

const AWS = require('aws-sdk');
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

    var incomingMessage = JSON.parse(event.Records[0].Sns.Message);

    var html = '<img src="/' + incomingMessage.key +  '" />';

    snsWrapper.publish(
        'image.html.generated',
        {
            html: html,
            type: 'page',
            uid: incomingMessage.uid
        },
        process.env.RENDER_TOPIC,
        callback
    );


/*    // post event to the topic
    var message = {
        Subject: 'image.html.generated',
        Message: JSON.stringify({
            html: html,
            type: 'page',
            uid: incomingMessage.uid
        }),
        TopicArn: process.env.RENDER_TOPIC
    };

    sns.publish(message, function(err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log('Sent: ' + JSON.stringify(message));
        }
        return callback(null, {});

    });*/

};