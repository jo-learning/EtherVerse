import { prisma } from "@/lib/prisma";

export async function findUserByIdentifier(identifier: string) {
  const normalized = identifier.trim();
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: normalized, mode: "insensitive" } },
        { id: normalized },
      ],
    },
  });
}

export async function getUserAndSecret(identifier: string) {
  const user = await findUserByIdentifier(identifier);
  if (!user) return null;
  const secret = await prisma.userGoogleFA.findUnique({ where: { userId: user.id } });
  return { user, secret };
}
