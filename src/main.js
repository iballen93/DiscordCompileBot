const Discord = require("discord.js");
const IdeOne = require("ideone-npm");
const fs = require("fs");

// Parse config.json
const config = JSON.parse(fs.readFileSync("config.json"));

const compiler = IdeOne(config.ideone_token);
const client = new Discord.Client();

client.on("ready", () => {
	console.log("I am ready!");
});

client.on("message", message => {
	// It wasn't to us
	if (message.mentions.users.first().id != config.discord_id)
		return;
	console.log("Mentioned!");
});

client.login(config.discord_token);
