import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  // Hash the password
  const hashedPassword = await hash('admin123', 10);

  // Check if the admin user already exists
  const existingAdminUser = await prisma.user.findUnique({
    where: {
      email: 'admin@webplanner.com',
    },
  });

  if (existingAdminUser) {
    // Re-hash the password
    const newHashedPassword = await hash('admin123', 10);

    // Update the existing admin user's password and role to ADMIN
    const updatedAdminUser = await prisma.user.update({
      where: {
        email: 'admin@webplanner.com',
      },
      data: {
        password: newHashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user updated:', updatedAdminUser);
  } else {
    // Create the initial admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@webplanner.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        adminSettings: {
          create: {
            settings: {
              theme: 'dark',
              notifications: true,
              language: 'en'
            }
          }
        }
      }
    });
    console.log('Admin user created:', adminUser);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
