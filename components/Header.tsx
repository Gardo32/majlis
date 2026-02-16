import Link from "next/link";
import { getUser } from "@/lib/auth-server";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const user = await getUser();

  return (
    <header className="bg-card border-b-2 border-border">
      <HeaderNav user={user} />
    </header>
  );
}
