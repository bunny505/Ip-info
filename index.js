const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace with your Telegram bot token
const TOKEN = '8160601521:AAGxh427QXKqcXrIni9HgJQPc9phKoLTris';
const bot = new TelegramBot(TOKEN, {polling: true});

// IP API endpoint
const IP_API_URL = 'http://ip-api.com/json/';

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `🤖 Welcome to IP Info Bot!\n\nSend me any IP address and I'll fetch its details including location, ISP, and more.`);
});

// IP address handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Skip if message is a command
  if (text.startsWith('/')) return;

  // Validate IP address
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(text)) {
    bot.sendMessage(chatId, '❌ Invalid IP address format. Please enter a valid IPv4 address.');
    return;
  }

  try {
    const response = await axios.get(IP_API_URL + text);
    const data = response.data;

    if (data.status === 'fail') {
      bot.sendMessage(chatId, `❌ Failed to fetch details for IP: ${text}\nReason: ${data.message}`);
      return;
    }

    const message = `
🔍 IP Address Details:
  
🌐 IP: ${data.query}
🏠 Country: ${data.country} (${data.countryCode})
🏙️ Region: ${data.regionName} (${data.region})
🏡 City: ${data.city}
📮 ZIP: ${data.zip}
  
📡 ISP: ${data.isp}
🏢 Organization: ${data.org}
  
📍 Location:
Latitude: ${data.lat}
Longitude: ${data.lon}
  
🌐 Timezone: ${data.timezone}
      `;

    // Send location as map if coordinates are available
    if (data.lat && data.lon) {
      bot.sendLocation(chatId, data.lat, data.lon);
    }

    bot.sendMessage(chatId, message);

  } catch (error) {
    console.error('Error:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching IP details. Please try again later.');
  }
});

console.log('🤖 IP Info Bot is running...');
