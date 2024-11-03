import { MigrationInterface, QueryRunner } from "typeorm";

export class ActualizarUsuario1728443586358 implements MigrationInterface {
    name = 'ActualizarUsuario1728443586358'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`ipUser\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`nombreUsuario\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`nombreUsuario\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`ipUser\``);
    }

}
