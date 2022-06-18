'use strict';

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

/**
 * publish a message to an SNS topic
 * @param subject string
 * @param message JSON
 * @param topic ARN of SNS topic to publish to
 * @param callback cb function
 */
module.exports.publish = (subject, message, topic, callback) => {

    const input = {
        Subject: subject,
        Message: JSON.stringify(message),
        TopicArn: topic
    };

    const config = {}
    const client = new SNSClient(config);
    const command = new PublishCommand(input);

    publishMessage(client, command);
    return callback(null, {});
};

async function publishMessage(client, command){
    try {
        const response = await client.send(command);
        console.log('Sent: ' + JSON.stringify(response));
        return true;

    } catch (err){
        console.error(err);
        return false;

    } finally {
        return false;
    }
}
/**
 * return the message object within an sns event
 *
 * @param event
 */
module.exports.getSnsMessage = (event) => {
    return JSON.parse(event.Records[0].Sns.Message);
};