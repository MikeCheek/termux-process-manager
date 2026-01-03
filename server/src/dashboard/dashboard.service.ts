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

    // --- Service Mapping Logic ---

    private loadServiceMap(): Record<string, string> {
        if (!fs.existsSync(this.SERVICES_FILE)) {
            const defaults = { "3000": "NestJS Backend", "5173": "Vite Frontend" };
            fs.writeFileSync(this.SERVICES_FILE, JSON.stringify(defaults, null, 4));
            return defaults;
        }
        try {
            return JSON.parse(fs.readFileSync(this.SERVICES_FILE, 'utf-8'));
        } catch (e) {
            this.logger.error(`Error loading services.json: ${e}`);
            return {};
        }
    }

    // --- Port Pinging Logic ---

    async getPortMapping() {
        const serviceMap = JSON.parse(fs.readFileSync(this.SERVICES_FILE, 'utf-8'));
        const pm2List = this.getPm2Data();
        const ip = '192.168.1.39';

        const results = await Promise.all(
            Object.entries(serviceMap).map(async ([port, config]: [string, any]) => {
                const isOpen = await this.pingPort(Number(port), config.name);

                // Check if associated PM2 process is actually 'online'
                const pm2Proc = pm2List.find(p => p.name === config.pm2Name);
                const isPM2Live = pm2Proc?.pm2_env?.status === 'online';

                return {
                    port,
                    name: config.name,
                    pm2Name: config.pm2Name,
                    icon: config.icon,
                    isOpen,
                    isPM2Live,
                    url: `http://${ip}:${port}`
                };
            })
        );
        return results;
    }

    private pingPort(port: number, serviceName: string): Promise<string | null> {
        return new Promise((resolve) => {
            const socket = new net.Socket();

            // 150ms is the sweet spot for local socket pings
            socket.setTimeout(150);

            socket.on('connect', () => {
                socket.destroy();
                resolve(`PORT ${port.toString().padEnd(6)} | SERVICE: ${serviceName}`);
            });

            const handleFail = () => {
                socket.destroy();
                resolve(null);
            };

            socket.on('timeout', handleFail);
            socket.on('error', handleFail);

            socket.connect(port, '192.168.1.39');
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