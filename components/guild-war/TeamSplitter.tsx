"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

// Role priority for sorting: Tank -> Healer -> DPS
const ROLE_PRIORITY: Record<string, number> = {
  Tank: 1,
  Healer: 2,
  DPS: 3
};

type RoleFilter = "DPS" | "Healer" | "Tank" | null;

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useGuildWarStore, type TeamMember } from "@/stores/eventStore";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import TeamCard from "./TeamCard";
import UserCard from "./UserCard";

function AvailableUsersDroppable({
  children,
  isOver,
  droppableId
}: {
  children: React.ReactNode;
  isOver: boolean;
  droppableId: string;
}) {
  const { setNodeRef } = useDroppable({
    id: droppableId,
    data: { type: "container" }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "space-y-2 max-h-150 overflow-y-auto min-h-20",
        isOver && "ring-2 ring-primary rounded-lg"
      )}
    >
      {children}
    </div>
  );
}

export default function TeamSplitter({ region }: { region: "VN" | "NA" }) {
  const { availableUsers, teams, isLoading, error } = useGuildWarStore(
    state => state[region]
  );
  const addTeam = useGuildWarStore(state => state.addTeam);
  const moveUser = useGuildWarStore(state => state.moveUser);
  const deleteUser = useGuildWarStore(state => state.deleteUser);
  const fetchEvent = useGuildWarStore(state => state.fetchEvent);
  const membersVN = useGuildWarStore(state => state.VN);
  const membersNA = useGuildWarStore(state => state.NA);

  const user = useAuthStore(state => state.user);
  const isAdmin = user?.isAdmin ?? false;
  const isMobile = useIsMobile();

  const [activeUser, setActiveUser] = useState<TeamMember | null>(null);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserSource, setSelectedUserSource] = useState<string | null>(
    null
  );
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    name: "",
    day: "saturday" as "saturday" | "sunday",
    description: ""
  });

  // Filter states for available users and teams
  const [satAvailableFilter, setSatAvailableFilter] =
    useState<RoleFilter>(null);
  const [sunAvailableFilter, setSunAvailableFilter] =
    useState<RoleFilter>(null);
  const [teamFilters, setTeamFilters] = useState<Record<string, RoleFilter>>(
    {}
  );

  // Helper to get/set team filter
  const getTeamFilter = (teamId: string) => teamFilters[teamId] ?? null;
  const setTeamFilter = (teamId: string, filter: RoleFilter) => {
    setTeamFilters(prev => ({ ...prev, [teamId]: filter }));
  };

  // Separate teams by day first
  const saturdayTeams = teams.filter(t => t.day === "saturday");
  const sundayTeams = teams.filter(t => t.day === "sunday");

  // Find which users are already in teams for each day
  const usersInSaturdayTeams = new Set(
    saturdayTeams.flatMap(t => t.members.map(m => m.id))
  );
  const usersInSundayTeams = new Set(
    sundayTeams.flatMap(t => t.members.map(m => m.id))
  );

  // Saturday users: have Saturday slots AND not in a Saturday team
  const saturdayUsers = availableUsers.filter(
    u =>
      u.timeSlots.some(slot => slot.startsWith("sat_")) &&
      !usersInSaturdayTeams.has(u.id)
  );

  // Sunday users: have Sunday slots AND not in a Sunday team
  const sundayUsers = availableUsers.filter(
    u =>
      u.timeSlots.some(slot => slot.startsWith("sun_")) &&
      !usersInSundayTeams.has(u.id)
  );

  // Fetch data on mount
  useEffect(() => {
    fetchEvent(region);
  }, [region, fetchEvent]);

  const handleRefresh = async () => {
    await fetchEvent(region);
  };

  const handleCreateTeam = async () => {
    if (!teamFormData.name.trim()) {
      return;
    }

    try {
      await addTeam(
        region,
        teamFormData.name,
        teamFormData.day,
        teamFormData.description || undefined
      );
      setShowTeamDialog(false);
      setTeamFormData({ name: "", day: "saturday", description: "" });
    } catch (error) {
      console.error("Failed to create team:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    try {
      await deleteUser(region, userId);
      toast.success("Đã xóa thành viên thành công");
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Không thể xóa thành viên. Vui lòng thử lại.");
    }
  };

  const handleSelectUser = (userId: string, sourceContainer: string) => {
    if (isMobile) {
      if (selectedUserId === userId) {
        // Deselect if clicking the same user
        setSelectedUserId(null);
        setSelectedUserSource(null);
      } else {
        setSelectedUserId(userId);
        setSelectedUserSource(sourceContainer);
      }
    }
  };

  const handleAssignToTeam = (teamId: string) => {
    if (isMobile && selectedUserId && selectedUserSource) {
      // Find the target team
      const targetTeam = teams.find(t => t.id === teamId);
      if (!targetTeam) return;

      // Find the user
      const user = availableUsers.find(u => u.id === selectedUserId);
      if (!user) return;

      // Validate day compatibility
      const targetDay = targetTeam.day;
      const hasSatSlots = user.timeSlots.some(slot => slot.startsWith("sat_"));
      const hasSunSlots = user.timeSlots.some(slot => slot.startsWith("sun_"));

      // Check if user has time slots for the target day
      if (targetDay === "saturday" && !hasSatSlots) {
        toast.warning("User doesn't have Saturday time slots");
        return;
      }
      if (targetDay === "sunday" && !hasSunSlots) {
        toast.warning("User doesn't have Sunday time slots");
        return;
      }

      // Check if user is already in another team for the target day
      if (targetDay === "saturday") {
        const isInOtherSaturdayTeam = saturdayTeams.some(
          team =>
            team.id !== selectedUserSource &&
            team.members.some(m => m.id === selectedUserId)
        );
        if (isInOtherSaturdayTeam) {
          toast.error("User is already in another Saturday team");
          return;
        }
      }

      if (targetDay === "sunday") {
        const isInOtherSundayTeam = sundayTeams.some(
          team =>
            team.id !== selectedUserSource &&
            team.members.some(m => m.id === selectedUserId)
        );
        if (isInOtherSundayTeam) {
          alert("User is already in another Sunday team");
          return;
        }
      }

      // Map source container for the move
      const fromContainerId =
        selectedUserSource === "available-saturday" ||
        selectedUserSource === "available-sunday"
          ? "available"
          : selectedUserSource;

      moveUser(region, selectedUserId, fromContainerId, teamId);
      setSelectedUserId(null);
      setSelectedUserSource(null);
    }
  };

  const handleRemoveFromTeam = (userId: string, teamId: string) => {
    if (isMobile) {
      moveUser(region, userId, teamId, "available");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  const findContainer = (id: string): string | null => {
    // Extract actual user ID from composite ID
    const extractUserId = (compositeId: string) => {
      // Format: "containerId-userId" where userId starts with "user-"
      const match = compositeId.match(/-(user-.+)$/);
      return match ? match[1] : compositeId;
    };

    // Check if it's in available users (Saturday)
    if (id.startsWith("available-saturday-")) {
      const userId = extractUserId(id);
      if (saturdayUsers.find(u => u.id === userId)) {
        return "available-saturday";
      }
    }

    // Check if it's in available users (Sunday)
    if (id.startsWith("available-sunday-")) {
      const userId = extractUserId(id);
      if (sundayUsers.find(u => u.id === userId)) {
        return "available-sunday";
      }
    }

    // Check in teams (team members don't have composite IDs)
    const userId = extractUserId(id);
    for (const team of teams) {
      if (team.members.find(m => m.id === userId)) {
        return team.id;
      }
    }

    // Check if it's a container itself
    if (id === "available-saturday" || id === "available-sunday") return id;
    if (teams.find(t => t.id === id)) return id;

    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const user = active.data.current?.user as TeamMember | undefined;
    if (user) {
      setActiveUser(user);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overId = over.id as string;
      const container = findContainer(overId);
      setOverContainerId(container);
    } else {
      setOverContainerId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveUser(null);
    setOverContainerId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract actual user ID from composite ID
    const extractUserId = (id: string) => {
      const match = id.match(/-(user-.+)$/);
      return match ? match[1] : id;
    };
    const actualUserId = extractUserId(activeId);

    const activeContainer = active.data.current?.containerId as string;
    let overContainer = findContainer(overId);

    // If dropping on a container directly (empty area)
    if (
      overId === "available-saturday" ||
      overId === "available-sunday" ||
      teams.find(t => t.id === overId)
    ) {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer) return;

    // Only move if containers are different (no reordering within container)
    if (activeContainer !== overContainer) {
      // Validate day compatibility
      const user = activeUser;
      if (!user) return;

      // Determine if destination is Saturday or Sunday
      const toSaturday =
        overContainer === "available-saturday" ||
        teams.find(t => t.id === overContainer && t.day === "saturday");
      const toSunday =
        overContainer === "available-sunday" ||
        teams.find(t => t.id === overContainer && t.day === "sunday");

      // Validate based on user's time slots
      const hasSatSlots = user.timeSlots.some(slot => slot.startsWith("sat_"));
      const hasSunSlots = user.timeSlots.some(slot => slot.startsWith("sun_"));

      // Allow moving to available lists (removing from teams)
      const movingToAvailable =
        overContainer === "available-saturday" ||
        overContainer === "available-sunday";

      if (!movingToAvailable) {
        // Only validate when moving to teams, not when removing from teams
        // Prevent moving Saturday-only users to Sunday teams
        if (toSunday && !hasSunSlots) {
          toast.warning("User doesn't have Sunday time slots");
          return;
        }

        // Prevent moving Sunday-only users to Saturday teams
        if (toSaturday && !hasSatSlots) {
          toast.warning("User doesn't have Saturday time slots");
          return;
        }

        // Check if user is already in a different team for the target day
        if (toSaturday) {
          const isInSaturdayTeam = saturdayTeams.some(
            team =>
              team.id !== activeContainer && // Exclude source team
              team.members.some(m => m.id === actualUserId)
          );
          if (isInSaturdayTeam) {
            toast.error("User is already in another Saturday team");
            return;
          }
        }

        if (toSunday) {
          const isInSundayTeam = sundayTeams.some(
            team =>
              team.id !== activeContainer && // Exclude source team
              team.members.some(m => m.id === actualUserId)
          );
          if (isInSundayTeam) {
            toast.warning("User is already in another Sunday team");
            return;
          }
        }
      }

      // Map container IDs for the move
      const fromContainerId =
        activeContainer === "available-saturday" ||
        activeContainer === "available-sunday"
          ? "available"
          : activeContainer;
      const toContainerId =
        overContainer === "available-saturday" ||
        overContainer === "available-sunday"
          ? "available"
          : overContainer;

      moveUser(region, actualUserId, fromContainerId, toContainerId);
    }
  };

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <Separator />
            <CardContent className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 p-3 sm:p-6">
        {/* Saturday Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            Thứ 7 (Saturday) - Tổng thành viên đã đăng ký:{" "}
            {region === "NA"
              ? membersNA.availableUsers.filter(u =>
                  u.timeSlots.some(slot => slot.startsWith("sat_"))
                ).length
              : membersVN.availableUsers.filter(u =>
                  u.timeSlots.some(slot => slot.startsWith("sat_"))
                ).length}{" "}
            người
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Available Users - Saturday */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Thành viên đã đăng ký
                  </CardTitle>
                  <CardDescription>
                    Còn lại: {saturdayUsers.length} thành viên chưa vào team
                  </CardDescription>
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
                  <SortableContext
                    items={saturdayUsers
                      .filter(
                        u =>
                          !satAvailableFilter ||
                          u.primaryRole === satAvailableFilter
                      )
                      .map(u => `available-saturday-${u.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AvailableUsersDroppable
                      droppableId="available-saturday"
                      isOver={overContainerId === "available-saturday"}
                    >
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
                        [...saturdayUsers]
                          .filter(
                            u =>
                              !satAvailableFilter ||
                              u.primaryRole === satAvailableFilter
                          )
                          .sort(
                            (a, b) =>
                              (ROLE_PRIORITY[a.primaryRole] ?? 99) -
                              (ROLE_PRIORITY[b.primaryRole] ?? 99)
                          )
                          .map(user => (
                            <UserCard
                              key={user.id}
                              user={user}
                              containerId="available-saturday"
                              isAdmin={isAdmin}
                              onDelete={handleDeleteUser}
                              isMobile={isMobile}
                              isSelected={selectedUserId === user.id}
                              onSelect={handleSelectUser}
                              dayFilter="sat"
                              region={region}
                            />
                          ))
                      )}
                    </AvailableUsersDroppable>
                  </SortableContext>
                </CardContent>
              </Card>
            </div>

            {/* Teams - Saturday */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-semibold">Teams</h3>
                <Button onClick={() => setShowTeamDialog(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nhóm mới</span>
                  <span className="sm:hidden">Mới</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {saturdayTeams.length > 0 ? (
                  saturdayTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      region={region}
                      isMobile={isMobile}
                      selectedUserId={selectedUserId}
                      onAssignUser={handleAssignToTeam}
                      onRemoveUser={handleRemoveFromTeam}
                      dayFilter="sat"
                      roleFilter={getTeamFilter(team.id)}
                      setRoleFilter={filter => setTeamFilter(team.id, filter)}
                    />
                  ))
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
          <h2 className="text-xl font-bold mb-4">
            Chủ nhật (Sunday) - Tổng thành viên đã đăng ký:{" "}
            {region === "NA"
              ? membersNA.availableUsers.filter(u =>
                  u.timeSlots.some(slot => slot.startsWith("sun_"))
                ).length
              : membersVN.availableUsers.filter(u =>
                  u.timeSlots.some(slot => slot.startsWith("sun_"))
                ).length}{" "}
            người
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Available Users - Sunday */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Thành viên đã đăng ký
                  </CardTitle>
                  <CardDescription>
                    Còn lại: {sundayUsers.length} thành viên chưa vào team
                  </CardDescription>
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
                  <SortableContext
                    items={sundayUsers
                      .filter(
                        u =>
                          !sunAvailableFilter ||
                          u.primaryRole === sunAvailableFilter
                      )
                      .map(u => `available-sunday-${u.id}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <AvailableUsersDroppable
                      droppableId="available-sunday"
                      isOver={overContainerId === "available-sunday"}
                    >
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
                        [...sundayUsers]
                          .filter(
                            u =>
                              !sunAvailableFilter ||
                              u.primaryRole === sunAvailableFilter
                          )
                          .sort(
                            (a, b) =>
                              (ROLE_PRIORITY[a.primaryRole] ?? 99) -
                              (ROLE_PRIORITY[b.primaryRole] ?? 99)
                          )
                          .map(user => (
                            <UserCard
                              key={user.id}
                              user={user}
                              containerId="available-sunday"
                              isAdmin={isAdmin}
                              onDelete={handleDeleteUser}
                              isMobile={isMobile}
                              isSelected={selectedUserId === user.id}
                              onSelect={handleSelectUser}
                              dayFilter="sun"
                              region={region}
                            />
                          ))
                      )}
                    </AvailableUsersDroppable>
                  </SortableContext>
                </CardContent>
              </Card>
            </div>

            {/* Teams - Sunday */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-lg font-semibold">Teams</h3>
                <Button onClick={() => setShowTeamDialog(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Nhóm mới</span>
                  <span className="sm:hidden">Mới</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {sundayTeams.length > 0 ? (
                  sundayTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      region={region}
                      isMobile={isMobile}
                      selectedUserId={selectedUserId}
                      onAssignUser={handleAssignToTeam}
                      onRemoveUser={handleRemoveFromTeam}
                      dayFilter="sun"
                      roleFilter={getTeamFilter(team.id)}
                      setRoleFilter={filter => setTeamFilter(team.id, filter)}
                    />
                  ))
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

      {/* Drag Overlay for smooth dragging */}
      <DragOverlay>
        {activeUser ? (
          <UserCard
            user={activeUser}
            containerId="available-saturday"
            region={region}
          />
        ) : null}
      </DragOverlay>

      {/* Team Creation Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo nhóm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo một nhóm mới cho Bang Chiến
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Tên nhóm *</Label>
              <Input
                id="team-name"
                placeholder="Nhập tên nhóm..."
                value={teamFormData.name}
                onChange={e =>
                  setTeamFormData({ ...teamFormData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-day">Ngày *</Label>
              <Select
                value={teamFormData.day}
                onValueChange={(value: "saturday" | "sunday") =>
                  setTeamFormData({ ...teamFormData, day: value })
                }
              >
                <SelectTrigger id="team-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saturday">Thứ 7 (Saturday)</SelectItem>
                  <SelectItem value="sunday">Chủ nhật (Sunday)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">Mô tả (Tùy chọn)</Label>
              <Textarea
                id="team-description"
                placeholder="Nhập mô tả nhóm..."
                rows={3}
                value={teamFormData.description}
                onChange={e =>
                  setTeamFormData({
                    ...teamFormData,
                    description: e.target.value
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={!teamFormData.name.trim()}
            >
              Tạo nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
}
