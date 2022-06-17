'use strict';

const AWS = require('aws-sdk');
const sns = new AWS.SNS({apiVersion: '2010-03-31'});

/**
 * publish a message to an SNS topic
 * @param subject string
 * @param message JSON
 * @param topic ARN of SNS topic to publish to
 * @param callback cb function
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

/**
 * return the message object within an sns event
 *
 * @param event
 */
module.exports.getSnsMessage = (event) => {
    return JSON.parse(event.Records[0].Sns.Message);
};