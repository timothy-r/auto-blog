'use strict';

var AWS = require('aws-sdk');
var sns = new AWS.SNS({apiVersion: '2010-03-31'});

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

    var html = '<img src="/' + incomingMessage.Key +  '" />';

    // post event to the topic
    var message = {
        Subject: 'image.html.generated',
        Message: JSON.stringify({
            html: html,
            type: 'page'
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

    });

};