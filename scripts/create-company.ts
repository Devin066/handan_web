/**
 * Creates a company and its first admin user.
 *
 * There is deliberately no public "register" mutation: in an ERP, tenants are
 * provisioned by an operator, not self-served by anyone who can reach the API.
 *
 * Usage:
 *   pnpm create-company "Acme Manufacturing" admin@acme.com 'a-strong-password'
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }),
});

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Usage: pnpm create-company "<company name>" <admin email> <password>');
    process.exit(1);
  }

  if (password.length < 10) {
    console.error('Password must be at least 10 characters.');
    process.exit(1);
  }

  const normalisedEmail = email.trim().toLowerCase();

  if (await prisma.user.findUnique({ where: { email: normalisedEmail } })) {
    console.error(`A user with the email ${normalisedEmail} already exists.`);
    process.exit(1);
  }

  const company = await prisma.company.create({ data: { name } });

  const user = await prisma.user.create({
    data: {
      email: normalisedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      companyUuid: company.uuid,
    },
  });

  await prisma.staff.create({
    data: { companyUuid: company.uuid, userUuid: user.uuid, email: user.email, name: 'Admin' },
  });

  // A company with no warehouse cannot take an order, so give it a default one.
  await prisma.warehouse.create({
    data: { companyUuid: company.uuid, name: 'Main Warehouse', isDefault: true },
  });

  console.log(`
Created company "${company.name}"

  Sign in: ${user.email}
  Company: ${company.uuid}

Next: add units of measure and items under Settings before creating orders.
`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
