import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ipUser: string;

  @Column()
  nombreUsuario: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  email: string;

  @Column()
  clave: string;

  @Column({ default: true })
  estado: boolean;

  @Column()
  fechaCreacion: Date;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rolId' })  // Aquí defines el nombre que quieras para la columna
  rol: Rol;
}