// pm2 ecosystem configuration

module.exports = {
    apps: [{
        name: 'toto',
        watch: ['./'],
        ignore_watch: ['man'],
        script: 'main.js',
	env: 'development'
    }]
};

