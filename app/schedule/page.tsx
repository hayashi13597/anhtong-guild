"use client";

import { ScheduleCard } from "@/components/schedule";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { Loader2, LogOut, Plus, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SchedulePage = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const {
    schedules,
    isLoading,
    error,
    fetchSchedulesByRegion,
    fetchAllSchedules,
    updateSchedule,
    deleteSchedule
  } = useScheduleStore();

  const [activeTab, setActiveTab] = useState<"vn" | "na">("vn");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllSchedules();
    } else {
      fetchSchedulesByRegion(activeTab);
    }
  }, [isAuthenticated, activeTab, fetchAllSchedules, fetchSchedulesByRegion]);

  const handleToggleEnabled = async (id: number, enabled: boolean) => {
    try {
      await updateSchedule(id, { enabled });
    } catch (error) {
      console.error("Failed to toggle schedule:", error);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteSchedule(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  const filteredSchedules = isAuthenticated
    ? schedules
    : schedules.filter(s => s.region === activeTab);

  const vnSchedules = schedules.filter(s => s.region === "vn");
  const naSchedules = schedules.filter(s => s.region === "na");

  return (
    <main className="max-w-7xl lg:max-w-4/5 min-h-screen mx-auto py-6 lg:py-20 px-4 space-y-6 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
          Danh sách sự kiện
        </h1>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Admin: {user?.username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Link>
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Admin View with both regions */}
      {isAuthenticated ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Quản lý tất cả sự kiện thông báo Discord
            </p>
            <Button asChild>
              <Link href="/schedule/create">
                <Plus className="w-4 h-4 mr-2" />
                Tạo sự kiện mới
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="vn">
              <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
                <TabsTrigger value="vn">
                  VN Server ({vnSchedules.length})
                </TabsTrigger>
                <TabsTrigger value="na">
                  NA Server ({naSchedules.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vn" className="space-y-4">
                {vnSchedules.length === 0 ? (
                  <EmptyState region="VN" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vnSchedules.map(schedule => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        isAdmin
                        onToggleEnabled={handleToggleEnabled}
                        onDelete={id => setDeleteId(id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="na" className="space-y-4">
                {naSchedules.length === 0 ? (
                  <EmptyState region="NA" />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {naSchedules.map(schedule => (
                      <ScheduleCard
                        key={schedule.id}
                        schedule={schedule}
                        isAdmin
                        onToggleEnabled={handleToggleEnabled}
                        onDelete={id => setDeleteId(id)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      ) : (
        /* Public View - Single Region */
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as "vn" | "na")}
          >
            <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
              <TabsTrigger value="vn">VN Server</TabsTrigger>
              <TabsTrigger value="na">NA Server</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSchedules.length === 0 ? (
              <EmptyState region={activeTab.toUpperCase()} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSchedules.map(schedule => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            )}
          </Tabs>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};

function EmptyState({ region }: { region: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        Chưa có sự kiện nào cho {region} Server.
      </p>
    </div>
  );
}

export default SchedulePage;
