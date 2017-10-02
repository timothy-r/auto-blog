'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const pug = require('pug');

/**
 * render a full html page with a html snippet
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    var message = snsWrapper.getSnsMessage(event);

    var template = '';

    // Compile the source code
    switch (message.type) {
        case 'page':
            template = __dirname + '/web/page.pug';
            break;
        case 'index':
        case 'directory':
        default:
            throw "Error unknown type: " + message.type;
            break;
    }

    var compiledFunction = pug.compileFile(template);

    /**
     * need to provide a page title - S3 object tag name?
     */
    var html = compiledFunction({
        pageTitle: 'Page',
        content: message.html
    });

    var newName = "pages/" + message.uid + '.html';

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

        }
        return callback(null, {});
    });
};