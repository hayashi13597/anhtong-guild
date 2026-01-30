"use client";

import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect after hydration is complete and not loading
    if (_hasHydrated && !isLoading && !isAuthenticated) {
      const redirectUrl =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : "");
      router.push(`/login?callbackUrl=${encodeURIComponent(redirectUrl)}`);
    }
  }, [
    isAuthenticated,
    isLoading,
    _hasHydrated,
    router,
    pathname,
    searchParams
  ]);

  // Show loading state while hydrating or checking auth
  if (!_hasHydrated || isLoading || !isAuthenticated) {
    return (
      <main className="max-w-2xl min-h-screen mx-auto py-6 lg:py-20 px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
