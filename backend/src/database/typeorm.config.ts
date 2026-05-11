import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Workspace } from '../workspace/entities/workspace.entity';
import { WorkspaceMember } from '../workspace/entities/workspace-member.entity';
import { Agent } from '../agent/entities/agent.entity';
import { CreateWorkspaceTables1700000000000 } from './migrations/1700000000000-CreateWorkspaceTables';
import { CreateAgentTable1700000000001 } from './migrations/1700000000001-CreateAgentTable';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'chatbot',
  password: process.env.DB_PASSWORD || 'chatbot',
  database: process.env.DB_NAME || 'omnibot_db',
  entities: [
    Workspace,
    WorkspaceMember,
    Agent,
    // Agregar otras entidades aquí conforme evolucionemos
  ],
  migrations: [
    CreateWorkspaceTables1700000000000,
    CreateAgentTable1700000000001,
  ],
  migrationsRun: true,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  dropSchema: false,
};

