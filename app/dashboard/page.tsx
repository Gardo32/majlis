import { getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { WindowBox } from "@/components/WindowBox";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { role } = user;

  return (
    <div className="space-y-4">
      <WindowBox title="⚙️ Dashboard - Control Panel">
        <div className="space-y-2">
          <p>
            Welcome, <strong>{user.name}</strong>
          </p>
          <p>
            Role:{" "}
            <span className="bg-gray-200 px-2 py-1 border border-black">
              {role}
            </span>
          </p>
        </div>
      </WindowBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Controller Access */}
        {(role === "ADMIN" || role === "MAJLIS_CONTROLLER") && (
          <WindowBox title="📅 Calendar Management">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Create and manage the Ramadan calendar schedule.
              </p>
              <Link
                href="/dashboard/controller"
                className="win-button block text-center"
              >
                📅 Open Calendar Controller
              </Link>
            </div>
          </WindowBox>
        )}

        {/* Majlis Access */}
        {(role === "ADMIN" || role === "MAJLIS") && (
          <WindowBox title="📻 Radio Management">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Manage radio stream URL and live status.
              </p>
              <Link
                href="/dashboard/majlis"
                className="win-button block text-center"
              >
                📻 Open Radio Controller
              </Link>
            </div>
          </WindowBox>
        )}

        {/* Admin Access */}
        {role === "ADMIN" && (
          <WindowBox title="👥 User Management">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Create, edit, and manage user accounts.
              </p>
              <Link
                href="/dashboard/admin"
                className="win-button block text-center"
              >
                👥 Open Admin Panel
              </Link>
            </div>
          </WindowBox>
        )}

        {/* Progress Update - Controller */}
        {(role === "ADMIN" || role === "MAJLIS_CONTROLLER") && (
          <WindowBox title="📊 Progress Update">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Update the current Surah, Juz, and completion progress.
              </p>
              <Link
                href="/dashboard/controller#progress"
                className="win-button block text-center"
              >
                📊 Update Progress
              </Link>
            </div>
          </WindowBox>
        )}
      </div>

      {/* Quick Links */}
      <WindowBox title="🔗 Quick Links">
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="win-button">
            🏠 Home
          </Link>
          <Link href="/calendar" className="win-button">
            📅 Calendar
          </Link>
          <Link href="/progress" className="win-button">
            📊 Progress
          </Link>
          <Link href="/radio" className="win-button">
            📻 Radio
          </Link>
        </div>
      </WindowBox>
    </div>
  );
}
