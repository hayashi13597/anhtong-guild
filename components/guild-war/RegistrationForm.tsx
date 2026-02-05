"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { type TimeSlot } from "@/lib/api";
import { classDisplayNames, classEnum, type ClassType } from "@/lib/classes";
import { useGuildWarStore } from "@/stores/eventStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const NA_TIMEZONES = [
  { value: "America/New_York", label: "ET (New York)" },
  { value: "America/Chicago", label: "CT (Chicago)" },
  { value: "America/Denver", label: "MT (Denver)" },
  { value: "America/Los_Angeles", label: "PT (Los Angeles)" },
  { value: "America/Anchorage", label: "AKT (Anchorage)" },
  { value: "Pacific/Honolulu", label: "HT (Honolulu)" }
];

const EST_OFFSET_HOURS = 5;
const SLOT_REFERENCE_DATES: Record<"sat" | "sun", string> = {
  sat: "2025-01-04",
  sun: "2025-01-05"
};

const signupSchema = z
  .object({
    username: z.string().min(1, "Tên nhân vật là bắt buộc"),
    primaryClass1: z.enum(classEnum, { message: "Lớp chính 1 là bắt buộc" }),
    primaryClass2: z.enum(classEnum, { message: "Lớp chính 2 là bắt buộc" }),
    secondaryClass1: z.enum(classEnum).optional(),
    secondaryClass2: z.enum(classEnum).optional(),
    primaryRole: z.enum(["dps", "healer", "tank"], {
      message: "Vai trò chính là bắt buộc"
    }),
    secondaryRole: z.enum(["dps", "healer", "tank"]).optional(),
    region: z.enum(["vn", "na"], { message: "Server là bắt buộc" }),
    timeSlots: z
      .array(z.string())
      .min(1, "Phải chọn ít nhất 1 khung giờ")
      .refine(
        slots =>
          slots.every(slot =>
            [
              "sat_19:30-20:00",
              "sat_20:00-20:30",
              "sat_20:30-21:00",
              "sat_21:00-21:30",
              "sat_21:30-22:00",
              "sat_22:00-22:30",
              "sun_19:30-20:00",
              "sun_20:00-20:30",
              "sun_20:30-21:00",
              "sun_21:00-21:30",
              "sun_21:30-22:00",
              "sun_22:00-22:30"
            ].includes(slot)
          ),
        { message: "Khung giờ không hợp lệ" }
      ),
    notes: z.string().optional()
  })
  .refine(data => data.primaryClass1 !== data.primaryClass2, {
    message: "Hai lớp chính không được trùng nhau",
    path: ["primaryClass2"]
  })
  .refine(
    data => {
      if (data.secondaryClass1 && data.secondaryClass2) {
        return data.secondaryClass1 !== data.secondaryClass2;
      }
      return true;
    },
    {
      message: "Hai lớp phụ không được trùng nhau",
      path: ["secondaryClass2"]
    }
  )
  .refine(
    data => {
      // Both secondary classes must be filled or both empty
      const has1 = !!data.secondaryClass1;
      const has2 = !!data.secondaryClass2;
      return has1 === has2;
    },
    {
      message: "Phải điền cả 2 lớp phụ hoặc để trống cả 2",
      path: ["secondaryClass2"]
    }
  );

type SignupFormData = z.infer<typeof signupSchema>;

interface RegistrationFormProps {
  defaultRegion?: "vn" | "na";
}

function getDetectedTimeZone(): string {
  if (typeof Intl === "undefined") return "America/New_York";
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York";
}

function parseTime(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

function buildEstDate(dayKey: "sat" | "sun", time: string): Date {
  const [year, month, day] = SLOT_REFERENCE_DATES[dayKey]
    .split("-")
    .map(Number);
  const { hour, minute } = parseTime(time);
  return new Date(
    Date.UTC(year, month - 1, day, hour + EST_OFFSET_HOURS, minute)
  );
}

function formatSlotLabel(slot: string, timeZone: string): string {
  const [dayKey, range] = slot.split("_") as ["sat" | "sun", string];
  const [start, end] = range.split("-");
  const startDate = buildEstDate(dayKey, start);
  const endDate = buildEstDate(dayKey, end);

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone
  });

  const toParts = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const day = parts.find(part => part.type === "weekday")?.value ?? "";
    const hour = parts.find(part => part.type === "hour")?.value ?? "";
    const minute = parts.find(part => part.type === "minute")?.value ?? "";
    return { day, time: `${hour}:${minute}` };
  };

  const startParts = toParts(startDate);
  const endParts = toParts(endDate);

  if (startParts.day !== endParts.day) {
    return `${startParts.day} ${startParts.time} - ${endParts.day} ${endParts.time}`;
  }

  return `${startParts.day} ${startParts.time} - ${endParts.time}`;
}

