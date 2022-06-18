'use strict';

const snsWrapper = require('./lib/snsWrapper');

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
    // remove the object / file name
    directories.pop()

    // publish multiple messages
    // for an object at /pages/top/middle/bottom/thing.png
    // publish /pages , /pages/top , /pages/top/middle , /pages/top/middle/bottom

    dirs = []
    current = ''

    for (i = 0; i < directories.length; i++){
        current += '/' + directories[i]
        dirs.append(current)
    }

    console.log(dirs)

    const responsePromise = snsWrapper.publish(
        'directory.created',
        {
            event: event,
            dirName: current
        },
        process.env.DIRECTORY_PAGE_TOPIC
    );

    responsePromise.then(function(result){
        console.log("Sent message")
    }).catch(function(error){
        console.error(error)
    })

    return callback(null, {});
};