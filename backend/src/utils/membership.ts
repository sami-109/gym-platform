import prisma from "../lib/prisma.js";

export const updateMembershipExpiration = async (
  membership: {
    id: number;
    status: string;
    expiryDate: Date | null;
  } | null,
) => {
  if (!membership) {
    return null;
  }

  if (
    membership.status === "ACTIVE" &&
    membership.expiryDate &&
    membership.expiryDate <= new Date()
  ) {
    await prisma.membership.update({
      where: {
        id: membership.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    return "EXPIRED";
  }

  return membership.status;
};
