import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <main className="max-w-2xl min-h-screen mx-auto py-6 lg:py-20 px-4">
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </main>
  );
};

export default Loading;
