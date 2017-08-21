const Discord = require("discord.js");
const request = require("request");
const fs = require("fs");

// Parse config.json
const config = JSON.parse(fs.readFileSync("config.json"));
const client = new Discord.Client();

const supported_langs = {};

const highlight_js_prefixes = [
	"1c", "abnf", "accesslog", "actionscript", "ada", "apache", "applescript",
	"arduino", "armasm", "asciidoc", "aspectj", "autohotkey", "autoit", "avrasm",
	"awk", "axapta", "bash", "basic", "bnf", "brainfuck", "cal", "capnproto", "ceylon",
	"clean", "clojure-repl", "clojure", "cmake", "coffeescript", "coq", "cos",
	"cpp", "crmsh", "crystal", "cs", "csp", "css", "d", "dart", "delphi", "diff",
	"django", "dns", "dockerfile", "dos", "dsconfig", "dts", "dust", "ebnf",
	"elixir", "elm", "erb", "erlang-repl", "erlang", "excel", "fix", "flix", "fortran",
	"fsharp", "gams", "gauss", "gcode", "gherkin", "glsl", "go", "golo", "gradle", "groovy",
	"haml", "handlebars", "haskell", "haxe", "hsp", "htmlbars", "http", "hy", "inform7",
	"ini", "irpf90", "java", "javascript", "jboss-cli", "json", "julia-repl", "julia",
	"kotlin", "lasso", "ldif", "leaf", "less", "lisp", "livecodeserver", "livescript",
	"llvm", "lsl", "lua", "makefile", "markdown", "mathematica", "matlab", "maxima",
	"mel", "mercury", "mipsasm", "mizar", "mojolicious", "monkey", "moonscript", "n1ql",
	"nginx", "nimrod", "nix", "nsis", "objectivec", "ocaml", "openscad", "oxygene",
	"parser3", "perl", "pf", "php", "pony", "powershell", "processing", "profile",
	"prolog", "protobuf", "puppet", "purebasic", "python", "q", "qml", "r", "rib",
	"roboconf", "routeros", "rsl", "ruby", "ruleslanguage", "rust", "scala", "scheme",
	"scilab", "scss", "shell", "smali", "smalltalk", "sml", "sqf", "sql", "stan", "stata",
	"step21", "stylus", "subunit", "swift", "taggerscript", "tap", "tcl", "tex", "thrift",
	"tp", "twig", "typescript", "vala", "vbnet", "vbscript-html", "vbscript", "verilog",
	"vhdl", "vim", "x86asm", "xl", "xml", "xquery", "yaml", "zephir"
];

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
	console.log(source);
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

String.prototype.escape = function() {
	return this.replace(/```/g, "\\`\\`\\`");
}

function parse_arguments(str) {
	let args = [ `<@${config.discord_id}>` ];

	console.log(str.substr(21));
	const results = /\s+(\w+)?(?:\s+)?```(\w+\n)?([\s\S]+)```/gm.exec(str.substr(21));
	if (typeof results[1] !== "undefined") {
		args.push(results[1]);
		console.log(results[1]);
	} else {
		args.push(results[2].slice(0, -1));
	}
	args.push(results[3]);
	console.log(args);
}

function on_message(message) {
	// Ignore everything from ourself (might allow exploits)
	if (message.author.id == config.discord_id) { return; }

	if (message.content.substr(0, 21) !== `<@${config.discord_id}>`) {
		// It doesn't mention us so we don't care
		return;
	}

	parse_arguments(message.content);

	const args = message.content.split(" ");
	if (args.length < 3) {
		if (args.length == 2) {
			switch (args[1]) {
				case "langs":
				case "languages":
					message.author.send(list_languages());
					return;
				case "source":
					message.channel.send(`<@${message.author.id}>: https://github.com/64/DiscordCompileBot`);
					return;
				default:
			}
			message.channel.send(`<@${message.author.id}>: **Unknown command or missing code block after '${args[1]}'`);
		}
		return;
	}

	// Remove leading spaces
	while (args[1].length == 0) {
		args.splice(1, 1);
	}

	if (args[1].indexOf("\n") < args[1].indexOf("`")) {
		const idx = args[1].indexOf("\n");
		const first_part = args[1].substr(0, idx);
		const second_part = args[1].substr(idx + 1);
		args[1] = first_part;
		args.splice(1, 0, second_part);
	}

	const language_string = args[1];
	const language = is_lang_supported(language_string);

	if (typeof language === "undefined") {
		message.channel.send(`<@${message.author.id}>: **Unrecognised language '${language_string}'**. `
				+ `Type "languages" or "langs" after mentioning me to see a list of supported languages.`);
		return;
	}

	message.channel.send(`<@${message.author.id}>: Compiling ${language.full}...`);

	// Extract the source code
	let source = args.slice(2);

	// Remove the markdown highlighting hint
	if (source[0].substr(0, 3) === "```") {
		for (const idx in highlight_js_prefixes) {
			const hjs_prefix = highlight_js_prefixes[idx];
			if (source[0].substr(3, hjs_prefix.length + 1) === (hjs_prefix + "\n")) {
				source[0] = "```\n" + source[0].substr(4 + hjs_prefix.length);
				break;
			}
		}
	}

	// Escape backticks
	source = source.join(" ").replace(/```/g, "");

	// Now compile it
	compile_hackerrank(source, language, output => {
		if (output.compile_message.length != 0) {
			message.channel.send(`Compiler message: \`\`\`${output.compile_message.escape()}\`\`\``);
		}
		if (output.stdout != null) {
			let stdout = output.stdout[0].escape();
			if (stdout.length == 0) { stdout = "(empty)"; }
			message.channel.send(`**Output (stdout):** \`\`\`${stdout}\`\`\``);
		}
		if (output.stderr != null && output.stderr[0] !== false) {
			let stderr = output.stderr[0].escape();
			if (stderr.length == 0) { stderr = "(empty)"; }
			message.channel.send(`Output (stderr): \`\`\`${stderr}\`\`\``);
		}
	});
}

client.login(config.discord_token);
