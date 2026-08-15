import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('HalfLink2026!', 12);

  const demoAccounts = [
    { email: 'customer@cosmetics.local', firstName: 'Fahad', lastName: 'Al-Otaibi', role: UserRole.USER },
    { email: 'admin@cosmetics.local', firstName: 'Half Link', lastName: 'Admin', role: UserRole.ADMIN },
    { email: 'driver@cosmetics.local', firstName: 'Sultan', lastName: 'Driver', role: UserRole.DRIVER },
  ];

  for (const acc of demoAccounts) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { passwordHash: hash, role: acc.role },
      create: {
        email: acc.email,
        firstName: acc.firstName,
        lastName: acc.lastName,
        passwordHash: hash,
        role: acc.role,
        cart: { create: {} },
      },
    });
  }

  console.log('✅ Demo accounts (customer, admin, driver) successfully created and updated with HalfLink2026!');
}

main().catch((e) => console.error(e)).finally(() => prisma.$disconnect());
