import { MigrationInterface, QueryRunner } from "typeorm";

export class UsuariosRoles1728253647773 implements MigrationInterface {
    name = 'UsuariosRoles1728253647773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`rol\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`usuario\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombres\` varchar(255) NOT NULL, \`apellidos\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`clave\` varchar(255) NOT NULL, \`estado\` tinyint NOT NULL DEFAULT 1, \`fechaCreacion\` datetime NOT NULL, \`rolId\` int NULL, UNIQUE INDEX \`IDX_2863682842e688ca198eb25c12\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_611daf5befc024d9e0bd7bdf4da\` FOREIGN KEY (\`rolId\`) REFERENCES \`rol\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_611daf5befc024d9e0bd7bdf4da\``);
        await queryRunner.query(`DROP INDEX \`IDX_2863682842e688ca198eb25c12\` ON \`usuario\``);
        await queryRunner.query(`DROP TABLE \`usuario\``);
        await queryRunner.query(`DROP TABLE \`rol\``);
    }

}
