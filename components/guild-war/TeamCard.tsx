"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useState } from "react";

import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { Team, useTeamStore } from "@/stores/guildWarStore";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import UserCard from "./UserCard";

function TeamCard({ team, region }: { team: Team; region: "VN" | "NA" }) {
  const renameTeam = useTeamStore(state => state.renameTeam);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(team.name);

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

        <div className="flex items-center gap-2">
          <Badge className={getColorForBadge("DPS")}>
            DPS: {team.members.filter(member => member.role === "DPS").length}
          </Badge>
          <Badge className={getColorForBadge("Healer")}>
            Healer:{" "}
            {team.members.filter(member => member.role === "Healer").length}
          </Badge>
          <Badge className={getColorForBadge("Tank")}>
            Tank: {team.members.filter(member => member.role === "Tank").length}
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
    </Card>
  );
}

export default TeamCard;
