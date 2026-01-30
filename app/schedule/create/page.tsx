"use client";

import { ScheduleForm } from "@/components/schedule";
import { CreateScheduleData } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useRouter } from "next/navigation";

const CreateSchedulePage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { createSchedule, isLoading } = useScheduleStore();

  const handleSubmit = async (data: CreateScheduleData) => {
    try {
      await createSchedule(data);
      router.push("/schedule");
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="max-w-2xl min-h-screen mx-auto py-6 lg:py-20 px-4 space-y-6 lg:space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
          Tạo sự kiện mới
        </h1>
      </div>

      <ScheduleForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        userRegion={user.region as "vn" | "na"}
      />
    </main>
  );
};

export default CreateSchedulePage;
