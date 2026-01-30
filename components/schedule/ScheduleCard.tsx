"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScheduledNotification } from "@/lib/api";
import { Bell, Calendar, Clock, Hash, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

const DAYS_MAP: Record<string, string> = {
  monday: "T2",
  tuesday: "T3",
  wednesday: "T4",
  thursday: "T5",
  friday: "T6",
  saturday: "T7",
  sunday: "CN"
};

interface ScheduleCardProps {
  schedule: ScheduledNotification;
  isAdmin?: boolean;
  onToggleEnabled?: (id: number, enabled: boolean) => void;
  onDelete?: (id: number) => void;
}

export function ScheduleCard({
  schedule,
  isAdmin = false,
  onToggleEnabled,
  onDelete
}: ScheduleCardProps) {
  const formatDays = (days: string[] | null) => {
    if (!days || days.length === 0) return "Hàng ngày";
    if (days.length === 7) return "Hàng ngày";
    return days.map(day => DAYS_MAP[day.toLowerCase()] || day).join(", ");
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{schedule.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={schedule.region === "vn" ? "default" : "secondary"}>
              {schedule.region.toUpperCase()}
            </Badge>
            {isAdmin && (
              <Switch
                checked={schedule.enabled ?? true}
                onCheckedChange={checked =>
                  onToggleEnabled?.(schedule.id, checked)
                }
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>
              {schedule.startTime} - {schedule.endTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{formatDays(schedule.days)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            <span>{schedule.notifyBeforeMinutes} phút trước</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          <span className="font-mono text-xs">{schedule.channelId}</span>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">Role: </span>
          <Badge variant="outline">{schedule.mentionRole ?? "N/A"}</Badge>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/schedule/edit?id=${schedule.id}`}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Chỉnh sửa
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(schedule.id)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Xóa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
