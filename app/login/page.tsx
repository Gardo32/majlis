"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { WindowBox } from "@/components/WindowBox";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <WindowBox title="🔐 Login - Majlis Control Panel">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="border-2 border-red-600 bg-red-100 p-3 text-red-800">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block font-bold mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="win-input w-full"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="win-input w-full"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="win-button w-full"
          >
            {loading ? "Logging in..." : "🔓 Login"}
          </button>
        </form>
      </WindowBox>

      <WindowBox title="ℹ️ Information" className="mt-4">
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            This login is for Majlis controllers and administrators only.
          </p>
          <p>
            Regular visitors do not need to login to view the calendar and
            progress.
          </p>
        </div>
      </WindowBox>
    </div>
  );
}
