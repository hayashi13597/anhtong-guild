"use client";

import { RegistrationForm } from "@/components/guild-war/RegistrationForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="max-w-7xl mx-auto py-6 lg:py-20 px-4 space-y-6 lg:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/guild-war">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold">
            Đăng ký Bang Chiến
          </h1>
        </div>
      </div>

      {/* Region Tabs */}
      <Tabs defaultValue="VN">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="VN">VN Server</TabsTrigger>
          <TabsTrigger value="NA">NA Server</TabsTrigger>
        </TabsList>

        <TabsContent value="VN" className="pt-6">
          <div className="w-full max-w-md">
            <RegistrationForm defaultRegion="vn" />
          </div>
        </TabsContent>

        <TabsContent value="NA" className="pt-6">
          <div className="w-full max-w-md">
            <RegistrationForm defaultRegion="na" />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
