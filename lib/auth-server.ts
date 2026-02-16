import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("Session check:", session ? "Valid session found" : "No session");
    return session;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  
  return user;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
