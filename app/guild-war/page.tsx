"use client";

import { MembersList } from "@/components/guild-war/MembersList";
import TeamSplitter from "@/components/guild-war/TeamSplitter";
import { TeamsView } from "@/components/guild-war/TeamsView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/authStore";
import { useGuildWarStore } from "@/stores/eventStore";
import { LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const GuildWarPage = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const fetchEvent = useGuildWarStore(state => state.fetchEvent);

  // Fetch event data on mount
  useEffect(() => {
    fetchEvent("VN");
    fetchEvent("NA");
  }, [fetchEvent]);

  return (
    <main className="max-w-4/5 mx-auto py-10 lg:py-20 px-4 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-center">Bang Chiến</h1>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Admin: {user?.username}</span>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Link>
          </Button>
        )}
      </div>

      {/* Region Tabs */}
      <Tabs defaultValue="VN">
        <div className="flex items-center gap-4">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="VN">VN Server</TabsTrigger>
            <TabsTrigger value="NA">NA Server</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link href="/guild-war/register">Đăng ký tham gia</Link>
          </Button>
        </div>

        <TabsContent value="VN" className="space-y-8">
          {isAuthenticated && user?.region === "vn" ? (
            // Admin view with drag & drop
            <TeamSplitter region="VN" />
          ) : (
            // Public view
            <PublicView region="VN" />
          )}
        </TabsContent>

        <TabsContent value="NA" className="space-y-8">
          {isAuthenticated && user?.region === "na" ? (
            // Admin view with drag & drop
            <TeamSplitter region="NA" />
          ) : (
            // Public view
            <PublicView region="NA" />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

function PublicView({ region }: { region: "VN" | "NA" }) {
  return (
    <div className="space-y-8 pt-6 flex gap-5">
      {/* Members Section */}
      <section className="w-1/4">
        <h2 className="text-2xl font-semibold mb-4">Danh sách đăng ký</h2>
        <div className="max-w-md">
          <MembersList region={region} />
        </div>
      </section>
      {/* Teams Section */}
      <section className="flex-1">
        <h2 className="text-2xl font-semibold mb-4">Đội hình</h2>
        <TeamsView region={region} />
      </section>
    </div>
  );
}

export default GuildWarPage;
