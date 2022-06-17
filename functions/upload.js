'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
// const { v4: uuidv4 } = require('uuid');

const snsWrapper = require('lib/snsWrapper');
const contentTypeHandler = require('lib/contentTypeHandler');

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

    const s3Event = event.Records[0].s3;
    const k = s3Event.object.key

    // if size is 0 this is a 'directory' object - ignore these events
    if (s3Event.object.size == 0) {
        return callback(null, {});
    }

    const params = {
        Bucket: s3Event.bucket.name,
        Key: k
    };

    var object = s3.headObject(params, (err, response) => {

        if (err) {
            console.error(err);
            return callback(null, {});
        }
        
        console.log(JSON.stringify(response))

        const pathName = k.substring(0, k.lastIndexOf('.'))
        const ext = k.substring(k.lastIndexOf('.')+1)
        // if content type is binary/octet-stream then use the file extension
        const topic = contentTypeHandler.selectTopic(response['ContentType'], ext);

        if (topic) {
            snsWrapper.publish(
                'object.created',
                {
                    event: s3Event,
                    // use the S3 Object file name to name the rendered output file
                    // uid: uuidv4(),
                    // path and file name without file extension
                    pathName: pathName
                },
                topic,
                callback
            );
        } else {
            console.error('Unhandled content type: ' + response['ContentType']);
            return callback(null, {});
        }

    });
};