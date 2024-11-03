import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Rol } from './rol.entity';
import { DatosUsuario } from './datosUsuario.entity';
import { Amistades, Amigos, Mensajes } from './amigosUsuario.entity';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ nullable: true })  // Imagen de perfil opcional
  perfil: string;  

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @OneToOne(() => DatosUsuario, (datosUsuario) => datosUsuario.usuario)
  @JoinColumn({ name: 'datosUsuarioId' })
  datosUsuario: DatosUsuario;

  // Relaciones de amistades
  @OneToMany(() => Amistades, (amistad) => amistad.usuarioSol)
  amistadesEnviadas: Amistades[];

  @OneToMany(() => Amistades, (amistad) => amistad.usuarioRec)
  amistadesRecibidas: Amistades[];

  @OneToMany(() => Amigos, (amigo) => amigo.usuario1)
  amigosRelacion1: Amigos[];

  @OneToMany(() => Amigos, (amigo) => amigo.usuario2)
  amigosRelacion2: Amigos[];

  @OneToMany(() => Mensajes, (mensaje) => mensaje.emisorId)
  mensajesEmisor: Mensajes[];

  @OneToMany(() => Mensajes, (mensaje) => mensaje.receptorId)
  mensajesReceptor: Mensajes[];
}