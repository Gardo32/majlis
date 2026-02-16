import Link from "next/link";
import { getUser } from "@/lib/auth-server";

export async function Header() {
  const user = await getUser();

  return (
    <header className="bg-white border-b-2 border-black">
      {/* Title Bar */}
      <div className="win-title-bar-flat text-center py-2">
        <h1 className="text-lg">مجلس الحاج إبراهيم الدقاق - Majlis Haji Ebrahim Aldaqaq</h1>
      </div>
      
      {/* Navigation */}
      <nav className="bg-gray-100 border-b-2 border-black p-2">
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
            {user ? (
              <>
                <span className="text-sm border-2 border-black bg-white px-2 py-1">
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
