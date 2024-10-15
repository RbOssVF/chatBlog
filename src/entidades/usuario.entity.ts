import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Rol } from './rol.entity';
import { DatosUsuario } from './datosUsuario.entity';

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

  @Column({ nullable: true }) // Agregamos una columna para la imagen de perfil
  perfil: string;  // Guardaremos la ruta de la imagen

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rolId' })  // Aquí defines el nombre de la columna
  rol: Rol;

  @OneToOne(() => DatosUsuario, (datosUsuario) => datosUsuario.usuario)
  @JoinColumn({ name: 'datosUsuarioId' })  // Definir la clave foránea correctamente
  datosUsuario: DatosUsuario;
}