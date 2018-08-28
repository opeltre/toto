let express = require('express'),
    path = require('path'),
    {__,vv_,_vv,vv} = require('./vv/vv_back.js'),
    rest = require('./app/rest.js'),
    app = express.Router();

['images', 'fonts', 'style', 'lib']
    .forEach(statique);

let index = 
    (req, res) => res.sendFile(path.join(__dirname, 'index.html'));
let pdf =  
    (req, res) => res.sendFile(path.join(__dirname, 'fs', req.params[0]));

app.get('/', index);

// app.use('/', abc('../fs/', 'cours', 'exos'));
app.get('/pdf/*', pdf);
app.get('/cours*', rest('../fs/cours', '/cours'));

module.exports = app;

function statique (dir) {
    app.use(
        dir.replace(/^\W*/,'/'), 
        express.static(path.join(__dirname, dir))
    );
}

