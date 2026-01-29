import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionSchedulerService } from './transaction-scheduler.service';
import { Transaction } from '../../entities/transactions.entity';
import { QueuesModule } from '../queue/queues.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Transaction]),
    QueuesModule,
  ],
  providers: [TransactionSchedulerService],
  exports: [TransactionSchedulerService],
})
export class SchedulerModule {}
