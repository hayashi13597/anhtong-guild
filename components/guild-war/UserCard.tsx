import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
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
import { formatClasses } from "@/lib/classes";
import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { type TeamMember } from "@/stores/eventStore";
import { Badge } from "../ui/badge";

function UserCard({
  user,
  className,
  containerId,
  isAdmin,
  onDelete,
  isMobile,
  isSelected,
  onSelect,
  onRemove
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
  const canRemove =
    isMobile && !isAvailableList && onRemove;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    if (isMobile && onSelect) {
      onSelect(user.id, containerId);
    }
  };

  return (
    <>
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
            {user.timeSlots && user.timeSlots.length > 0 && (
              <div className="text-xs text-muted-foreground/60 pt-1">
                {user.timeSlots.map(slot => slot.split("_")[1]).join(", ")}
              </div>
            )}
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
