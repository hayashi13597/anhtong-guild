import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { getColorForBadge } from "@/lib/color";
import { cn } from "@/lib/utils";
import { Member } from "@/types";
import { Badge } from "../ui/badge";

function UserCard({
  user,
  className,
  containerId
}: {
  user: Member;
  className?: string;
  containerId: string;
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

  return (
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
          <Badge className={getColorForBadge(user.role)}>{user.role}</Badge>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
