import { getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { DashboardPageContent } from "@/components/DashboardPageContent";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardPageContent user={{ name: user.name, role: user.role }} />;
}
