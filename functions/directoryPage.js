'use strict';

// const snsWrapper = require('./lib/snsWrapper');

/**
 * create html for a single directory index page
 *
 * @param event
 * @param context
 * @param callback
 */
module.exports.handler = (event, context, callback) => {

    console.log(JSON.stringify(event));

    // const inboundMessage = snsWrapper.getSnsMessage(event);


    return callback(null, {})
};