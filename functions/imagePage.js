'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
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

    // "Message": "{\"Bucket\":\"www.trodger.com\",\"Key\":\"images/4346e28f-a2d4-463a-8bf5-f29a49875948.jpg\"}",

    // post event to the topic
    var message = {
        Message: JSON.stringify({
            html: html
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