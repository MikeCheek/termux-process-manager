import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { TerminalGateway } from './terminal.gateway';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';

@Module({
  imports: [DashboardModule],
  controllers: [AppController, DashboardController],
  providers: [AppService, TerminalGateway, DashboardService],
})
export class AppModule { }
