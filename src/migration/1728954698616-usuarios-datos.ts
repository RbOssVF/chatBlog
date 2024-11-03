import { MigrationInterface, QueryRunner } from "typeorm";

export class UsuariosDatos1728954698616 implements MigrationInterface {
    name = 'UsuariosDatos1728954698616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`datosUsuario\` (\`id\` int NOT NULL AUTO_INCREMENT, \`celular\` varchar(255) NOT NULL, \`fechaNacimiento\` datetime NULL, \`conectado\` tinyint NOT NULL DEFAULT 1, \`usuarioId\` int NULL, UNIQUE INDEX \`REL_dc034436543f3c600b9441b9f7\` (\`usuarioId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD \`datosUsuarioId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD UNIQUE INDEX \`IDX_84751c4682b07e2bc4e5be0b92\` (\`datosUsuarioId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_84751c4682b07e2bc4e5be0b92\` ON \`usuario\` (\`datosUsuarioId\`)`);
        await queryRunner.query(`ALTER TABLE \`datosUsuario\` ADD CONSTRAINT \`FK_dc034436543f3c600b9441b9f71\` FOREIGN KEY (\`usuarioId\`) REFERENCES \`usuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_84751c4682b07e2bc4e5be0b927\` FOREIGN KEY (\`datosUsuarioId\`) REFERENCES \`datosUsuario\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_84751c4682b07e2bc4e5be0b927\``);
        await queryRunner.query(`ALTER TABLE \`datosUsuario\` DROP FOREIGN KEY \`FK_dc034436543f3c600b9441b9f71\``);
        await queryRunner.query(`DROP INDEX \`REL_84751c4682b07e2bc4e5be0b92\` ON \`usuario\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP INDEX \`IDX_84751c4682b07e2bc4e5be0b92\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP COLUMN \`datosUsuarioId\``);
        await queryRunner.query(`DROP INDEX \`REL_dc034436543f3c600b9441b9f7\` ON \`datosUsuario\``);
        await queryRunner.query(`DROP TABLE \`datosUsuario\``);
    }

}
