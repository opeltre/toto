// pm2 ecosystem configuration

module.exports = {
    apps: [{
        name: 'toto',
        watch: ['./'],
        ignore_watch: ['root'],
        script: 'main.js',
	env: 'development'
    }]
};

