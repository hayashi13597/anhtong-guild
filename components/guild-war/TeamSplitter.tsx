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
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTeamStore } from "@/stores/guildWarStore";
import { Member } from "@/types";
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
  const availableUsers = useTeamStore(state => state[region].availableUsers);
  const teams = useTeamStore(state => state[region].teams);
  const addTeam = useTeamStore(state => state.addTeam);
  const moveUser = useTeamStore(state => state.moveUser);

  const [activeUser, setActiveUser] = useState<Member | null>(null);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);

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
    const user = active.data.current?.user as Member | undefined;
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

    // If same container, handle reordering
    if (activeContainer === overContainer) {
      const items =
        overContainer === "available"
          ? availableUsers
          : teams.find(t => t.id === overContainer)?.members || [];

      const oldIndex = items.findIndex(m => m.id === activeId);
      const newIndex = items.findIndex(m => m.id === overId);

      if (oldIndex !== newIndex && newIndex !== -1) {
        moveUser(region, activeId, activeContainer, overContainer, newIndex);
      }
    } else {
      // Moving to different container
      const overItems =
        overContainer === "available"
          ? availableUsers
          : teams.find(t => t.id === overContainer)?.members || [];

      let newIndex = overItems.findIndex(m => m.id === overId);
      if (newIndex === -1) {
        newIndex = overItems.length;
      }

      moveUser(region, activeId, activeContainer, overContainer, newIndex);
    }
  };

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
              <CardTitle>Thành viên chưa phân công</CardTitle>
              <div className="text-sm text-muted-foreground">
                Còn {availableUsers.length} người
              </div>
            </CardHeader>

            <Separator />

            <CardContent>
              <SortableContext
                items={availableUsers.map(u => u.id)}
                strategy={verticalListSortingStrategy}
              >
                <AvailableUsersDroppable
                  isOver={overContainerId === "available"}
                >
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      Tất cả đã được phân công
                    </div>
                  ) : (
                    availableUsers.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        containerId="available"
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
            {teams.map(team => (
              <TeamCard key={team.id} team={team} region={region} />
            ))}
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
