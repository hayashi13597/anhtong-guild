"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatClasses } from "@/lib/classes";
import { getColorForBadge } from "@/lib/color";
import { useGuildWarStore, type TeamMember } from "@/stores/eventStore";

interface MembersListProps {
  region: "VN" | "NA";
}

function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="border rounded-lg shadow-sm bg-background flex items-center justify-between py-2 px-2 sm:px-3 rounded-lg hover:bg-muted/50">
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
        <Badge className={getColorForBadge(member.primaryRole)}>
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

export function MembersList({ region }: MembersListProps) {
  const { availableUsers, teams, isLoading, error } = useGuildWarStore(
    state => state[region]
  );

  // Get all registered members (available + in teams)
  const allMembers = [
    ...availableUsers,
    ...teams.flatMap(team => team.members)
  ];

  const dpsCount = allMembers.filter(m => m.primaryRole === "DPS").length;
  const healerCount = allMembers.filter(m => m.primaryRole === "Healer").length;
  const tankCount = allMembers.filter(m => m.primaryRole === "Tank").length;

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Lỗi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Thành viên đã đăng ký ({allMembers.length})
        </CardTitle>
        <div className="flex items-center flex-wrap gap-2 mt-2">
          <Badge className={getColorForBadge("DPS")}>DPS: {dpsCount}</Badge>
          <Badge className={getColorForBadge("Healer")}>
            Healer: {healerCount}
          </Badge>
          <Badge className={getColorForBadge("Tank")}>Tank: {tankCount}</Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="max-h-96 overflow-y-auto">
        {allMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có thành viên đăng ký
          </div>
        ) : (
          <div className="space-y-1">
            {allMembers.map(member => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
