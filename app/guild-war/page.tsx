import TeamSplitter from "@/components/guild-war/TeamSplitter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GuildWarPage = () => {
  return (
    <main className="max-w-4/5 mx-auto py-10 lg:py-20 space-y-10">
      <h1 className="text-4xl font-bold text-center">Bang Chiến</h1>

      <Tabs defaultValue="VN">
        <TabsList>
          <TabsTrigger value="VN">VN</TabsTrigger>
          <TabsTrigger value="NA">NA</TabsTrigger>
        </TabsList>
        <TabsContent value="VN">
          <TeamSplitter region="VN" />
        </TabsContent>
        <TabsContent value="NA">
          <TeamSplitter region="NA" />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default GuildWarPage;
