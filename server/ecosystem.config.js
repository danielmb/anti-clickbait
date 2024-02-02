/**
 * @type {import('pm2').StartOptions}
 */
const options = {
  name: 'server',
  script: 'dist/index.js',
  instances: 4,
  autorestart: true,
  watch: false,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production',
  },
  exec_mode: 'cluster',
};

module.exports = {
  apps: [options],
};
