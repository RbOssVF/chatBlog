import { MigrationInterface, QueryRunner } from "typeorm";

export class PerfilUsuarios1728523814842 implements MigrationInterface {
    name = 'PerfilUsuarios1728523814842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`perfil\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`perfil\``);
    }

}
