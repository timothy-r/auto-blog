/**
 *
 * @type {{image/jpeg: *, image/png: *, image/gif: *, text/plain: *, text/markdown: *}}
 */
const contentTypeTopics = {
    'image/jpeg': process.env.IMAGE_FILTER_TOPIC,
    'image/png': process.env.IMAGE_FILTER_TOPIC,
    'image/gif': process.env.IMAGE_FILTER_TOPIC,
    'text/plain': process.env.TEXT_FILTER_TOPIC,
    'text/markdown': process.env.MD_FILTER_TOPIC
};

/**
 *
 * @param type
 * @returns the SNS topic ARN to post an event to
 */
module.exports.selectTopic = (type, ext) => {
    if ('binary/octet-stream' == type) {
        switch (ext){
            case 'md':
                type = 'text/markdown';
                break;
        }
    }
    return contentTypeTopics[type];
};