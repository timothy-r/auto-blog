'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const sns = new AWS.SNS({apiVersion: '2010-03-31'});
const pug = require('pug');
const uuidv4 = require('uuid/v4');

/**
 * render a full html page with a html snippet
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var incomingMessage = JSON.parse(event.Records[0].Sns.Message);

    // Compile the source code
    var compiledFunction = pug.compileFile(__dirname + '/web/page.pug');

    /**
     * need to provide a page title - S3 object tag name?
     */
    var html = compiledFunction({
        pageTitle: 'Page',
        content: incomingMessage.html
    });

    var newName = "pages/" + uuidv4() + '.html';
    // upload to S3 object

    var params = {
        Body: html,
        Bucket: process.env.WEB_BUCKET,
        Key: newName,
        ACL: 'public-read',
        ContentType: "text/html"
    };

    var object = s3.putObject(params, (err, response) => {

        if (err) {
            console.error(err);
        } else {
            console.log('Sent: ' + JSON.stringify(params));
            // publish an event for the navigation generation

        }
        return callback(null, {});
    });
};