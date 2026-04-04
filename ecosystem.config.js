module.exports = {
  apps: [
    {
      name: 'navipass',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'mail-forwarder',
      script: 'scripts/mail-forwarder.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
