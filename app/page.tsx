import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlcoholTracker } from "@/components/alcohol/AlcoholTracker";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Health Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">Track and analyze your health habits</p>
        </div>

        <Tabs defaultValue="alcohol">
          <TabsList className="mb-6">
            <TabsTrigger value="alcohol">Alcohol</TabsTrigger>
          </TabsList>

          <TabsContent value="alcohol">
            <AlcoholTracker />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