export function RegistrationForm({ defaultRegion }: RegistrationFormProps) {
  const registerUser = useGuildWarStore(state => state.registerUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const detectedTimeZone = getDetectedTimeZone();
  const naTimeZone = detectedTimeZone;

  const naTimeZoneLabel = useMemo(() => {
    return (
      NA_TIMEZONES.find(tz => tz.value === naTimeZone)?.label || naTimeZone
    );
  }, [naTimeZone]);

  const defaultValues: SignupFormData = {
    username: "",
    primaryClass1: "strategicSword",
    primaryClass2: "heavenquakerSpear",
    secondaryClass1: undefined,
    secondaryClass2: undefined,
    primaryRole: "dps",
    secondaryRole: undefined,
    region: defaultRegion ?? "vn",
    timeSlots: [],
    notes: ""
  };

  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues
  });
  const selectedRegion = watch("region");
  const isNaRegion = selectedRegion === "na";

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const primaryClass: [ClassType, ClassType] = [
        data.primaryClass1,
        data.primaryClass2
      ];
      const secondaryClass: [ClassType, ClassType] | undefined =
        data.secondaryClass1 && data.secondaryClass2
          ? [data.secondaryClass1, data.secondaryClass2]
          : undefined;

      await registerUser({
        username: data.username,
        region: data.region,
        primaryClass,
        secondaryClass,
        primaryRole: data.primaryRole,
        secondaryRole: data.secondaryRole,
        timeSlots: data.timeSlots as TimeSlot[],
        notes: data.notes
      });
      setSuccess("Đăng ký thành công!");
      reset(defaultValues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký tham gia Bang Chiến</CardTitle>
        <CardDescription>
          Điền thông tin bên dưới để đăng ký tham gia Bang Chiến tuần này
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Tên nhân vật (In-game)</FieldLabel>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <input
                    id="username"
                    type="text"
                    placeholder="Nhập tên nhân vật"
                    disabled={isLoading}
                    aria-invalid={!!errors.username}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                )}
              />
              {errors.username && (
                <FieldDescription className="text-destructive">
                  {errors.username.message}
                </FieldDescription>
              )}
            </Field>

            <div className="space-y-2">
              <FieldLabel>Hướng build chính</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Controller
                    name="primaryClass1"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id="primaryClass1"
                          aria-invalid={!!errors.primaryClass1}
                        >
                          <SelectValue placeholder="Chọn lớp" />
                        </SelectTrigger>
                        <SelectContent>
                          {classEnum.map(cls => (
                            <SelectItem key={cls} value={cls}>
                              {classDisplayNames[cls]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field>
                  <Controller
                    name="primaryClass2"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id="primaryClass2"
                          aria-invalid={!!errors.primaryClass2}
                        >
                          <SelectValue placeholder="Chọn lớp" />
                        </SelectTrigger>
                        <SelectContent>
                          {classEnum.map(cls => (
                            <SelectItem key={cls} value={cls}>
                              {classDisplayNames[cls]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.primaryClass2 && (
                    <FieldDescription className="text-destructive">
                      {errors.primaryClass2.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Hướng build phụ (Tùy chọn)</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Controller
                    name="secondaryClass1"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "_none"}
                        onValueChange={value =>
                          field.onChange(value === "_none" ? undefined : value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id="secondaryClass1"
                          aria-invalid={!!errors.secondaryClass1}
                        >
                          <SelectValue placeholder="Chọn lớp (tùy chọn)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">-</SelectItem>
                          {classEnum.map(cls => (
                            <SelectItem key={cls} value={cls}>
                              {classDisplayNames[cls]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                <Field>
                  <Controller
                    name="secondaryClass2"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || "_none"}
                        onValueChange={value =>
                          field.onChange(value === "_none" ? undefined : value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger
                          id="secondaryClass2"
                          aria-invalid={!!errors.secondaryClass2}
                        >
                          <SelectValue placeholder="Chọn hướng build (tùy chọn)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">-</SelectItem>
                          {classEnum.map(cls => (
                            <SelectItem key={cls} value={cls}>
                              {classDisplayNames[cls]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.secondaryClass2 && (
                    <FieldDescription className="text-destructive">
                      {errors.secondaryClass2.message}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </div>

            <Field>
              <FieldLabel htmlFor="primaryRole">Vai trò chính</FieldLabel>
              <Controller
                name="primaryRole"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="primaryRole"
                      aria-invalid={!!errors.primaryRole}
                    >
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dps">DPS</SelectItem>
                      <SelectItem value="healer">Healer</SelectItem>
                      <SelectItem value="tank">Tank</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.primaryRole && (
                <FieldDescription className="text-destructive">
                  {errors.primaryRole.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="secondaryRole">
                Vai trò phụ (Tùy chọn)
              </FieldLabel>
              <Controller
                name="secondaryRole"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "_none"}
                    onValueChange={value =>
                      field.onChange(value === "_none" ? undefined : value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="secondaryRole"
                      aria-invalid={!!errors.secondaryRole}
                    >
                      <SelectValue placeholder="Chọn vai trò (tùy chọn)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">-</SelectItem>
                      <SelectItem value="dps">DPS</SelectItem>
                      <SelectItem value="healer">Healer</SelectItem>
                      <SelectItem value="tank">Tank</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.secondaryRole && (
                <FieldDescription className="text-destructive">
                  {errors.secondaryRole.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="region">Server</FieldLabel>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="region" aria-invalid={!!errors.region}>
                      <SelectValue placeholder="Chọn server" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vn">VN (Việt Nam)</SelectItem>
                      <SelectItem value="na">NA (North America)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.region && (
                <FieldDescription className="text-destructive">
                  {errors.region.message}
                </FieldDescription>
              )}
            </Field>

            {isNaRegion && (
              <Field>
                <FieldLabel>Múi giờ (NA)</FieldLabel>
                <FieldDescription>
                  Hiển thị theo timezone của bạn: {naTimeZoneLabel}
                </FieldDescription>
              </Field>
            )}

            <Field>
              <FieldLabel>Khung giờ tham gia *</FieldLabel>
              <FieldDescription>
                Chọn các khung giờ bạn có thể tham gia
                {isNaRegion ? ` (Đang xem theo ${naTimeZoneLabel})` : ""}
              </FieldDescription>
              <Controller
                name="timeSlots"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3 mt-2">
                    <div>
                      <div className="font-medium text-sm mb-2">
                        Thứ 7{isNaRegion ? " (timezone)" : ""}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "sat_19:30-20:00",
                          "sat_20:00-20:30",
                          "sat_20:30-21:00",
                          "sat_21:00-21:30",
                          "sat_21:30-22:00",
                          "sat_22:00-22:30"
                        ].map(slot => (
                          <div
                            key={slot}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={slot}
                              checked={field.value.includes(slot)}
                              onCheckedChange={checked => {
                                const newValue = checked
                                  ? [...field.value, slot]
                                  : field.value.filter(s => s !== slot);
                                field.onChange(newValue);
                              }}
                              disabled={isLoading}
                            />
                            <label
                              htmlFor={slot}
                              className="text-sm cursor-pointer"
                            >
                              {isNaRegion
                                ? formatSlotLabel(slot, naTimeZone)
                                : slot.split("_")[1]}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">
                        Chủ nhật{isNaRegion ? " (timezone)" : ""}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "sun_19:30-20:00",
                          "sun_20:00-20:30",
                          "sun_20:30-21:00",
                          "sun_21:00-21:30",
                          "sun_21:30-22:00",
                          "sun_22:00-22:30"
                        ].map(slot => (
                          <div
                            key={slot}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={slot}
                              checked={field.value.includes(slot)}
                              onCheckedChange={checked => {
                                const newValue = checked
                                  ? [...field.value, slot]
                                  : field.value.filter(s => s !== slot);
                                field.onChange(newValue);
                              }}
                              disabled={isLoading}
                            />
                            <label
                              htmlFor={slot}
                              className="text-sm cursor-pointer"
                            >
                              {isNaRegion
                                ? formatSlotLabel(slot, naTimeZone)
                                : slot.split("_")[1]}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              />
              {errors.timeSlots && (
                <FieldDescription className="text-destructive">
                  {errors.timeSlots.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Ghi chú (Tùy chọn)</FieldLabel>
              <FieldDescription>
                Thêm ghi chú về lịch trình hoặc yêu cầu đặc biệt
              </FieldDescription>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="notes"
                    placeholder="Nhập ghi chú của bạn..."
                    disabled={isLoading}
                    rows={3}
                    {...field}
                  />
                )}
              />
            </Field>

            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-md p-3 text-sm">
                {success}
              </div>
            )}

            <Field>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký tham gia"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
