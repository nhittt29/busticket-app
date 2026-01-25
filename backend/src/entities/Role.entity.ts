import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User.entity';

@Entity('Role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
