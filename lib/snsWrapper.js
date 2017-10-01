'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

/**
 * publish a message to an sns topic
 * @param subject
 * @param message
 * @param topic
 * @param callback
 */
module.exports.publish = (subject, message, topic, callback) => {

    var obj = {
        Subject: subject,
        Message: JSON.stringify(message),
        TopicArn: topic
    };

    sns.publish(obj, function(err, response) {
        if (err) {
            console.error(err);
        } else {
            console.log('Sent: ' + JSON.stringify(obj));
        }
        return callback(null, {});
    });
};