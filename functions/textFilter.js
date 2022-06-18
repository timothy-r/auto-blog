'use strict';

// import {S3} from "@aws-sdk/client-s3";

const AWS = require('aws-sdk');
const S3 = new AWS.S3({apiVersion: '2006-03-01'});
const snsWrapper = require('./lib/snsWrapper');

/**
 * process text file objects - render into html
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = snsWrapper.getSnsMessage(event);
    const params = {
        Bucket: inboundMessage.event.bucket.name,
        Key: inboundMessage.event.object.key
    };

    var object = S3.getObject(params, (err, response) => {
        if (err) {
            console.error(err);
        } else {
            
            const outboundMessage = {
                html: '<pre>' + response.Body +  '</pre>',
                type: 'page',
                pathName: inboundMessage.pathName
            }

            if (! snsWrapper.publish(
                'text.html.generated',
                outboundMessage,
                process.env.RENDER_TOPIC
            )) {
                console.error("Failed to send message to : " + process.env.RENDER_TOPIC)
            }
        }

        return callback(null, {})
    });
};

