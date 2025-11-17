// src/modules/ticket/dtos/ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { TicketStatusCatalog } from '../types/ticket-status.catalog';
import { ITicket } from '../types/ticket.interface';

export class TicketDTO implements ITicket {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: TicketStatusCatalog, default: TicketStatusCatalog.OPEN })
  @IsEnum(TicketStatusCatalog)
  status: TicketStatusCatalog;

  @ApiProperty()
  @IsUUID()
  ownerId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiProperty()
  @IsDateString()
  createdAt: string;
}
