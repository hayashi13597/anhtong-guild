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
  onDelete
}: {
  user: TeamMember;
  className?: string;
  containerId: string;
  isAdmin?: boolean;
  onDelete?: (userId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: user.id,
    data: {
      type: "user",
      user,
      containerId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const canDelete = isAdmin && containerId === "available" && onDelete;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(user.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "p-3 border rounded-lg shadow-sm bg-background cursor-grab active:cursor-grabbing",
          isDragging && "z-50 shadow-lg",
          className
        )}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
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
