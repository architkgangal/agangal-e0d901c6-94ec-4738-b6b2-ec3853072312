import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role, RoleName } from './app/entities/role.entity';
import { Organization } from './app/entities/organization.entity';
import { User } from './app/entities/user.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: './data/tasks.db',
    entities: [__dirname + '/app/entities/*.entity{.ts,.js}'],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected');

  const roleRepo = dataSource.getRepository(Role);
  const orgRepo = dataSource.getRepository(Organization);
  const userRepo = dataSource.getRepository(User);

  // Create Roles
  const ownerRole = await roleRepo.save({ name: RoleName.OWNER });
  const adminRole = await roleRepo.save({ name: RoleName.ADMIN });
  const viewerRole = await roleRepo.save({ name: RoleName.VIEWER });
  console.log('Roles created');

  // Create Organizations (2-level hierarchy)
  const parentOrg = await orgRepo.save({ name: 'Parent Organization' });
  const childOrg = await orgRepo.save({ 
    name: 'Child Organization', 
    parentOrgId: parentOrg.id 
  });
  console.log('Organizations created');

  // Create Test Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  await userRepo.save({
    email: 'owner@example.com',
    password: hashedPassword,
    roleId: ownerRole.id,
    organizationId: parentOrg.id,
  });

  await userRepo.save({
    email: 'admin@example.com',
    password: hashedPassword,
    roleId: adminRole.id,
    organizationId: childOrg.id,
  });

  await userRepo.save({
    email: 'viewer@example.com',
    password: hashedPassword,
    roleId: viewerRole.id,
    organizationId: childOrg.id,
  });

  console.log('Seeding complete!');
  console.log('Test users:');
  console.log('  owner@example.com / password123 (Owner role)');
  console.log('  admin@example.com / password123 (Admin role)');
  console.log('  viewer@example.com / password123 (Viewer role)');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});