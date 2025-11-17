import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AdminController } from './admin.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [AdminController],
})
export class AdminModule {}
