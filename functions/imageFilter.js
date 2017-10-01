'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const uuidv4 = require('uuid/v4');

/**
 * process image objects - add to the web bucket in /images, generate a unique file name
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var incomingMessage = JSON.parse(event.Records[0].Sns.Message);
    var elements = incomingMessage.object.key.split('.');
    var newName = "images/" + uuidv4() + '.' + elements.pop();

    var params = {
        Bucket: process.env.WEB_BUCKET,
        CopySource: "/" + incomingMessage.bucket.name + "/" + incomingMessage.object.key,
        Key: newName,
        ACL: "public-read"
    };

    // should resize large images down to something smaller

    s3.copyObject(params, function(err, response){

        if (err) {
            console.error(err, err.stack);
            return callback(null, {});
        } else {
            // post event to the topic
            var message = {
                Message: JSON.stringify({
                    Bucket: process.env.WEB_BUCKET,
                    Key: newName
                }),
                TopicArn: process.env.IMAGE_PAGE_TOPIC
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
