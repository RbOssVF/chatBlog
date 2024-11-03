import { MigrationInterface, QueryRunner } from "typeorm";

export class UsuariosDatosCelular1728958122761 implements MigrationInterface {
    name = 'UsuariosDatosCelular1728958122761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_84751c4682b07e2bc4e5be0b92\` ON \`usuario\``);
        await queryRunner.query(`ALTER TABLE \`datosUsuario\` CHANGE \`celular\` \`celular\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`datosUsuario\` CHANGE \`celular\` \`celular\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_84751c4682b07e2bc4e5be0b92\` ON \`usuario\` (\`datosUsuarioId\`)`);
    }

}
