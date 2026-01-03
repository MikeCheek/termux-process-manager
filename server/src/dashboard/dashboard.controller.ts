import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('dashboard')
    async getDashboard(@Query('last_out') lastOut?: string) {
        return {
            commands: this.dashboardService.loadDb(),
            pm2_procs: this.dashboardService.getPm2Data(),
            port_info: await this.dashboardService.getPortMapping(),
            last_out: lastOut || 'System Ready.',
        };
    }

    @Post('pm2/:action/:name')
    pm2Action(@Param('action') action: string, @Param('name') name: string) {
        const res = this.dashboardService.execute(`pm2 ${action} ${name}`);
        return { output: res };
    }

    @Post('add')
    addCommand(@Body() body: { name: string; cmd: string; desc?: string }) {
        const db = this.dashboardService.loadDb();
        const cid = body.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        db[cid] = { name: body.name, cmd: body.cmd, desc: body.desc || '' };
        this.dashboardService.saveDb(db);
        return { success: true, cid };
    }

    @Post('run/:cid')
    runCommand(@Param('cid') cid: string) {
        const db = this.dashboardService.loadDb();
        if (db[cid]) {
            const res = this.dashboardService.execute(db[cid].cmd);
            return { message: `Executed ${db[cid].name}`, output: res };
        }
        return { error: 'Command not found' };
    }

    @Post('delete/:cid')
    deleteCommand(@Param('cid') cid: string) {
        const db = this.dashboardService.loadDb();
        if (db[cid]) {
            delete db[cid];
            this.dashboardService.saveDb(db);
        }
        return { success: true };
    }
}