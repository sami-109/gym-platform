import crypto from "crypto";

export function generateMemberPassword() {
  return crypto.randomBytes(6).toString("base64url").slice(0, 6);
}
