import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkspaceTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla workspaces
    await queryRunner.createTable(
      new Table({
        name: 'workspaces',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'ownerId',
            type: 'uuid',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'logo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_workspace_ownerId',
            columnNames: ['ownerId'],
          },
          {
            name: 'IDX_workspace_isActive',
            columnNames: ['isActive'],
          },
        ],
      }),
    );

    // Crear tabla workspace_members
    await queryRunner.createTable(
      new Table({
        name: 'workspace_members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'workspaceId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['owner', 'admin', 'user'],
            default: "'user'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_member_workspaceId',
            columnNames: ['workspaceId'],
          },
          {
            name: 'IDX_member_userId',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_member_workspace_user',
            columnNames: ['workspaceId', 'userId'],
            isUnique: true,
          },
        ],
      }),
    );

    // Agregar foreign key
    await queryRunner.createForeignKey(
      'workspace_members',
      new TableForeignKey({
        columnNames: ['workspaceId'],
        referencedColumnName: 'id',
        referencedTableName: 'workspaces',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workspace_members', true);
    await queryRunner.dropTable('workspaces');
  }
}
