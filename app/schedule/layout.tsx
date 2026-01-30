import Loading from "@/components/Loading";
import { ProtectedRoute } from "@/components/protected-route";
import { Suspense } from "react";

export default function ScheduleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Suspense>
  );
}
