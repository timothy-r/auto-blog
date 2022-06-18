'use strict';

// import {S3} from "@aws-sdk/client-s3";

const AWS = require('aws-sdk');
const S3 = new AWS.S3({apiVersion: '2006-03-01'});
const { marked } = require('marked');
const snsWrapper = require('./lib/snsWrapper');

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
    const params = {
        Bucket: inboundMessage.event.bucket.name,
        Key: inboundMessage.event.object.key
    };

    var object = S3.getObject(params, function(err, response) {
        if (err) {
            console.error(err);
        } else {
            // render into html
            const outboundMessage = {
                html: marked.parse(response.Body + ''),
                type: 'page',
                pathName: inboundMessage.pathName
            }
        
            if (! snsWrapper.publish(
                'md.html.generated',
                outboundMessage,
                process.env.RENDER_TOPIC
            )) {
                console.error("Failed to send message to : " + process.env.RENDER_TOPIC)
            }
        }
        return callback(null, {})
    });
};