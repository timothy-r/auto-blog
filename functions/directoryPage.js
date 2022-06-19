'use strict';

const s3Wrapper = require('./lib/s3Wrapper');
const snsWrapper = require('./lib/snsWrapper');

/**
 * create html for a single directory index page
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {
    
    const inboundMessage = snsWrapper.getSnsMessage(event);
    // console.log("dir :" + inboundMessage.dirName + " bucket: " + process.env.WEB_BUCKET);

    // list objects in dirName, set vars for rendering
    const responsePromise = s3Wrapper.listObjects(process.env.WEB_BUCKET, inboundMessage.dirName);

    responsePromise.then(function(result){
        // create / update inboundMessage['indexPage']
         return getDirectoryContents(result.Contents, inboundMessage.dirName);

    }).then(function(items) {
        // console.log(JSON.stringify(items));
        var outboundMessage = JSON.parse(JSON.stringify(inboundMessage));
        outboundMessage['navItems'] = items;
        outboundMessage['fileName'] = 'index';
        // remove 'pages/' from dirName
        var path = inboundMessage['dirName'].slice(6);
        outboundMessage['pathName'] = path + 'index';
        outboundMessage['type'] = 'directory';
        console.log(JSON.stringify(outboundMessage));
        return snsWrapper.publish('text.html.generated', outboundMessage, process.env.RENDER_TOPIC);

    }).catch(function(error){
        console.error(error)
    })
    return callback(null, {})
};

// find all objects that begin with dirName 
function getDirectoryContents(contents, dirName){

    var dirLen = dirName.length;
    var len = contents.length;
    var result = [];

    for (var i = 0; i < len; i++){
        const key = contents[i].Key;
        // remove dirName prefix from key
        const path = key.slice(dirLen);
        // split path on './' and keep the first item (if there is one)
        const elements = path.split('/');
        const item = elements.shift();
        // ignore index.html pages and empty items
        if (! (result.includes(item)) && ! (item == 'index.html') && ! (item == '')){
            result.push(item);
        }
    }
    return result;
}