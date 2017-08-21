const Discord = require("discord.js");
const IdeOne = require("ideone-npm");
const fs = require("fs");

// Parse config.json
const config = JSON.parse(fs.readFileSync("config.json"));

const compiler = IdeOne(config.ideone_token);
const client = new Discord.Client();

const supported_langs = [];

// TODO: Handle connection error
client.on("ready", () => {
	console.log("Bot is ready.");
	get_langs();
});

function get_langs() {
	// HackerEarth lanugages

	// Start accepting compile requests
	client.on("message", on_message);
}

function on_message(message) {
	// It doesn't mention us
	if (message.mentions.users.first().id != config.discord_id)
		return;

	const args = message.content.split(" ");
	const language = args[1];

	if (supported_langs.indexOf(language) == -1) {
		message.channel.send(`<@${message.author.id}>: unrecognised language '${language}'.`);
		return;
	}

	// Language is recognised, now compile it
}

client.login(config.discord_token);
