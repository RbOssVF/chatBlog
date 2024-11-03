import { MigrationInterface, QueryRunner } from "typeorm";

export class MensajesModificado1730162543672 implements MigrationInterface {
    name = 'MensajesModificado1730162543672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mensajes\` ADD \`vistoPorEmisor\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`mensajes\` ADD \`vistoPorReceptor\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`mensajes\` ADD \`eliminadoPorEmisor\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`mensajes\` ADD \`eliminadoPorReceptor\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mensajes\` DROP COLUMN \`eliminadoPorReceptor\``);
        await queryRunner.query(`ALTER TABLE \`mensajes\` DROP COLUMN \`eliminadoPorEmisor\``);
        await queryRunner.query(`ALTER TABLE \`mensajes\` DROP COLUMN \`vistoPorReceptor\``);
        await queryRunner.query(`ALTER TABLE \`mensajes\` DROP COLUMN \`vistoPorEmisor\``);
    }

}
