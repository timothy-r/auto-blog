'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({apiVersion: '2006-03-01'});
// import {S3} from "@aws-sdk/client-s3";

const { S3Client, HeadObjectCommand } = require("@aws-sdk/client-s3");

const snsWrapper = require('./lib/snsWrapper');
const contentTypeHandler = require('./lib/contentTypeHandler');

/**
 * Handle S3 object events
 * Update static web pages in S3
 * Files (text, image) are uploaded to one bucket, pages are stored & served from another bucket
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    const inboundMessage = event.Records[0].s3;

    // if size is 0 this is a 'directory' object - ignore these events
    if (inboundMessage.object.size == 0) {
        return callback(null, {});
    }

    // get s3 object
    const params = {
        Bucket: inboundMessage.bucket.name,
        Key: inboundMessage.object.key
    };

    var object = S3.headObject(params, (err, response) => {

        if (err) {
            console.error(err);
            return callback(null, {});
        } 
        
        console.log(JSON.stringify(response))

        const k = inboundMessage.object.key
        const pathName = k.substring(0, k.lastIndexOf('.'))
        const ext = k.substring(k.lastIndexOf('.')+1)
        // if content type is binary/octet-stream then use the file extension
        const topic = contentTypeHandler.selectTopic(response['ContentType'], ext);

        if (topic) {
            const outboundMessage = {
                event: inboundMessage,
                pathName: pathName
            }

            if (! snsWrapper.publish(
                'object.created',
                outboundMessage,
                topic
            )) {
                console.error("Failed to send message to : " + topic)
            }
        } else {
            console.error('Unhandled content type: ' + response['ContentType']);
            
        }

        return callback(null, {});
    });
};