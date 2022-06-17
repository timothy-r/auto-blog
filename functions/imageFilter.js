'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const snsWrapper = require('lib/snsWrapper');

/**
 * process image objects - add to the web bucket in /images, generate a unique file name
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var message = snsWrapper.getSnsMessage(event);
    var elements = message.event.object.key.split('.');
    var newName = "images/" + message.pathName + '.' + elements.pop();

    var params = {
        Bucket: process.env.WEB_BUCKET,
        CopySource: "/" + message.event.bucket.name + "/" + message.event.object.key,
        Key: newName,
        ACL: "public-read"
    };

    // should resize large images down to something smaller

    s3.copyObject(params, function(err, response){

        if (err) {
            console.error(err, err.stack);
            return callback(null, {});
        } else {

            snsWrapper.publish(
                'image.copied',
                {bucket: process.env.WEB_BUCKET, key: newName, pathName: message.pathName},
                process.env.IMAGE_PAGE_TOPIC,
                callback
            );
        }
    });
};

