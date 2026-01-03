export interface PM2Process {
    name: string;
    pm2_env: {
        status: 'online' | 'stopped' | 'errored';
    };
    monit: {
        cpu: number;
        memory: number;
    };
}

export interface CommandConfig {
    id: string;
    name: string;
    cmd: string;
    desc: string;
}

export interface DashboardData {
    pm2_procs: PM2Process[];
    commands: Record<string, CommandConfig>;
    last_out: string;
    port_info: string;
}