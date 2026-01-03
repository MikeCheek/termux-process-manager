import { Injectable, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import { CommandConfig, PM2Process } from './interfaces';

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

    async getPortMapping(): Promise<string> {
        const serviceMap = this.loadServiceMap();
        const portsToPing = Object.keys(serviceMap).map(Number);

        // Run pings in parallel for speed
        const results = await Promise.all(
            portsToPing.map((port) => this.pingPort(port, serviceMap[port.toString()]))
        );

        // Filter out nulls (closed ports) and join
        const activePorts = results.filter((r) => r !== null);

        return activePorts.length > 0
            ? activePorts.join('\n')
            : 'No tracked services are currently online.';
    }

    private pingPort(port: number, serviceName: string): Promise<string | null> {
        return new Promise((resolve) => {
            const socket = new net.Socket();

            // 150ms is the sweet spot for local socket pings
            socket.setTimeout(150);

            socket.on('connect', () => {
                socket.destroy();
                resolve(`PORT ${port.toString().padEnd(6)} | STATUS: OPEN | SERVICE: ${serviceName}`);
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
}