import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('datosUsuario')
export class DatosUsuario {

  @PrimaryGeneratedColumn()
  id: number;

  @Column( {default: null })
  celular: string;

  @Column({ default: null })
  fechaNacimiento: Date;

  @Column({ default: true })
  conectado: boolean;

  @OneToOne(() => Usuario, (usuario) => usuario.datosUsuario)
  @JoinColumn({ name: 'usuarioId' })  // Aquí defines el nombre de la columna que será clave foránea
  usuario: Usuario;
}