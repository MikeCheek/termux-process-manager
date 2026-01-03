module.exports = {
    apps: [
        // 1. NestJS Backend
        {
            name: 'cmd-hub-server',
            cwd: './server',
            script: 'npm',
            args: 'run start:prod', // Runs: node dist/main
            env: {
                NODE_ENV: 'production',
                PORT: 9010 // Ensure this matches your NestJS config
            },
            autorestart: true,
            watch: false,
            max_memory_restart: '1G'
        },

        // 2. Vite Frontend (Static Server)
        {
            name: 'cmd-hub-client',
            cwd: './client',
            // We use PM2's built-in static server to serve the 'dist' folder
            script: 'serve',
            env: {
                PM2_SERVE_PATH: './dist',
                PM2_SERVE_PORT: 5173,
                PM2_SERVE_SPA: 'true', // Essential for React routing
                NODE_ENV: 'production'
            }
        }
    ]
};