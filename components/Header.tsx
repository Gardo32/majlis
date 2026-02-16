import Link from "next/link";
import { getUser } from "@/lib/auth-server";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const user = await getUser();

  return (
    <header className="bg-card border-b-2 border-border">
      {/* Title Bar */}
      <div className="win-title-bar-flat text-center py-2 flex justify-between items-center px-4">
        <div className="w-20"></div> {/* Spacer for centering */}
        <h1 className="text-lg">مجلس الحاج إبراهيم الدقاق - Majlis Haji Ebrahim Aldaqaq</h1>
        <div className="w-20 flex justify-end">
          {/* Placeholder if needed */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-secondary border-b-2 border-border p-2">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            <Link href="/" className="win-button text-sm">
              🏠 Home
            </Link>
            <Link href="/calendar" className="win-button text-sm">
              📅 Calendar
            </Link>
            <Link href="/progress" className="win-button text-sm">
              📊 Progress
            </Link>
            <Link href="/radio" className="win-button text-sm">
              📻 Radio
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm border-2 border-border bg-card px-2 py-1">
                  {user.name} ({user.role})
                </span>
                {(user.role === "ADMIN" ||
                  user.role === "MAJLIS_CONTROLLER" ||
                  user.role === "MAJLIS") && (
                    <Link href="/dashboard" className="win-button text-sm">
                      ⚙️ Dashboard
                    </Link>
                  )}
                <Link href="/logout" className="win-button text-sm">
                  🚪 Logout
                </Link>
              </>
            ) : (
              <Link href="/login" className="win-button text-sm">
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
