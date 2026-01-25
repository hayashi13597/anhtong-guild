"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Trash2 } from "lucide-react";
import { useState } from "react";

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
import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { type Team, useGuildWarStore } from "@/stores/eventStore";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import UserCard from "./UserCard";

// Role priority for sorting: Tank -> Healer -> DPS
const ROLE_PRIORITY: Record<string, number> = {
  Tank: 1,
  Healer: 2,
  DPS: 3
};

type RoleFilter = "DPS" | "Healer" | "Tank" | null;

function TeamCard({
  team,
  region,
  isMobile,
  selectedUserId,
  onAssignUser,
  onRemoveUser,
  dayFilter,
  roleFilter,
  setRoleFilter
}: {
  team: Team;
  region: "VN" | "NA";
  isMobile?: boolean;
  selectedUserId?: string | null;
  onAssignUser?: (teamId: string) => void;
  onRemoveUser?: (userId: string, teamId: string) => void;
  dayFilter?: "sat" | "sun";
  roleFilter?: RoleFilter;
  setRoleFilter?: (filter: RoleFilter) => void;
}) {
  const renameTeam = useGuildWarStore(state => state.renameTeam);
  const deleteTeam = useGuildWarStore(state => state.deleteTeam);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteTeam = async () => {
    await deleteTeam(region, team.id);
    setShowDeleteDialog(false);
  };

  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
    data: {
      type: "team",
      team
    },
    disabled: isMobile
  });

  const save = () => {
    if (name.trim()) {
      renameTeam(region, team.id, name.trim());
    }
    setEditing(false);
  };

  const handleAssignClick = () => {
    if (isMobile && selectedUserId && onAssignUser) {
      onAssignUser(team.id);
    }
  };

  return (
    <Card
      className={cn(
        "min-h-75",
        isOver && "ring-2 ring-primary",
        isMobile && selectedUserId && "ring-2 ring-primary/50"
      )}
    >
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          {editing ? (
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={save}
              onKeyDown={e => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") {
                  setName(team.name);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <CardTitle
              className="text-lg cursor-pointer hover:underline"
              onClick={() => setEditing(true)}
            >
              {team.name}
            </CardTitle>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={`${getColorForBadge("DPS")} cursor-pointer transition-all ${roleFilter === "DPS" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
            onClick={() => setRoleFilter?.(roleFilter === "DPS" ? null : "DPS")}
          >
            DPS:{" "}
            {team.members.filter(member => member.primaryRole === "DPS").length}
          </Badge>
          <Badge
            className={`${getColorForBadge("Healer")} cursor-pointer transition-all ${roleFilter === "Healer" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
            onClick={() =>
              setRoleFilter?.(roleFilter === "Healer" ? null : "Healer")
            }
          >
            Healer:{" "}
            {
              team.members.filter(member => member.primaryRole === "Healer")
                .length
            }
          </Badge>
          <Badge
            className={`${getColorForBadge("Tank")} cursor-pointer transition-all ${roleFilter === "Tank" ? "ring-2 ring-offset-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
            onClick={() =>
              setRoleFilter?.(roleFilter === "Tank" ? null : "Tank")
            }
          >
            Tank:{" "}
            {
              team.members.filter(member => member.primaryRole === "Tank")
                .length
            }
          </Badge>
        </div>
        {isMobile && selectedUserId && (
          <Button
            onClick={handleAssignClick}
            size="sm"
            className="w-full mt-2"
            variant="outline"
          >
            Thêm vào nhóm này
          </Button>
        )}
      </CardHeader>

      <Separator />

      <CardContent ref={setNodeRef}>
        <SortableContext
          items={team.members
            .filter(m => !roleFilter || m.primaryRole === roleFilter)
            .map(m => `${team.id}-${m.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-20">
            {team.members.filter(
              m => !roleFilter || m.primaryRole === roleFilter
            ).length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                {roleFilter ? `Không có ${roleFilter}` : "Chưa có thành viên"}
              </div>
            ) : (
              [...team.members]
                .filter(m => !roleFilter || m.primaryRole === roleFilter)
                .sort(
                  (a, b) =>
                    (ROLE_PRIORITY[a.primaryRole] ?? 99) -
                    (ROLE_PRIORITY[b.primaryRole] ?? 99)
                )
                .map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    containerId={team.id}
                    isMobile={isMobile}
                    onRemove={userId => onRemoveUser?.(userId, team.id)}
                    dayFilter={dayFilter}
                  />
                ))
            )}
          </div>
        </SortableContext>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhóm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{team.name}</strong>?
              {team.members.length > 0 && (
                <> Các thành viên sẽ được chuyển về danh sách chờ.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default TeamCard;
