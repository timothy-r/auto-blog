'use strict';

// const AWS = require('aws-sdk');
// const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const snsWrapper = require('lib/snsWrapper');

/**
 * for each new page generated, ensure an idex page exists within each directory
 * directories & sub-dirs are created by adding / chars in object paths
 * strategy - 
 * a router lambda function (this one) to split object paths into the dirs that need indexes
 * another lambda function that generates an index page for a single directory
 * 
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    const message = snsWrapper.getSnsMessage(event);

    console.log(JSON.stringify(message));

    const directories = message.pathName.split('/')

    // publish multiple messages

    snsWrapper.publish(
        'directory.created',
        {
            event: event,
            dirName: dir
        },
        process.env.DIRECTORY_PAGE_TOPIC,
        callback
    );
};