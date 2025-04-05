import { compare } from "bcryptjs"
import { prisma } from "@/prisma"

export async function verifyPassword(
  providedPassword: string,
  storedPassword: string
) {
  return compare(providedPassword, storedPassword)
}

export async function isAdmin(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail.toLowerCase() },
  })

  return user?.role === "ADMIN"
}
