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

## Examples

Following each example is a small explanation of why it is valid or invalid.

#### The following are **valid**:

    @CompileBot python
    ```
    print 3 * 20
    ```
This applies no syntax highlighting and compiles in python2.

    @CompileBot
    ```python
    print 3 * 20
    ```
You can omit the first language name if it is the same as the name used for syntax highlighting by highlight.js. This is true for a number of languages.

    @CompileBot python3 ```python
    print(3 * 20)
    ```
If the language you want to compile for has a different name than the syntax highlight name, then you need to explicitly provide it as such. This runs python3 code.

#### The following are **invalid**:

    @CompileBot ```
    print 3 * 20
    ```
No language was specified in either possible position, so the bot can't know what language you want to compile for.

    @CompileBot
    ```
    print 3 * 20
    ```
Same as above.

    @CompileBot python3 ```python print 3 * 20```
Highlight.js does not attempt to syntax highlight the code block unless you put a newline immediately after the highlight.js identifier, so this simply results in the code `python print 3 * 20` being passed to the python3 interpreter.

    @CompileBot
    ```python3
    print(3 * 20)
    ```
&nbsp;

This is not valid because python3 isn't a valid `highlight.js` supported language. Use `python` for the syntax highlighting and write `python3` before the backticks, just as shown in the final valid example.

## Add to your server

Go to this link to add the bot to your server (requires administrator permissions): https://discordapp.com/oauth2/authorize?&client_id=349019339913166848&scope=bot&permissions=0

If you're running the bot on your local computer, you need to create and fill the `config.json` file with the correct values.

## Contributing

Feel free to fork, open issues or pull-requests. Feature requests are welcome too. The respository is MIT licensed (see LICENSE.md).
