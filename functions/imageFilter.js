'use strict';

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var sns = new AWS.SNS({apiVersion: '2010-03-31'});

/**
 * process image objects - add to the web bucket in /images, generate a unique file name
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    return callback(null, {});

};