import { MigrationInterface, QueryRunner } from "typeorm";

export class UsuariosMensajes1729466732841 implements MigrationInterface {
    name = 'UsuariosMensajes1729466732841'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mensajes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`emisorId\` int NOT NULL, \`receptorId\` int NOT NULL, \`texto\` varchar(255) NOT NULL, \`fecha\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mensajes\` ADD CONSTRAINT \`FK_7f2f312afe38e90b7569c57b410\` FOREIGN KEY (\`emisorId\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mensajes\` ADD CONSTRAINT \`FK_6057bf3864f9b78a47e1e5c7e0e\` FOREIGN KEY (\`receptorId\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mensajes\` DROP FOREIGN KEY \`FK_6057bf3864f9b78a47e1e5c7e0e\``);
        await queryRunner.query(`ALTER TABLE \`mensajes\` DROP FOREIGN KEY \`FK_7f2f312afe38e90b7569c57b410\``);
        await queryRunner.query(`DROP TABLE \`mensajes\``);
    }

}
