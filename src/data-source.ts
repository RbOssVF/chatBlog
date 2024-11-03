import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: '192.168.1.50',
  port: 3306,
  username: 'ublogcole',
  password: '19fE6£S1Y@F',
  database: 'blogCole',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['src/migration/*.ts'], // Ruta de las migraciones
  synchronize: false, // Debe ser false en producción para usar migraciones
});