import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAgentTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'agents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'workspace_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'model',
            type: 'varchar',
            length: '255',
            default: `'claude-3-5-sonnet-20241022'`,
          },
          {
            name: 'system_prompt',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'temperature',
            type: 'float',
            default: 0.7,
          },
          {
            name: 'max_tokens',
            type: 'int',
            default: 1024,
          },
          {
            name: 'enabled_tools',
            type: 'jsonb',
            default: `'[]'`,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: `'{}'`,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'testing'],
            default: `'active'`,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['workspace_id'],
            referencedTableName: 'workspaces',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'agents',
      new TableIndex({
        name: 'IDX_agents_workspace_id',
        columnNames: ['workspace_id'],
      }),
    );

    await queryRunner.createIndex(
      'agents',
      new TableIndex({
        name: 'IDX_agents_workspace_id_name',
        columnNames: ['workspace_id', 'name'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'agents',
      new TableIndex({
        name: 'IDX_agents_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('agents', true);
  }
}
