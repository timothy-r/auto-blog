'use strict';

/**
 * Handle S3 object events
 * Update static web pages in S3
 * Files (text, image) are uploaded to one bucket, pages are stored & served from another bucket
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.uploadObjectHandler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    callback(null, {});

};