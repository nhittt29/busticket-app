// prisma/prisma.config.ts
export default {
  schema: 'prisma/schema.prisma',
  client: {
    output: 'node_modules/.prisma/client',
  },
  seed: {
    path: 'prisma/seed.ts',
    runInTransaction: true,
  },
};