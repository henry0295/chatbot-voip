import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspace/entities/workspace.entity';

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TESTING = 'testing',
}

@Entity('agents')
@Index(['workspace_id', 'name'], { unique: true })
@Index(['workspace_id'])
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  workspace_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  /**
   * Claude model version (e.g., 'claude-3-5-sonnet-20241022')
   */
  @Column({ default: 'claude-3-5-sonnet-20241022' })
  model: string;

  /**
   * System prompt/instructions for the agent
   */
  @Column({ type: 'text' })
  system_prompt: string;

  /**
   * Temperature parameter for Claude (0-1)
   */
  @Column({ type: 'float', default: 0.7 })
  temperature: number;

  /**
   * Maximum tokens for response
   */
  @Column({ default: 1024 })
  max_tokens: number;

  /**
   * List of enabled tools (JSON format)
   * Example: ['document_search', 'api_call', 'database_query']
   */
  @Column({ type: 'jsonb', default: [] })
  enabled_tools: string[];

  /**
   * Custom settings (JSON format)
   */
  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, unknown>;

  /**
   * Agent status
   */
  @Column({
    type: 'enum',
    enum: AgentStatus,
    default: AgentStatus.ACTIVE,
  })
  status: AgentStatus;

  @ManyToOne(() => Workspace, (workspace) => workspace.agents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
