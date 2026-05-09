import {
 Entity,
 PrimaryGeneratedColumn,
 Column,
} from 'typeorm';

@Entity()
export class Profile {

 @PrimaryGeneratedColumn()
 id: number;

 @Column()
 userId: number;

 @Column()
 name: string;

 @Column({
   unique: true,
 })
 email: string;

 @Column()
 phone: string;

 @Column({
   nullable: true,
 })
 photo: string;
}