// pm2 ecosystem configuration

module.exports = {
    apps: [{
        name: 'abc',
        watch: ['./'],
        ignore_watch: [],
        script: 'main.js',
	env: 'development'
    }]
};

