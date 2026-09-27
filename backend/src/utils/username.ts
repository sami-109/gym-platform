import prisma from "../lib/prisma.js";

export const generateUniqueUsername = async (
  firstName: string,
  lastName: string,
) => {
  const baseUsername = `${firstName}${lastName}`
    .toLowerCase()
    .replace(/\s+/g, "");

  let username = baseUsername;
  let counter = 2;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};
