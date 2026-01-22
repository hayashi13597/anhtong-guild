"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatClasses } from "@/lib/classes";
import { getColorForBadge } from "@/lib/color";
import {
  useGuildWarStore,
  type Team,
  type TeamMember
} from "@/stores/eventStore";

interface TeamsViewProps {
  region: "VN" | "NA";
}

function TeamMemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="border rounded-lg shadow-sm bg-background flex items-center justify-between py-2 px-2 sm:px-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{member.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {formatClasses(member.primaryClass)}
        </div>
        {member.secondaryClass && (
          <div className="text-xs text-muted-foreground/70 truncate">
            {formatClasses(member.secondaryClass)}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 shrink-0 ml-2">
        <Badge
          variant="outline"
          className={getColorForBadge(member.primaryRole)}
        >
          {member.primaryRole}
        </Badge>
        {member.secondaryRole && (
          <Badge
            variant="outline"
            className={getColorForBadge(member.secondaryRole)}
          >
            {member.secondaryRole}
          </Badge>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  const dpsCount = team.members.filter(m => m.primaryRole === "DPS").length;
  const healerCount = team.members.filter(
    m => m.primaryRole === "Healer"
  ).length;
  const tankCount = team.members.filter(m => m.primaryRole === "Tank").length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">{team.name}</CardTitle>
        <div className="flex items-center flex-wrap gap-2 mt-2">
          <Badge className={getColorForBadge("DPS")}>DPS: {dpsCount}</Badge>
          <Badge className={getColorForBadge("Healer")}>
            Heal: {healerCount}
          </Badge>
          <Badge className={getColorForBadge("Tank")}>Tank: {tankCount}</Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        {team.members.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Chưa có thành viên
          </div>
        ) : (
          <div className="space-y-1">
            {team.members.map(member => (
              <TeamMemberRow key={member.id} member={member} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TeamsView({ region }: TeamsViewProps) {
  const { teams, isLoading, error } = useGuildWarStore(state => state[region]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-48 mt-2" />
            </CardHeader>
            <Separator />
            <CardContent className="space-y-2">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Chưa có đội nào được tạo
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {teams.map(team => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
