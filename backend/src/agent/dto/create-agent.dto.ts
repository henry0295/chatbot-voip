import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsArray,
  IsObject,
  IsEnum,
} from 'class-validator';
import { AgentStatus } from '../entities/agent.entity';

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  system_prompt: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1)
  temperature?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(4096)
  max_tokens?: number;

  @IsArray()
  @IsOptional()
  enabled_tools?: string[];

  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
