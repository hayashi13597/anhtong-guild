"use client";

import TeamSplitter from "@/components/guild-war/TeamSplitter";
import UserCard from "@/components/guild-war/UserCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getColorForBadge } from "@/lib/color";
import { useAuthStore } from "@/stores/authStore";
import { useGuildWarStore } from "@/stores/eventStore";
import { LogOut, RefreshCcw, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Role priority for sorting: Tank -> Healer -> DPS
const ROLE_PRIORITY: Record<string, number> = {
  Tank: 1,
  Healer: 2,
  DPS: 3
};

type RoleFilter = "DPS" | "Healer" | "Tank" | null;

const GuildWarPage = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const fetchEvent = useGuildWarStore(state => state.fetchEvent);
  const createEvent = useGuildWarStore(state => state.createEvent);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch event data on mount
  useEffect(() => {
    fetchEvent("VN");
    fetchEvent("NA");
  }, [fetchEvent]);

  const handleCreateEvent = async () => {
    if (!user?.region) return;

    setIsCreating(true);
    try {
      const region = user.region.toUpperCase() as "VN" | "NA";
      await createEvent(region);
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="max-w-7xl lg:max-w-4/5 min-h-screen mx-auto py-6 lg:py-20 px-4 space-y-6 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
          Bang Chiến
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

      {/* Region Tabs */}
      <Tabs defaultValue="VN">
        <div className="flex items-center flex-col lg:flex-row gap-4">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="VN">VN Server</TabsTrigger>
            <TabsTrigger value="NA">NA Server</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/guild-war/register">Đăng ký tham gia</Link>
            </Button>
            {isAuthenticated && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" disabled={isCreating}>
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    {isCreating ? "Đang làm mới..." : "Tạo sự kiện mới"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Xác nhận tạo sự kiện mới
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn tạo sự kiện mới không? Điều này sẽ
                      mất tất cả dữ liệu đăng ký và đội hình hiện tại.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateEvent}>
                      Xác nhận
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <TabsContent value="VN" className="space-y-8">
          {isAuthenticated && user?.region === "vn" ? (
            // Admin view with drag & drop
            <TeamSplitter region="VN" />
          ) : (
            // Public view
            <PublicView region="VN" />
          )}
        </TabsContent>

        <TabsContent value="NA" className="space-y-8">
          {isAuthenticated && user?.region === "na" ? (
            // Admin view with drag & drop
            <TeamSplitter region="NA" />
          ) : (
            // Public view
            <PublicView region="NA" />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

function PublicView({ region }: { region: "VN" | "NA" }) {
  const [satAvailableFilter, setSatAvailableFilter] =
    useState<RoleFilter>(null);
  const [sunAvailableFilter, setSunAvailableFilter] =
    useState<RoleFilter>(null);
  const [teamFilters, setTeamFilters] = useState<Record<string, RoleFilter>>(
    {}
  );
  const { availableUsers, teams } = useGuildWarStore(state => state[region]);

  // Helper to get/set team filter
  const getTeamFilter = (teamId: string) => teamFilters[teamId] ?? null;
  const setTeamFilter = (teamId: string, filter: RoleFilter) => {
    setTeamFilters(prev => ({ ...prev, [teamId]: filter }));
  };

  // Filter users and teams by day
  const usersInSaturdayTeams = useMemo(() => {
    const satTeams = teams.filter(t => t.day === "saturday");
    return new Set(satTeams.flatMap(t => t.members.map(m => m.id)));
  }, [teams]);

  const usersInSundayTeams = useMemo(() => {
    const sunTeams = teams.filter(t => t.day === "sunday");
    return new Set(sunTeams.flatMap(t => t.members.map(m => m.id)));
  }, [teams]);

  const saturdayUsers = useMemo(
    () =>
      availableUsers
        .filter(
          u =>
            u.timeSlots.some(slot => slot.startsWith("sat_")) &&
            !usersInSaturdayTeams.has(u.id)
        )
        .sort(
          (a, b) =>
            (ROLE_PRIORITY[a.primaryRole] ?? 99) -
            (ROLE_PRIORITY[b.primaryRole] ?? 99)
        ),
    [availableUsers, usersInSaturdayTeams]
  );

  const sundayUsers = useMemo(
    () =>
      availableUsers
        .filter(
          u =>
            u.timeSlots.some(slot => slot.startsWith("sun_")) &&
            !usersInSundayTeams.has(u.id)
        )
        .sort(
          (a, b) =>
            (ROLE_PRIORITY[a.primaryRole] ?? 99) -
            (ROLE_PRIORITY[b.primaryRole] ?? 99)
        ),
    [availableUsers, usersInSundayTeams]
  );

  const saturdayTeams = useMemo(
    () => teams.filter(t => t.day === "saturday"),
    [teams]
  );
  const sundayTeams = useMemo(
    () => teams.filter(t => t.day === "sunday"),
    [teams]
  );

  // Calculate role counts
  const satDpsCount = saturdayUsers.filter(m => m.primaryRole === "DPS").length;
  const satHealerCount = saturdayUsers.filter(
    m => m.primaryRole === "Healer"
  ).length;
  const satTankCount = saturdayUsers.filter(
    m => m.primaryRole === "Tank"
  ).length;

  const sunDpsCount = sundayUsers.filter(m => m.primaryRole === "DPS").length;
  const sunHealerCount = sundayUsers.filter(
    m => m.primaryRole === "Healer"
  ).length;
  const sunTankCount = sundayUsers.filter(m => m.primaryRole === "Tank").length;

  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Saturday Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Thứ 7 (Saturday)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Available Users - Saturday */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Thành viên đã đăng ký
                </CardTitle>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <Badge
                    className={`${getColorForBadge("DPS")} cursor-pointer transition-all ${satAvailableFilter === "DPS" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                    onClick={() =>
                      setSatAvailableFilter(
                        satAvailableFilter === "DPS" ? null : "DPS"
                      )
                    }
                  >
                    DPS: {satDpsCount}
                  </Badge>
                  <Badge
                    className={`${getColorForBadge("Healer")} cursor-pointer transition-all ${satAvailableFilter === "Healer" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                    onClick={() =>
                      setSatAvailableFilter(
                        satAvailableFilter === "Healer" ? null : "Healer"
                      )
                    }
                  >
                    Healer: {satHealerCount}
                  </Badge>
                  <Badge
                    className={`${getColorForBadge("Tank")} cursor-pointer transition-all ${satAvailableFilter === "Tank" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                    onClick={() =>
                      setSatAvailableFilter(
                        satAvailableFilter === "Tank" ? null : "Tank"
                      )
                    }
                  >
                    Tank: {satTankCount}
                  </Badge>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="px-4">
                <div className="space-y-2 max-h-150 overflow-y-auto min-h-20">
                  {saturdayUsers.filter(
                    u =>
                      !satAvailableFilter ||
                      u.primaryRole === satAvailableFilter
                  ).length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      {satAvailableFilter
                        ? `Không có ${satAvailableFilter}`
                        : "Không có thành viên nào"}
                    </div>
                  ) : (
                    saturdayUsers
                      .filter(
                        u =>
                          !satAvailableFilter ||
                          u.primaryRole === satAvailableFilter
                      )
                      .map(user => (
                        <UserCard
                          key={user.id}
                          user={user}
                          containerId="available-saturday"
                          dayFilter="sat"
                        />
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teams - Saturday */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {saturdayTeams.length > 0 ? (
                saturdayTeams.map(team => {
                  const teamFilter = getTeamFilter(team.id);
                  return (
                    <Card key={team.id} className="min-h-75">
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base sm:text-lg">
                            {team.name}
                          </CardTitle>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getColorForBadge("DPS")} cursor-pointer transition-all ${teamFilter === "DPS" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                            onClick={() =>
                              setTeamFilter(
                                team.id,
                                teamFilter === "DPS" ? null : "DPS"
                              )
                            }
                          >
                            DPS:{" "}
                            {
                              team.members.filter(
                                member => member.primaryRole === "DPS"
                              ).length
                            }
                          </Badge>
                          <Badge
                            className={`${getColorForBadge("Healer")} cursor-pointer transition-all ${teamFilter === "Healer" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                            onClick={() =>
                              setTeamFilter(
                                team.id,
                                teamFilter === "Healer" ? null : "Healer"
                              )
                            }
                          >
                            Healer:{" "}
                            {
                              team.members.filter(
                                member => member.primaryRole === "Healer"
                              ).length
                            }
                          </Badge>
                          <Badge
                            className={`${getColorForBadge("Tank")} cursor-pointer transition-all ${teamFilter === "Tank" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                            onClick={() =>
                              setTeamFilter(
                                team.id,
                                teamFilter === "Tank" ? null : "Tank"
                              )
                            }
                          >
                            Tank:{" "}
                            {
                              team.members.filter(
                                member => member.primaryRole === "Tank"
                              ).length
                            }
                          </Badge>
                        </div>
                      </CardHeader>

                      <Separator />

                      <CardContent>
                        <div className="space-y-2 min-h-20">
                          {[...team.members].filter(
                            u => !teamFilter || u.primaryRole === teamFilter
                          ).length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                              {teamFilter
                                ? `Không có ${teamFilter}`
                                : "Chưa có thành viên"}
                            </div>
                          ) : (
                            [...team.members]
                              .sort(
                                (a, b) =>
                                  (ROLE_PRIORITY[a.primaryRole] ?? 99) -
                                  (ROLE_PRIORITY[b.primaryRole] ?? 99)
                              )
                              .filter(
                                u => !teamFilter || u.primaryRole === teamFilter
                              )
                              .map(user => (
                                <UserCard
                                  key={user.id}
                                  user={user}
                                  containerId={team.id}
                                  dayFilter="sat"
                                />
                              ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground col-span-full">
                  Chưa có nhóm nào được tạo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sunday Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Chủ nhật (Sunday)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Available Users - Sunday */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Thành viên đã đăng ký
                </CardTitle>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <Badge
                    className={`${getColorForBadge("DPS")} cursor-pointer transition-all ${sunAvailableFilter === "DPS" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                    onClick={() =>
                      setSunAvailableFilter(
                        sunAvailableFilter === "DPS" ? null : "DPS"
                      )
                    }
                  >
                    DPS: {sunDpsCount}
                  </Badge>
                  <Badge
                    className={`${getColorForBadge("Healer")} cursor-pointer transition-all ${sunAvailableFilter === "Healer" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                    onClick={() =>
                      setSunAvailableFilter(
                        sunAvailableFilter === "Healer" ? null : "Healer"
                      )
                    }
                  >
                    Healer: {sunHealerCount}
                  </Badge>
                  <Badge
                    className={`${getColorForBadge("Tank")} cursor-pointer transition-all ${sunAvailableFilter === "Tank" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                    onClick={() =>
                      setSunAvailableFilter(
                        sunAvailableFilter === "Tank" ? null : "Tank"
                      )
                    }
                  >
                    Tank: {sunTankCount}
                  </Badge>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="px-4">
                <div className="space-y-2 max-h-150 overflow-y-auto min-h-20">
                  {sundayUsers.filter(
                    u =>
                      !sunAvailableFilter ||
                      u.primaryRole === sunAvailableFilter
                  ).length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      {sunAvailableFilter
                        ? `Không có ${sunAvailableFilter}`
                        : "Không có thành viên nào"}
                    </div>
                  ) : (
                    sundayUsers
                      .filter(
                        u =>
                          !sunAvailableFilter ||
                          u.primaryRole === sunAvailableFilter
                      )
                      .map(user => (
                        <UserCard
                          key={user.id}
                          user={user}
                          containerId="available-sunday"
                          dayFilter="sun"
                        />
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teams - Sunday */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {sundayTeams.length > 0 ? (
                sundayTeams.map(team => {
                  const teamFilter = getTeamFilter(team.id);
                  return (
                    <Card key={team.id} className="min-h-75">
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base sm:text-lg">
                            {team.name}
                          </CardTitle>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getColorForBadge("DPS")} cursor-pointer transition-all ${teamFilter === "DPS" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                            onClick={() =>
                              setTeamFilter(
                                team.id,
                                teamFilter === "DPS" ? null : "DPS"
                              )
                            }
                          >
                            DPS:{" "}
                            {
                              team.members.filter(
                                member => member.primaryRole === "DPS"
                              ).length
                            }
                          </Badge>
                          <Badge
                            className={`${getColorForBadge("Healer")} cursor-pointer transition-all ${teamFilter === "Healer" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                            onClick={() =>
                              setTeamFilter(
                                team.id,
                                teamFilter === "Healer" ? null : "Healer"
                              )
                            }
                          >
                            Healer:{" "}
                            {
                              team.members.filter(
                                member => member.primaryRole === "Healer"
                              ).length
                            }
                          </Badge>
                          <Badge
                            className={`${getColorForBadge("Tank")} cursor-pointer transition-all ${teamFilter === "Tank" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                            onClick={() =>
                              setTeamFilter(
                                team.id,
                                teamFilter === "Tank" ? null : "Tank"
                              )
                            }
                          >
                            Tank:{" "}
                            {
                              team.members.filter(
                                member => member.primaryRole === "Tank"
                              ).length
                            }
                          </Badge>
                        </div>
                      </CardHeader>

                      <Separator />

                      <CardContent>
                        <div className="space-y-2 min-h-20">
                          {[...team.members].filter(
                            u => !teamFilter || u.primaryRole === teamFilter
                          ).length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                              {teamFilter
                                ? `Không có ${teamFilter}`
                                : "Chưa có thành viên"}
                            </div>
                          ) : (
                            [...team.members]
                              .sort(
                                (a, b) =>
                                  (ROLE_PRIORITY[a.primaryRole] ?? 99) -
                                  (ROLE_PRIORITY[b.primaryRole] ?? 99)
                              )
                              .filter(
                                u => !teamFilter || u.primaryRole === teamFilter
                              )
                              .map(user => (
                                <UserCard
                                  key={user.id}
                                  user={user}
                                  containerId={team.id}
                                  dayFilter="sun"
                                />
                              ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground col-span-full">
                  Chưa có nhóm nào được tạo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuildWarPage;
