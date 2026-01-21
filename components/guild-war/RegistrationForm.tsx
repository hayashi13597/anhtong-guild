"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useGuildWarStore } from "@/stores/eventStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const signupSchema = z.object({
  username: z.string().min(1, "Tên nhân vật là bắt buộc"),
  classes: z.string().min(1, "Lớp nhân vật là bắt buộc"),
  role: z.enum(["dps", "healer", "tank"], { message: "Vai trò là bắt buộc" }),
  region: z.enum(["vn", "na"], { message: "Server là bắt buộc" })
});

type SignupFormData = z.infer<typeof signupSchema>;

interface RegistrationFormProps {
  defaultRegion?: "vn" | "na";
}

export function RegistrationForm({ defaultRegion }: RegistrationFormProps) {
  const registerUser = useGuildWarStore(state => state.registerUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultValues: SignupFormData = {
    username: "",
    classes: "",
    role: "dps",
    region: defaultRegion ?? "vn"
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await registerUser({
        username: data.username,
        region: data.region,
        classes: data.classes,
        role: data.role
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
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên nhân vật"
                disabled={isLoading}
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <FieldDescription className="text-destructive">
                  {errors.username.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="classes">Lớp nhân vật</FieldLabel>
              <Input
                id="classes"
                type="text"
                placeholder="VD: Quạt dù/Silkbind"
                disabled={isLoading}
                aria-invalid={!!errors.classes}
                {...register("classes")}
              />
              {errors.classes && (
                <FieldDescription className="text-destructive">
                  {errors.classes.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Vai trò</FieldLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role" aria-invalid={!!errors.role}>
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
              {errors.role && (
                <FieldDescription className="text-destructive">
                  {errors.role.message}
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
