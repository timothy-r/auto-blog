'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var sns = new AWS.SNS({apiVersion: '2010-03-31'});

/**
 * map content types to the filter topic names
 * @type {{image/jpeg: *, image/png: *, image/gif: *}}
 */
const contentTypeTopics = {
    'image/jpeg': process.env.IMAGE_FILTER_TOPIC,
    'image/png': process.env.IMAGE_FILTER_TOPIC,
    'image/gif': process.env.IMAGE_FILTER_TOPIC,
    'text/plain': process.env.TEXT_FILTER_TOPIC,
    'text/markdown': process.env.MD_FILTER_TOPIC
};

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

    var size = event.Records[0].s3.object.size;

    // if size is 0 this is a 'directory' object - ignore this event
    if (size == 0) {
        return callback(null, {});
    }

    var params = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: event.Records[0].s3.object.key
    };

    var object = s3.headObject(params, function(err, response) {

        if (err) {
            console.error(err);
            return callback(null, {});
        }

        // test response['ContentType']
        console.log(response);

        var topic = contentTypeTopics[response['ContentType']];

        if (topic) {

            // post event to the topic
            var message = {
                Subject: 'object.created',
                Message: JSON.stringify(event.Records[0].s3),
                TopicArn: topic
            };

            sns.publish(message, function(err, response) {
               if (err) {
                   console.error(err);
               } else {
                   console.log('Sent: ' + message);
               }
                return callback(null, {});

            });

        } else {
            console.err('Wrong content type: ' + response['ContentType']);
            return callback(null, {});
        }

    });
};