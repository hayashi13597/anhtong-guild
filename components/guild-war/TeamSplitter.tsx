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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useGuildWarStore, type TeamMember } from "@/stores/eventStore";
import { Badge } from "../ui/badge";
import TeamCard from "./TeamCard";
import UserCard from "./UserCard";

function AvailableUsersDroppable({
  children,
  isOver
}: {
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: "available",
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

  const user = useAuthStore(state => state.user);
  const isAdmin = user?.isAdmin ?? false;

  const [activeUser, setActiveUser] = useState<TeamMember | null>(null);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchEvent(region);
  }, [region, fetchEvent]);

  const handleRefresh = async () => {
    await fetchEvent(region);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    try {
      await deleteUser(region, userId);
    } catch (error) {
      console.error("Failed to delete user:", error);
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
    // Check if it's in available users
    if (availableUsers.find(u => u.id === id)) {
      return "available";
    }

    // Check in teams
    for (const team of teams) {
      if (team.members.find(m => m.id === id)) {
        return team.id;
      }
    }

    // Check if it's a container itself
    if (id === "available") return "available";
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

    const activeContainer = active.data.current?.containerId as string;
    let overContainer = findContainer(overId);

    // If dropping on a container directly (empty area)
    if (overId === "available" || teams.find(t => t.id === overId)) {
      overContainer = overId;
    }

    if (!activeContainer || !overContainer) return;

    // Only move if containers are different (no reordering within container)
    if (activeContainer !== overContainer) {
      moveUser(region, activeId, activeContainer, overContainer);
    }
  };

  const dpsCount = availableUsers.filter(m => m.role === "DPS").length;
  const healerCount = availableUsers.filter(m => m.role === "Healer").length;
  const tankCount = availableUsers.filter(m => m.role === "Tank").length;

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Available Users */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thành viên đã đăng ký</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getColorForBadge("DPS")}>
                  DPS: {dpsCount}
                </Badge>
                <Badge className={getColorForBadge("Healer")}>
                  Healer: {healerCount}
                </Badge>
                <Badge className={getColorForBadge("Tank")}>
                  Tank: {tankCount}
                </Badge>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="px-4">
              <SortableContext
                items={availableUsers.map(u => u.id)}
                strategy={verticalListSortingStrategy}
              >
                <AvailableUsersDroppable
                  isOver={overContainerId === "available"}
                >
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                      Không có thành viên nào
                    </div>
                  ) : (
                    availableUsers.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        containerId="available"
                        isAdmin={isAdmin}
                        onDelete={handleDeleteUser}
                      />
                    ))
                  )}
                </AvailableUsersDroppable>
              </SortableContext>
            </CardContent>
          </Card>
        </div>

        {/* Teams */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Teams</h2>
            <Button onClick={() => addTeam(region)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nhóm mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams.length > 0 ? (
              teams.map(team => (
                <TeamCard key={team.id} team={team} region={region} />
              ))
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground col-span-full">
                Chưa có nhóm nào được tạo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag Overlay for smooth dragging */}
      <DragOverlay>
        {activeUser ? (
          <UserCard user={activeUser} containerId="available" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
