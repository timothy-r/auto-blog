'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var sns = new AWS.SNS({apiVersion: '2010-03-31'});
var marked = require('marked');

/**
 * process md file objects - render into html
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));
    return callback(null, {});
    
    // get s3 object
    var params = {
        Bucket: 'event.Records[0].s3.bucket.name',
        Key: 'event.Records[0].s3.object.key'
    };

    var object = s3.getObject(params, function(err, response) {
        if (err) {
            console.error(err);
            return callback(null, {});
        }
        // render into html
        // post event to process.env.HTML_PAGE_TOPIC
    });

    return callback(null, {});

};