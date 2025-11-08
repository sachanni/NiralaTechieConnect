import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User } from "@shared/schema";

export async function setPasswordResetToken(
  userId: string,
  token: string,
  expiry: Date
): Promise<void> {
  await db
    .update(users)
    .set({ 
      passwordResetToken: token, 
      passwordResetExpiry: expiry 
    })
    .where(eq(users.id, userId));
}

export async function getUserByPasswordResetToken(
  token: string
): Promise<User | undefined> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);
  return result[0];
}

export async function clearPasswordResetToken(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ 
      passwordResetToken: null, 
      passwordResetExpiry: null 
    })
    .where(eq(users.id, userId));
}
