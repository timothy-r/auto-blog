'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
//var sns = new AWS.SNS({apiVersion: '2010-03-31'});
const marked = require('marked');
const snsWrapper = require('lib/snsWrapper');

/**
 * process md file objects - render into html
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var incomingMessage = JSON.parse(event.Records[0].Sns.Message);

    // get s3 object
    var params = {
        Bucket: incomingMessage.event.bucket.name,
        Key: incomingMessage.event.object.key
    };

    var object = s3.getObject(params, function(err, response) {
        if (err) {
            console.error(err);
            return callback(null, {});
        } else {
            console.log(response);
            // render into html
            var body = response.Body + '';
            //console.log(body);
            var html = marked(body);

            snsWrapper.publish(
                'md.html.generated',
                {html: html, type: 'page', uid: incomingMessage.uid},
                process.env.RENDER_TOPIC,
                callback
            );
/*
            // post event to process.env.RENDER_TOPIC
            var message = {
                Subject: 'md.html.generated',
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

            //return callback(null, {});
        }
    });
};