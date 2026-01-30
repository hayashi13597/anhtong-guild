"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CreateScheduleData, ScheduledNotification } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const DAYS_OPTIONS = [
  { value: "monday", label: "Thứ 2" },
  { value: "tuesday", label: "Thứ 3" },
  { value: "wednesday", label: "Thứ 4" },
  { value: "thursday", label: "Thứ 5" },
  { value: "friday", label: "Thứ 6" },
  { value: "saturday", label: "Thứ 7" },
  { value: "sunday", label: "Chủ nhật" }
];

const scheduleSchema = z.object({
  title: z.string().min(1, "Tên sự kiện là bắt buộc"),
  region: z.enum(["vn", "na"]),
  startTime: z.string().min(1, "Giờ bắt đầu là bắt buộc"),
  endTime: z.string().min(1, "Giờ kết thúc là bắt buộc"),
  notifyBeforeMinutes: z.number().min(0).max(60),
  channelId: z.string().min(1, "Channel ID là bắt buộc"),
  mentionRole: z.string().optional(),
  enabled: z.boolean(),
  days: z.array(z.string())
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  initialData?: ScheduledNotification;
  onSubmit: (data: CreateScheduleData) => Promise<void>;
  isLoading?: boolean;
  userRegion: "vn" | "na";
}

export function ScheduleForm({
  initialData,
  onSubmit,
  isLoading = false,
  userRegion
}: ScheduleFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: initialData?.title || "",
      region: initialData?.region || userRegion,
      startTime: initialData?.startTime || "19:30",
      endTime: initialData?.endTime || "22:00",
      notifyBeforeMinutes: initialData?.notifyBeforeMinutes || 15,
      channelId: initialData?.channelId || "",
      mentionRole: initialData?.mentionRole || "",
      enabled: initialData?.enabled ?? true,
      days: initialData?.days || []
    }
  });

  const onFormSubmit = async (data: ScheduleFormData) => {
    const submitData: CreateScheduleData = {
      title: data.title,
      region: data.region,
      startTime: data.startTime,
      endTime: data.endTime,
      notifyBeforeMinutes: data.notifyBeforeMinutes,
      channelId: data.channelId,
      enabled: data.enabled,
      days: data.days.length > 0 ? data.days : undefined,
      mentionRole: data.mentionRole || null
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Chỉnh sửa sự kiện" : "Thông tin sự kiện"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {/* Title */}
            <Field>
              <FieldLabel htmlFor="title">Tên sự kiện *</FieldLabel>
              <Input
                id="title"
                placeholder="Ví dụ: Bang Chiến VN"
                disabled={isLoading}
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <FieldDescription className="text-destructive">
                  {errors.title.message}
                </FieldDescription>
              )}
            </Field>

            {/* Region - Read-only, based on user's region */}
            {!isEditing && (
              <Field>
                <FieldLabel htmlFor="region">Khu vực</FieldLabel>
                <Input
                  id="region"
                  value={userRegion === "vn" ? "VN Server" : "NA Server"}
                  disabled
                  className="bg-muted"
                />
                <FieldDescription>
                  Bạn chỉ có thể tạo sự kiện cho khu vực của mình
                </FieldDescription>
              </Field>
            )}

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startTime">Giờ bắt đầu *</FieldLabel>
                <Input
                  id="startTime"
                  type="time"
                  disabled={isLoading}
                  aria-invalid={!!errors.startTime}
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <FieldDescription className="text-destructive">
                    {errors.startTime.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="endTime">Giờ kết thúc *</FieldLabel>
                <Input
                  id="endTime"
                  type="time"
                  disabled={isLoading}
                  aria-invalid={!!errors.endTime}
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <FieldDescription className="text-destructive">
                    {errors.endTime.message}
                  </FieldDescription>
                )}
              </Field>
            </div>

            {/* Days */}
            <Field>
              <FieldLabel>Ngày trong tuần</FieldLabel>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-4 pt-1">
                    {DAYS_OPTIONS.map(day => (
                      <div key={day.value} className="flex items-center gap-2">
                        <Checkbox
                          id={day.value}
                          checked={field.value.includes(day.value)}
                          disabled={isLoading}
                          onCheckedChange={checked => {
                            const newDays = checked
                              ? [...field.value, day.value]
                              : field.value.filter(d => d !== day.value);
                            field.onChange(newDays);
                          }}
                        />
                        <label
                          htmlFor={day.value}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              />
              <FieldDescription>
                Không chọn = Lặp lại hàng ngày
              </FieldDescription>
            </Field>

            {/* Notify Before */}
            <Field>
              <FieldLabel htmlFor="notifyBeforeMinutes">
                Thông báo trước (phút) *
              </FieldLabel>
              <Input
                id="notifyBeforeMinutes"
                type="number"
                min={0}
                max={60}
                disabled={isLoading}
                aria-invalid={!!errors.notifyBeforeMinutes}
                {...register("notifyBeforeMinutes", { valueAsNumber: true })}
              />
              {errors.notifyBeforeMinutes && (
                <FieldDescription className="text-destructive">
                  {errors.notifyBeforeMinutes.message}
                </FieldDescription>
              )}
            </Field>

            {/* Channel ID */}
            <Field>
              <FieldLabel htmlFor="channelId">
                Channel ID (Discord) *
              </FieldLabel>
              <Input
                id="channelId"
                placeholder="Ví dụ: 1234567890123456789"
                disabled={isLoading}
                aria-invalid={!!errors.channelId}
                {...register("channelId")}
              />
              {errors.channelId && (
                <FieldDescription className="text-destructive">
                  {errors.channelId.message}
                </FieldDescription>
              )}
            </Field>

            {/* Mention Role */}
            <Field>
              <FieldLabel htmlFor="mentionRole">
                Role để mention (tùy chọn)
              </FieldLabel>
              <Input
                id="mentionRole"
                placeholder="Ví dụ: @everyone hoặc role ID"
                disabled={isLoading}
                {...register("mentionRole")}
              />
            </Field>

            {/* Enabled */}
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FieldLabel>Kích hoạt</FieldLabel>
                  <FieldDescription>
                    Bật/tắt thông báo cho sự kiện này
                  </FieldDescription>
                </div>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Cập nhật" : "Tạo sự kiện"}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/schedule">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Link>
              </Button>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
