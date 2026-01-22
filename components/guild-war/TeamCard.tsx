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

function TeamCard({ team, region }: { team: Team; region: "VN" | "NA" }) {
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
    }
  });

  const save = () => {
    if (name.trim()) {
      renameTeam(region, team.id, name.trim());
    }
    setEditing(false);
  };

  return (
    <Card className={cn("min-h-75", isOver && "ring-2 ring-primary")}>
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
          <Badge className={getColorForBadge("DPS")}>
            DPS:{" "}
            {team.members.filter(member => member.primaryRole === "DPS").length}
          </Badge>
          <Badge className={getColorForBadge("Healer")}>
            Healer:{" "}
            {
              team.members.filter(member => member.primaryRole === "Healer")
                .length
            }
          </Badge>
          <Badge className={getColorForBadge("Tank")}>
            Tank:{" "}
            {
              team.members.filter(member => member.primaryRole === "Tank")
                .length
            }
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent ref={setNodeRef}>
        <SortableContext
          items={team.members.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-20">
            {team.members.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                Chưa có thành viên
              </div>
            ) : (
              team.members.map(user => (
                <UserCard key={user.id} user={user} containerId={team.id} />
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
