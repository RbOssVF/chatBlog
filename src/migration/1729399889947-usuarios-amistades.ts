import { MigrationInterface, QueryRunner } from "typeorm";

export class UsuariosAmistades1729399889947 implements MigrationInterface {
    name = 'UsuariosAmistades1729399889947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`amistades\` (\`id\` int NOT NULL AUTO_INCREMENT, \`usuarioSolId\` int NOT NULL, \`usuarioRecId\` int NOT NULL, \`estado\` varchar(255) NOT NULL DEFAULT 'pendiente', \`fechaSolicitud\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`fechaConfirmacion\` timestamp NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`fechaCreacion\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`fechaCreacion\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`amistades\` ADD CONSTRAINT \`FK_4f1578e140bca879833a57ce04f\` FOREIGN KEY (\`usuarioSolId\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`amistades\` ADD CONSTRAINT \`FK_18a9b6ee3e1ed67192eac1e0262\` FOREIGN KEY (\`usuarioRecId\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`amistades\` DROP FOREIGN KEY \`FK_18a9b6ee3e1ed67192eac1e0262\``);
        await queryRunner.query(`ALTER TABLE \`amistades\` DROP FOREIGN KEY \`FK_4f1578e140bca879833a57ce04f\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`fechaCreacion\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`fechaCreacion\` datetime NOT NULL`);
        await queryRunner.query(`DROP TABLE \`amistades\``);
    }

}
