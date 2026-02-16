"use client";

import { useEffect } from "react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { WindowBox } from "@/components/WindowBox";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut();
      router.push("/");
      router.refresh();
    };
    handleLogout();
  }, [router]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <WindowBox title="🚪 Logging Out...">
        <div className="text-center py-8">
          <p>Please wait while we log you out...</p>
        </div>
      </WindowBox>
    </div>
  );
}
