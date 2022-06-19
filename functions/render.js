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

    const inboundMessage = snsWrapper.getSnsMessage(event);
    console.log(JSON.stringify(inboundMessage));

    const html = renderTemplate(inboundMessage.type, inboundMessage)

    /** don't hard code path to this file */
    var newName = "pages/" + inboundMessage.pathName + '.html';

    var outboundMessage = JSON.parse(JSON.stringify(inboundMessage));
    outboundMessage['targetFile'] = newName;
    outboundMessage['html'] = ''; // clear this now

    // upload the full HTML to the public bucket
    const resultPromise = s3Wrapper.putObject(html, process.env.WEB_BUCKET, newName, 'public-read', "text/html");

    resultPromise.then(function(response){
        // don't publish these events when an index.html file is published
        if ((inboundMessage.fileName != 'index') && (inboundMessage.type == 'page')) {
            return snsWrapper.publish('page.published', outboundMessage, process.env.INDEX_PAGE_TOPIC);
        } else {
            return;
        }
    })
    .catch(function(err){
        console.error(err)
    })

    return callback(null, {});
};

function renderTemplate(type, message) {

    var template = '';
    var vars = {}

    // Compile the template file for this type of page
    switch (type) {
        case 'page':
            template = __dirname + '/web/page.pug';
            vars['content'] = message.html
            break;
        case 'index':
            template = __dirname + '/web/index.pug';
            vars['navItems'] = message.navItems;
            break;
        case 'directory':
            template = __dirname + '/web/directory.pug';
            vars['navItems'] = message.navItems;
            break;
        default:
            throw "Error unknown type: " + type;
    }

    vars['pageTitle'] = message.fileName;

    var compiledFunction = pug.compileFile(template);

    return compiledFunction(vars);
};