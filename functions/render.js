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

    const inboundMessage = snsWrapper.getSnsMessage(event);

    const html = renderTemplate(inboundMessage.type, inboundMessage.pathName, inboundMessage.html, inboundMessage.fileName)

    /** don't hard code path to this file */
    var newName = "pages/" + inboundMessage.pathName + '.html';

    var outboundMessage = JSON.parse(JSON.stringify(inboundMessage));
    outboundMessage['targetFile'] = newName;

    // upload the full HTML to the public bucket
    const resultPromise = s3Wrapper.putObject(html, process.env.WEB_BUCKET, newName, 'public-read', "text/html");

    resultPromise.then(function(response){
        return snsWrapper.publish('page.published', outboundMessage, process.env.INDEX_PAGE_TOPIC);
        // return sendMessage(newName)
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function renderTemplate(type, pathName, html, fileName) {

    var template = '';

    // Compile the source code
    switch (type) {
        case 'page':
            template = __dirname + '/web/page.pug';
            break;
        case 'index':
        case 'directory':
        default:
            throw "Error unknown type: " + type;
            break;
    }

    var compiledFunction = pug.compileFile(template);

    return compiledFunction({
        pageTitle: fileName,
        content: html
    });
};

function sendMessage(params) {

    // implement later
    console.log('Sent: ' + params);
};