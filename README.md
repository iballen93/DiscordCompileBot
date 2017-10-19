# Discord Compile Bot

## Usage

Issue commands to the bot by pinging it as you would ping any other user:

    @CompileBot language_name
    ```[optional_syntax_highlight_name]
    code
    goes
    here
    ```

Note that you must submit the compilation request in one message - so in this case you would use shift-enter after the first line to insert a line break, but you may also omit the line break too.

A list of languages may be found by sending `@CompileBot languages`; a link to this README can be found with `@CompileBot help`; and a link to this repository can be found with `@CompileBot source`.

Note that if the optional syntax highlight name is not a valid Discord highlight specifier then the bot will take it to be part of the input. Also, the optional syntax highlight name must be followed by a newline or else Discord won't highlight it and the bot will treat it as part of the input too.

## Example

Python3 code snippet (with python syntax highlighting):

    @CompileBot python3 ```python
    print(3 * 4 + 2)
    ```

![Demonstration GIF](https://i.gyazo.com/a3a447603315f0f153fe5bfce36dcc19.gif)

## Add to your server

Go to this link to add the bot to your server (requires administrator permissions): https://discordapp.com/oauth2/authorize?&client_id=349019339913166848&scope=bot&permissions=0

If you're running the bot on your local computer, you need to create and fill the `config.json` file with the correct values.

## Contributing

Feel free to fork, open issues or pull-requests. Feature requests are welcome too. The respository is MIT licensed (see LICENSE.md).
