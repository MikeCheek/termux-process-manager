import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { TerminalGateway } from './terminal.gateway';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DashboardModule,
    ConfigModule.forRoot({
      // This logic picks the file based on the NODE_ENV variable
      envFilePath: process.env.NODE_ENV === 'production'
        ? '.env'
        : '.env.development',
      isGlobal: true,
    }),
  ],
  controllers: [AppController, DashboardController],
  providers: [AppService, TerminalGateway, DashboardService],
})
export class AppModule { }
