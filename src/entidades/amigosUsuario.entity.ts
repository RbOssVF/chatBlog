import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('amistades')
export class Amistades {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuarioSolId: number;

  @Column()
  usuarioRecId: number;

  @Column({ default: 'pendiente' })  // Estados: 'pendiente', 'aceptado', 'rechazado'
  estado: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaSolicitud: Date;

  @Column({ type: 'timestamp', nullable: true })  // Confirmación opcional
  fechaConfirmacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.amistadesEnviadas)
  @JoinColumn({ name: 'usuarioSolId' })
  usuarioSol: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.amistadesRecibidas)
  @JoinColumn({ name: 'usuarioRecId' })
  usuarioRec: Usuario;
}


@Entity('amigos')
export class Amigos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuario1Id: number;

  @Column()
  usuario2Id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAmistad: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.amigosRelacion1)
  @JoinColumn({ name: 'usuario1Id' })
  usuario1: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.amigosRelacion2)
  @JoinColumn({ name: 'usuario2Id' })
  usuario2: Usuario;
}


@Entity('mensajes')
export class Mensajes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emisorId: number;

  @Column()
  receptorId: number;

  @Column()
  texto: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'boolean', default: false })
  vistoPorEmisor: boolean;

  @Column({ type: 'boolean', default: false })
  vistoPorReceptor: boolean;

  @Column({ type: 'boolean', default: false })
  eliminadoPorEmisor: boolean;

  @Column({ type: 'boolean', default: false })
  eliminadoPorReceptor: boolean;

  @ManyToOne(() => Usuario, (usuario) => usuario.mensajesEmisor)
  @JoinColumn({ name: 'emisorId' })
  emisor: Usuario;

  @ManyToOne(() => Usuario, (usuario) => usuario.mensajesReceptor)
  @JoinColumn({ name: 'receptorId' })
  receptor: Usuario;
}