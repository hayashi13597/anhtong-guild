import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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
import { formatClasses } from "@/lib/classes";
import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { type TeamMember } from "@/stores/eventStore";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

function UserCard({
  user,
  className,
  containerId,
  isAdmin,
  onDelete,
  isMobile,
  isSelected,
  onSelect,
  onRemove,
  dayFilter,
  region
}: {
  user: TeamMember;
  className?: string;
  containerId: string;
  isAdmin?: boolean;
  onDelete?: (userId: string) => void;
  isMobile?: boolean;
  isSelected?: boolean;
  onSelect?: (userId: string, containerId: string) => void;
  onRemove?: (userId: string) => void;
  dayFilter?: "sat" | "sun";
  region?: "VN" | "NA";
}) {
  // Create unique ID combining user ID and container to allow same user in multiple lists
  const uniqueId = `${containerId}-${user.id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: uniqueId,
    data: {
      type: "user",
      user,
      containerId
    },
    disabled: isMobile
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const isAvailableList =
    containerId === "available" ||
    containerId === "available-saturday" ||
    containerId === "available-sunday";
  const canDelete = isAdmin && isAvailableList && onDelete;
  const canRemove = isMobile && !isAvailableList && onRemove;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(user.id);
    }
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(user.id);
    }
    setShowDeleteDialog(false);
  };

  const handleClick = () => {
    if (isMobile) {
      if (onSelect) {
        onSelect(user.id, containerId);
      }
      // Toggle tooltip on mobile
      setShowTooltip(prev => !prev);
    }
  };

  const localTimeZone = useMemo(() => {
    if (region !== "NA") return null;
    if (typeof Intl === "undefined") return null;
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  }, [region]);

  const formatLocalRange = (slot: string) => {
    if (!localTimeZone) return slot.split("_")[1];
    const [dayKey, range] = slot.split("_") as ["sat" | "sun", string];
    const [start, end] = range.split("-");
    const dateMap: Record<"sat" | "sun", string> = {
      sat: "2025-01-04",
      sun: "2025-01-05"
    };
    const [year, month, day] = dateMap[dayKey].split("-").map(Number);
    const toUtcDate = (time: string) => {
      const [hour, minute] = time.split(":").map(Number);
      return new Date(Date.UTC(year, month - 1, day, hour + 5, minute));
    };
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: localTimeZone
    });
    const formatTime = (date: Date) => {
      const parts = formatter.formatToParts(date);
      const hour = parts.find(part => part.type === "hour")?.value ?? "";
      const minute = parts.find(part => part.type === "minute")?.value ?? "";
      return `${hour}:${minute}`;
    };
    const startTime = formatTime(toUtcDate(start));
    const endTime = formatTime(toUtcDate(end));
    return `${startTime}-${endTime}`;
  };

  return (
    <>
      <Tooltip open={isMobile ? showTooltip : undefined}>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            className={cn(
              "p-3 border rounded-lg shadow-sm bg-background",
              !isMobile && "cursor-grab active:cursor-grabbing",
              isMobile && "cursor-pointer",
              isDragging && "z-50 shadow-lg",
              isSelected && "bg-primary/10 border-primary",
              className
            )}
            onClick={handleClick}
            {...(!isMobile ? attributes : {})}
            {...(!isMobile ? listeners : {})}
          >
            <div className="flex items-center gap-2">
              {!isMobile && (
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatClasses(user.primaryClass)}
                </div>
                {user.secondaryClass && (
                  <div className="text-xs text-muted-foreground/70">
                    {formatClasses(user.secondaryClass)}
                  </div>
                )}
                {user.timeSlots &&
                  user.timeSlots.length > 0 &&
                  (() => {
                    const filteredSlots = user.timeSlots
                      .filter(
                        slot => !dayFilter || slot.startsWith(dayFilter + "_")
                      )
                      .map(slot => formatLocalRange(slot));

                    if (filteredSlots.length === 0) return null;

                    // Deduplicate and sort time slots by start time
                    const sortedSlots = [...new Set(filteredSlots)].sort(
                      (a, b) => {
                        const startA = a.split("-")[0];
                        const startB = b.split("-")[0];
                        return startA.localeCompare(startB);
                      }
                    );

                    // Group continuous time slots into ranges
                    const ranges: { start: string; end: string }[] = [];
                    for (const slot of sortedSlots) {
                      const [start, end] = slot.split("-");
                      const lastRange = ranges[ranges.length - 1];

                      // Check if this slot continues from the last range
                      if (lastRange && lastRange.end === start) {
                        // Extend the current range
                        lastRange.end = end;
                      } else {
                        // Start a new range
                        ranges.push({ start, end });
                      }
                    }

                    // Format ranges for display
                    const displayText = ranges
                      .map(r => `${r.start}–${r.end}`)
                      .join(", ");

                    return (
                      <div className="text-xs text-muted-foreground/60 pt-1">
                        {displayText}
                      </div>
                    );
                  })()}
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={getColorForBadge(user.primaryRole)}>
                  {user.primaryRole}
                </Badge>
                {user.secondaryRole && (
                  <Badge
                    variant="outline"
                    className={getColorForBadge(user.secondaryRole)}
                  >
                    {user.secondaryRole}
                  </Badge>
                )}
              </div>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={handleDeleteClick}
                  onPointerDown={e => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {canRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleRemoveClick}
                >
                  Xóa
                </Button>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{user.notes ? user.notes : "Không có ghi chú"}</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{user.name}</strong>? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default UserCard;
