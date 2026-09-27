import crypto from "crypto";
import bcrypt from "bcrypt";

export const generatePassword = async () => {
  const password = crypto.randomBytes(6).toString("base64url").slice(0, 6);
  const passwordHash = await bcrypt.hash(password, 10);

  return {
    password,
    passwordHash,
  };
};
