import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@isp.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@isp.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'estoquista@isp.com' },
    update: {},
    create: {
      name: 'Estoquista',
      email: 'estoquista@isp.com',
      passwordHash,
      role: 'ESTOQUISTA',
    },
  });

  await prisma.user.upsert({
    where: { email: 'tecnico@isp.com' },
    update: {},
    create: {
      name: 'Técnico',
      email: 'tecnico@isp.com',
      passwordHash,
      role: 'TECNICO',
    },
  });

  console.log(
    'Seed concluído: admin@isp.com / estoquista@isp.com / tecnico@isp.com (senha: admin123)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
