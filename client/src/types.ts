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
    ports_info: {
        port: number,
        pm2Name: string,
        name: string,
        icon: string,
        isOpen: boolean,
        isPM2Live: boolean,
        url: string
    }[];
}