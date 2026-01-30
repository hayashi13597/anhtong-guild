"use client";

import Loading from "@/components/Loading";
import { ScheduleForm } from "@/components/schedule";
import { CreateScheduleData } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

function ScheduleEditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get("id");
  const id = idParam ? parseInt(idParam) : null;

  const { isAuthenticated, user } = useAuthStore();
  const { schedules, isLoading, fetchAllSchedules, updateSchedule } =
    useScheduleStore();

  // Find the schedule from the store using useMemo
  const schedule = useMemo(
    () => (id ? (schedules.find(s => s.id === id) ?? null) : null),
    [schedules, id]
  );

  // Redirect if no ID provided
  useEffect(() => {
    if (!idParam) {
      router.replace("/schedule");
    }
  }, [idParam, router]);

  // Fetch schedules if not loaded
  useEffect(() => {
    if (isAuthenticated && schedules.length === 0) {
      fetchAllSchedules();
    }
  }, [isAuthenticated, schedules.length, fetchAllSchedules]);

  const handleSubmit = async (data: CreateScheduleData) => {
    if (!id) return;
    try {
      await updateSchedule(id, data);
      router.push("/schedule");
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!id) {
    return null;
  }

  if (isLoading || (!schedule && schedules.length === 0)) {
    return (
      <main className="max-w-2xl min-h-screen mx-auto py-6 lg:py-20 px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (!schedule) {
    return (
      <main className="max-w-2xl min-h-screen mx-auto py-6 lg:py-20 px-4">
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">Không tìm thấy sự kiện</h2>
          <p className="text-muted-foreground">
            Sự kiện với ID {id} không tồn tại.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl min-h-screen mx-auto py-6 lg:py-20 px-4 space-y-6 lg:space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
          Chi tiết sự kiện
        </h1>
      </div>

      <ScheduleForm
        initialData={schedule}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        userRegion={user.region as "vn" | "na"}
      />
    </main>
  );
}

const ScheduleEditPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <ScheduleEditContent />
    </Suspense>
  );
};

export default ScheduleEditPage;
