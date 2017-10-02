'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const uuidv4 = require('uuid/v4');
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

    // if size is 0 this is a 'directory' object - ignore these events
    if (s3Event.object.size == 0) {
        return callback(null, {});
    }

    var params = {
        Bucket: s3Event.bucket.name,
        Key: s3Event.object.key
    };

    var object = s3.headObject(params, (err, response) => {

        if (err) {
            console.error(err);
            return callback(null, {});
        }

        var topic = contentTypeHandler.selectTopic(response['ContentType']);

        if (topic) {
            snsWrapper.publish(
                'object.created',
                {
                    event: s3Event,
                    uid: uuidv4()
                },
                topic,
                callback
            );
        } else {
            console.err('Unhandled content type: ' + response['ContentType']);
            return callback(null, {});
        }

    });
};