/**
 * Represents a process managed by PM2
 * Based on the 'pm2 jlist' output structure
 */
export interface PM2Process {
    name: string;
    status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored';
    pm2_env: {
        status: 'online' | 'stopping' | 'stopped' | 'launching' | 'errored';
        pm_uptime: number;
        restart_time: number;
    };
    monit: {
        memory: number; // in bytes
        cpu: number;    // percentage
    };
}

/**
 * A saved command configuration in the JSON database
 */
export interface CommandConfig {
    name: string;
    cmd: string;
    desc: string;
}

/**
 * The standard response object for the main dashboard data
 */
export interface DashboardResponse {
    commands: Record<string, CommandConfig>;
    pm2_procs: PM2Process[];
    port_info: string;
    last_out: string;
}

/**
 * Response for actions that return command execution output
 */
export interface ExecutionResult {
    message?: string;
    output: string;
    success: boolean;
}