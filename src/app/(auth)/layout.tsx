"use client";

import { RequireVerifiedEmail } from "@/components/auth/RequireVerifiedEmail";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireVerifiedEmail>
      <div className="auth-layout">
        {/* Navigation et autres éléments communs */}
        <main>{children}</main>
      </div>
    </RequireVerifiedEmail>
  );
}