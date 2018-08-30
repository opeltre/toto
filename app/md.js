let {__} = require('../dist/vv_back');
let marked = require('marked');

/* 

Lexer :: 
    Str  
    ->  
    { 
        match   : [ Str, Str, Str ] || Null,
        lexer   : Lexer,
        index   : Int
    }

lexer :: 
    { 
        read    : [ Str, Str ],
        write   : [ Str, Str ],
        state   : Bool,
        _name    : Str
    } 
    -> 
    Lexer

*/

function parser (text) {
    
    let inlineMath = lexer()
        ._name('imath')
        .read([ /(\\){1,2}\(/, /(\\){1,2}\)/ ])
        .write([
            '<script type="math/tex">',
            '</script>'
        ])

    let displayMath = lexer()
        ._name('math')
        .read([ /(\\){1,2}\[/, /(\\){1,2}\]/ ])
        .write([
            '<script type="math/tex; mode=display">',
            '</script>'
        ]);

    let lex = [inlineMath, displayMath];

    let MATH = false;
    let INLINE = false;

    return read(text);

    function mark (lexer) {

        let name = 
            lexer._name && lexer._name();

        let strip = [
            INLINE
                ? str => str.replace(/^\s*<p>/, '') 
                : __.id,
            name === 'imath'
                ? str => str.replace(/<\/p>\s*$/, '')
                : __.id
        ];
        __.log(INLINE)
        INLINE = name === 'imath';
        __.log(INLINE)

        return __.pipe(marked, ...strip, __.logs('strip:'));
    }

    function read (str, lexers=lex) {
        
        let matches = lexers
            .map(__.$(str))
            .filter(x => x.match)
            .sort((x,y) => x.index >= y.index);

        if (!matches.length)
            return mark({})(str);

        let {lexer, match} = matches[0];

        let md = MATH ? __.id : mark(lexer);
        MATH = !MATH;

        let before = md(match[0]) + match[1],
            after = match[2],
            lex = matches.map(x => x.lexer);

        return before + read(after, lex);
    }

    function lexer (C) {

        let self = {
                _name : '<lexer>',
                read :  null,
                write : null,
                state : 0,
            };

        Object.assign(self, C || {});

        let lex = __.pipe(
            m => Object.assign(
                self, 
                {state : (self.state + !!m) % 2}
            ),
            lexer
        );

        function my (str) {

            let i = self.state;
            let m = str.match(self.read[i]);

            return {
                match : m && [
                    str.slice(0, m.index), 
                    self.write[i],
                    str.slice(m.index + m[0].length)
                ],
                index : m && m.index,
                lexer : lex(m),
            };
        }

        return __.getset(my, self);
    }

}

module.exports = parser;
