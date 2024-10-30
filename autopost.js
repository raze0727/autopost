const axios = require('axios');

const config = {
  token: process.env.BOT_TOKEN || '', // Use environment variables for security
  webhook: process.env.WEBHOOK_URL || '',
  channels: [
    {
      id: '1293500969631354941',
      minInterval: 5000,
      maxInterval: 15000,
      message: `
        :alert_purple: LEGACY OLD ACCS [ NOT CIDS ] BY HU STORE :alert_purple:
        :purple_right_arrow: OLD ACCS [ 1-2K DAYS ], 5 :DiamondLock: [ RCN ]
        :purple_right_arrow: OLD ACCS [ 2-4K DAYS ], 5.5 :DiamondLock: [ RCN ]
        :purple_right_arrow: OLD SUPPORTER ACCS [ 2-4K DAYS ], 8 :DiamondLock: [ RCN ]
        :purple_right_arrow: NOT EXPLOITED / CAN BREAK ALL FARMABLES
        :purple_right_arrow: WARRANTY INCLUDED FOR ALL PRODUCTS
        :emoji_7: AUTO SEND BY BOT LINK IN BIO :emoji_7:
      `,
    },
    // Additional channels...
  ],
};

function validateConfig(config) {
  if (!config.token || !config.webhook || !Array.isArray(config.channels)) {
    throw new Error("Invalid configuration. Check token, webhook, and channels.");
  }
}

function setRandomInterval(callback, min, max) {
  function randomDelay() {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function executeCallback() {
    callback();
    setTimeout(executeCallback, randomDelay());
  }

  setTimeout(executeCallback, randomDelay());
}

async function postMessageToChannel(channel) {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://discord.com/api/v9/channels/${channel.id}/messages`,
      headers: {
        Authorization: `Bot ${config.token}`,
        'Content-Type': 'application/json',
      },
      data: { content: channel.message },
    });
    return { success: true, response };
  } catch (error) {
    return { success: false, error };
  }
}

async function handlePostResult(channel, result) {
  const status = result.success ? 'Success' : 'Failed';
  const color = result.success ? 65280 : 16711680;
  const description = `${status} posting message in <#${channel.id}>.`;

  await axios({
    method: 'POST',
    url: config.webhook,
    data: {
      embeds: [
        {
          title: 'AutoPost',
          description,
          color,
          footer: { text: `Channel ID: ${channel.id}` },
        },
      ],
    },
  });
}

async function postToChannel(channel) {
  const result = await postMessageToChannel(channel);
  await handlePostResult(channel, result);
}

async function load() {
  validateConfig(config);

  config.channels.forEach((channel) => {
    setRandomInterval(
      async () => await postToChannel(channel),
      channel.minInterval,
      channel.maxInterval
    );
  });
}

load();
