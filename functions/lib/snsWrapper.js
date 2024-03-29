'use strict';

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

/**
 * publish a message to an SNS topic
 * @param subject string
 * @param message JSON
 * @param topic ARN of SNS topic to publish to
 * @param callback cb function
 */
module.exports.publish = async (subject, message, topic) => {

    const input = {
        Subject: subject,
        Message: JSON.stringify(message),
        TopicArn: topic
    };

    const config = {}
    const client = new SNSClient(config);
    const command = new PublishCommand(input);
    try {
        const response = await client.send(command);
        return response;

    } catch (err){
        throw err
    } 

};

/**
 * return the message object within an sns event
 *
 * @param event
 */
module.exports.getSnsMessage = (event) => {
    return JSON.parse(event.Records[0].Sns.Message);
};