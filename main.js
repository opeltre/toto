let srv = require('express')(),
    app = require('./app');

srv.use('/', app);
srv.listen(80);
