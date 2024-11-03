import { MigrationInterface, QueryRunner } from "typeorm";

export class UsuariosAmigos1729400497407 implements MigrationInterface {
    name = 'UsuariosAmigos1729400497407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`amigos\` (\`id\` int NOT NULL AUTO_INCREMENT, \`usuario1Id\` int NOT NULL, \`usuario2Id\` int NOT NULL, \`fechaAmistad\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`amigos\` ADD CONSTRAINT \`FK_2f03fb3dc8d26eaf71028ab77a3\` FOREIGN KEY (\`usuario1Id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`amigos\` ADD CONSTRAINT \`FK_d828290d0d9fa6b1a0ca311db27\` FOREIGN KEY (\`usuario2Id\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`amigos\` DROP FOREIGN KEY \`FK_d828290d0d9fa6b1a0ca311db27\``);
        await queryRunner.query(`ALTER TABLE \`amigos\` DROP FOREIGN KEY \`FK_2f03fb3dc8d26eaf71028ab77a3\``);
        await queryRunner.query(`DROP TABLE \`amigos\``);
    }

}
