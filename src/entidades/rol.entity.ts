import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Usuario } from './usuario.entity'

@Entity('rol')
export class Rol {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    nombre: string

    @Column({ default: true })
    estado: boolean

    @Column({ default: null })
    fechaCreacion: Date;

    @OneToMany(() => Usuario, usuario => usuario.rol)
    usuarios: Usuario[]
}