'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var sns = new AWS.SNS({apiVersion: '2010-03-31'});

/**
 * process text file objects - render into html
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var incomingMessage = JSON.parse(event.Records[0].Sns.Message);

    var params = {
        Bucket: incomingMessage.bucket.name,
        Key: incomingMessage.object.key
    };

    var object = s3.getObject(params, (err, response) => {
        if (err) {
            console.error(err);
            return callback(null, {});
        } else {
            var html = '<pre>' + response.Body +  '</pre>';
            // post event to the topic
            var message = {
                Subject: 'text.html.generated',
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
        }
    });
};

