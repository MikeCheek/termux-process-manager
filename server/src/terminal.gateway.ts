import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { spawn } from 'child_process';
import { DashboardService } from './dashboard/dashboard.service';

@WebSocketGateway({
    cors: { origin: '*' }, // Adjust for your frontend URL
})
export class TerminalGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly dashboardService: DashboardService) { }

    @SubscribeMessage('run-live')
    handleRunCommand(@MessageBody() data: { cid: string }, @ConnectedSocket() client: Socket) {
        const db = this.dashboardService.loadDb();
        const commandConfig = db[data.cid];

        if (!commandConfig) {
            client.emit('cmd-output', `Error: Command ${data.cid} not found.\n`);
            return;
        }

        client.emit('cmd-output', `> Starting: ${commandConfig.name}...\n`);

        // Use spawn for live streaming. 'shell: true' allows complex bash commands.
        const child = spawn(commandConfig.cmd, { shell: true });

        child.stdout.on('data', (chunk) => {
            client.emit('cmd-output', chunk.toString());
        });

        child.stderr.on('data', (chunk) => {
            client.emit('cmd-output', `[ERROR] ${chunk.toString()}`);
        });

        child.on('close', (code) => {
            client.emit('cmd-output', `\n> Process exited with code ${code}\n`);
        });
    }
}