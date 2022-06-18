'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({apiVersion: '2006-03-01'});
// import {S3} from "@aws-sdk/client-s3";

const snsWrapper = require('./lib/snsWrapper');

/**
 * process image objects - add to the web bucket in /images, generate a unique file name
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = snsWrapper.getSnsMessage(event);
    const elements = inboundMessage.event.object.key.split('.');
    const newName = "images/" + inboundMessage.pathName + '.' + elements.pop();

    const params = {
        Bucket: process.env.WEB_BUCKET,
        CopySource: "/" + inboundMessage.event.bucket.name + "/" + inboundMessage.event.object.key,
        Key: newName,
        ACL: "public-read"
    };

    const outboundMessage = {
        bucket: process.env.WEB_BUCKET, 
        key: newName, 
        pathName: inboundMessage.pathName
    }

    // should resize large images down to something smaller

    S3.copyObject(params, function(err, response){

        if (err) {
            console.error(err, err.stack);
        } else {

            if (! snsWrapper.publish(
                'image.copied',
                outboundMessage,
                process.env.IMAGE_PAGE_TOPIC)) 
                {
                    console.error("Failed to send message to : " + process.env.IMAGE_PAGE_TOPIC)
                }
        }

        return callback(null, {})
    });
};

