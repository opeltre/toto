# Using toto

Toto is a simple [restful][1] server written in javascript -- 
helps host and share information.

```javascript
let toto = require('totojs').server
```


## File system exploration: 

The 'dirs' configuration property takes in a array of 
mount objects.  

Each mount object gives the path to a directory you want to share 
with a url prefix to be used as virtual mountpoint.

```js
let cats = {
    path: '../cats', 
    href: 'cats'
};

toto({dirs: [cats]});

//  -> cat gifs at http://abc.xyz/cats !
```

Files can be: 
- written in:
    * [html][3]
    * [markdown][2]
- boxed in:
    * pdf 
- ... 

TeX code in html or markdown files is rendered by [mathjax][4].

When serving a directory, 
toto will look for a README.md or README.html 
file.

If not found, well, print dirname.

## At the roots:

Different mounts are not connected by toto's navigation tools.
Instead, roots fly you to the index: 
```js
toto({index: 'myCrazyIndex.html'});
```
It is a feature allowing toto's friends to enter your website.

If you love toto and don't need an exit door,
a single mount with an empty prefix will do the trick.
```js
toto({
    dirs: [{path: './root', href: ''}]
});
```

## Static service: 

Toto accepts an array of directories for plain old static service.
Include images in your markdown and sounds to your html for more fun!

```
toto({
    static: ['../../art/ascii', './cat/gifs']
});
```

## Toto's style: 

...Just give toto a theme.

```
toto.server({ 
    theme: 
        'dark'      // ideal for late hours
//        'lunar'     // cold and quiet
//        'light'     // gay and joyful
})

                              ~   <
                            ( 0 + - )
                                U
```

[1]: https://en.wikipedia.org/wiki/Representational_state_transfer 
[2]: http://daringfireball.net/projects/markdown/syntax
[3]: https://developer.mozilla.org/en-US/docs/Web/HTML
[4]: https://www.mathjax.org/

