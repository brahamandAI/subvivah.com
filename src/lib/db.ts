import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle database connection with retry logic
const connectWithRetry = async (retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('Successfully connected to MongoDB via Prisma');
      return;
    } catch (err) {
      console.error(`Failed to connect to database (attempt ${i + 1}/${retries}):`, err);
      if (i === retries - 1) {
        console.error('Max retries reached. Exiting process...');
        process.exit(1);
      }
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

connectWithRetry(); 