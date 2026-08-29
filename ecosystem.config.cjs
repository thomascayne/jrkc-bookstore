module.exports = {
  apps: [
    {
      args: 'start --hostname 127.0.0.1 --port 3100',
      autorestart: true,
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '1G',
      name: 'jrkc-bookstore',
      script: 'node_modules/next/dist/bin/next',
      time: true,
    },
    {
      args: 'start --hostname 127.0.0.1 --port 3101',
      autorestart: true,
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '1G',
      name: 'jrkc-bookstore-staging',
      script: 'node_modules/next/dist/bin/next',
      time: true,
    },
  ],
};
