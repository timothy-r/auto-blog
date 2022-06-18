'use strict';

const pug = require('pug');
const snsWrapper = require('./lib/snsWrapper');
const s3Wrapper = require('./lib/s3Wrapper');

/**
 * render a full html page from a html snippet
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
    const title = message.pathName.substring(message.pathName.lastIndexOf('/')+1)

    var html = compiledFunction({
        pageTitle: title,
        content: message.html
    });

    /** don't hard code path to this file */
    var newName = "pages/" + message.pathName + '.html';

    // upload the full HTML to the public bucket
    const resultPromise = s3Wrapper.putObject(html, process.env.WEB_BUCKET, newName, 'public-read', "text/html");

    resultPromise.then(function(response){
        return sendMessage(newName)
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function sendMessage(params) {

    // implement later
    console.log('Sent: ' + params);
};