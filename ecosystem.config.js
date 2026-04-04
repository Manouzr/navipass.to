module.exports = {
  apps: [
    {
      name: 'navipass',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'mail-forwarder',
      script: 'scripts/mail-forwarder.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
