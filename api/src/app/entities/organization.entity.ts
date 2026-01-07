import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentOrgId: number;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'parentOrgId' })
  parentOrg: Organization;

  @CreateDateColumn()
  createdAt: Date;
}