import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import { CommandConfig, PM2Process } from './interfaces';
import { spawn } from 'child_process';

@Injectable()
export class DashboardService {
    private readonly DB_FILE = '../commands_db.json';
    private readonly SERVICES_FILE = '../services.json';
    private readonly logger = new Logger(DashboardService.name);

    private getEnv(key: string, defaultValue: string): string {
        return process.env[key] || defaultValue;
    }
    // --- Port Pinging Logic ---

    async getPortMapping() {
        const serviceMap = JSON.parse(fs.readFileSync(this.SERVICES_FILE, 'utf-8'));
        const pm2List = this.getPm2Data();
        const ip = this.getEnv('HOST_IP', '127.0.0.1');
        const isProd = this.getEnv('NODE_ENV', 'development') === 'production';

        const base_ip = ip.includes(":") ? ip.split(":")[0] : ip

        const results = await Promise.all(
            Object.entries(serviceMap).map(async ([devPort, config]: [string, any]) => {
                // If in prod, prioritize 'prodPort' from JSON, otherwise fallback to devPort
                const port = isProd && config.prodPort ? config.prodPort : devPort;

                const pingResult = await this.pingPort(Number(port), base_ip);
                const isOpen = pingResult !== null;

                const pm2Proc = pm2List.find(p => p.name === config.pm2Name);
                const isPM2Live = pm2Proc?.pm2_env?.status === 'online';

                return {
                    port,
                    name: config.name,
                    pm2Name: config.pm2Name,
                    icon: config.icon,
                    isOpen,
                    isPM2Live,
                    url: `http://${base_ip}:${port}`
                };
            })
        );
        return results;
    }

    private pingPort(port: number, host: string): Promise<string | null> {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            // Use prod env check for timeout
            const isProd = process.env.NODE_ENV === 'production';
            socket.setTimeout(isProd ? 300 : 150);

            socket.on('connect', () => {
                socket.destroy();
                resolve('OPEN');
            });

            const handleFail = () => {
                socket.destroy();
                resolve(null);
            };

            socket.on('timeout', handleFail);
            socket.on('error', handleFail);
            socket.connect(port, host);
        });
    }

    // --- Existing DB & PM2 Logic ---

    loadDb(): Record<string, CommandConfig> {
        if (!fs.existsSync(this.DB_FILE)) return {};
        try {
            const content = fs.readFileSync(this.DB_FILE, 'utf-8');
            return content ? JSON.parse(content) : {};
        } catch (e) { return {}; }
    }

    saveDb(data: Record<string, CommandConfig>) {
        fs.writeFileSync(this.DB_FILE, JSON.stringify(data, null, 4));
    }

    getPm2Data(): PM2Process[] {
        try {
            const res = execSync('pm2 jlist').toString();
            return JSON.parse(res);
        } catch (e) { return []; }
    }

    execute(cmd: string): string {
        try {
            return execSync(cmd).toString();
        } catch (e: any) { return e.message; }
    }

    executeLive(cmd: string, socket: any) {
        const child = spawn(cmd, { shell: true });

        child.stdout.on('data', (data) => {
            // Send each chunk of data to the frontend immediately
            socket.emit('cmd-output', data.toString());
        });

        child.stderr.on('data', (data) => {
            socket.emit('cmd-output', `Error: ${data.toString()}`);
        });

        child.on('close', (code) => {
            socket.emit('cmd-output', `\nProcess finished with code ${code}`);
        });
    }
}