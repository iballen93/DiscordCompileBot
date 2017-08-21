const Discord = require("discord.js");
const request = require("request");
const fs = require("fs");

// Parse config.json
const config = JSON.parse(fs.readFileSync("config.json"));
const client = new Discord.Client();

const supported_langs = {};

// TODO: Handle connection error
client.on("ready", () => {
	console.log("Bot is ready.");
	get_langs();
});

function get_langs() {
	// TODO: Get IDEOne languages
	request.get({
		url: "http://api.hackerrank.com/checker/languages.json",
		form: {
			api_key: config.hackerrank_secret,
		}
	}, function(err, response, body) {
		if (err) throw err;
		const data = JSON.parse(body);
		for (const name in data.languages.names) {
			supported_langs[name] = {
				full: data.languages.names[name],
				hackerrank_id: data.languages.codes[name]
			};
		}

		// Start accepting compile requests
		client.on("message", on_message);
	});
}

function is_lang_supported(potential_language) {
	return supported_langs[potential_language.toLowerCase()];
}

function compile_hackerrank(source, language, cb) {
	request.post({
		url: "http://api.hackerrank.com/checker/submission.json",
		form: {
			source: source,
			lang: language.hackerrank_id,
			api_key: config.hackerrank_secret,
			testcases: JSON.stringify(["ignored"])
		}
	}, function(err, response, body) {
		if (err) throw err;
		const data = JSON.parse(body);
		console.log(data);
		cb({
			stdout: data.result.stdout,
			stderr: data.result.stderr,
			time: data.result.time,
			compile_message: data.result.compilemessage
		});
	})
}

function list_languages() {
	let output = "Supported languages:\n```";
	for (const lang in supported_langs) {
		output += `${supported_langs[lang].full}: ${lang}\n`;
	}
	output += "```";
	return output;
}

function on_message(message) {
	// Ignore everything from ourself (might allow exploits)
	if (message.author.id == config.discord_id) { return; }

	const first_mention = message.mentions.users.first();
	if (typeof first_mention === "undefined" || first_mention.id != config.discord_id) {
		// It doesn't mention us so we don't care
		return;
	}

	const args = message.content.split(" ");
	if (args.length < 3) {
		if (args.length == 2 && args[1] === "langs" || args[1] === "languages") {
			message.author.send(list_languages());
		} else {
			message.channel.send(`<@${message.author.id}>: Please specify a language.`);
		}
		return;
	}

	const language_string = args[1];
	const language = is_lang_supported(language_string);

	if (typeof language === "undefined") {
		message.channel.send(`<@${message.author.id}>: Unrecognised language '${language_string}'.`);
		return;
	}

	// Language is recognised, now compile it
	message.channel.send(`<@${message.author.id}>: Compiling ${language.full}...`);
	compile_hackerrank(args.slice(2).join(" "), language, output => {
		if (output.compile_message.length != 0) {
			message.channel.send(`Compiler message: \`\`\`${output.compile_message}\`\`\``);
		}

		if (output.stdout != null && output.stdout[0].length != 0) {
			message.channel.send(`Output (stdout): \`\`\`${output.stdout[0]}\`\`\``);
		}
		if (output.stderr != null && output.stderr[0].length != 0 && output.stderr[0] !== false) {
			message.channel.send(`Output (stderr): \`\`\`${output.stderr[0]}\`\`\``);
		}
	});
}

client.login(config.discord_token);
