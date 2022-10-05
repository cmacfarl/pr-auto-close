const { Probot } = require('probot');
const autoMeBot = require('./pr-close-bot');


exports.handler = async (event) => {
    let probot = new Probot({
        appId: process.env.APP_ID,
        privateKey: Buffer.from(process.env.PRIVATE_KEY.trim(), 'base64').toString('utf-8'),
        secret: process.env.WEBHOOK_SECRET,
        logLevel: process.env.PROBOT_LOG_LEVEL || 'trace'
    });

    await probot.load(autoMeBot);

    return probot.webhooks.verifyAndReceive({
        id: event.headers['x-github-delivery'],
        name: event.headers['x-github-event'],
        signature: event.headers['x-hub-signature'],
        payload: JSON.parse(event.body)
    });
};