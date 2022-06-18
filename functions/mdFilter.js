'use strict';

import {S3} from "@aws-sdk/client-s3";

// const AWS = require('aws-sdk');
// const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const { marked } = require('marked');

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

    var message = snsWrapper.getSnsMessage(event);

    // get s3 object
    var params = {
        Bucket: message.event.bucket.name,
        Key: message.event.object.key
    };

    var object = S3.getObject(params, function(err, response) {
        if (err) {
            console.error(err);
            return callback(null, {});
        } else {
            // console.log(response);
            // render into html
            var body = response.Body + '';
            var html = marked.parse(body);

            snsWrapper.publish(
                'md.html.generated',
                {html: html, type: 'page', pathName: message.pathName},
                process.env.RENDER_TOPIC,
                callback
            );
        }
    });
};