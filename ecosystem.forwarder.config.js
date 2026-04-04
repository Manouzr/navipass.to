module.exports = {
  apps: [
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
