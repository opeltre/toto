let mathjax = id => 
    MathJax.Hub.Queue(
        ['Typeset', MathJax.Hub, id]
    );

document.addEventListener(
    'DOMContentLoaded',
    _ => mathjax('toto-html')
);
