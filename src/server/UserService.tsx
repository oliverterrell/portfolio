import { prisma } from '@/server/prisma';
import { User } from '@prisma/client';

export const UserService = {
  findOneBy: async (field: any, value: string): Promise<User | null> => {
    return prisma.user.findUnique({ where: { [field]: value } as any });
  },

  create: async (userData: Partial<User>): Promise<User> => {
    return prisma.user.create({ data: userData });
  },
};
