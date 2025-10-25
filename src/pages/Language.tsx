import { useState } from "react";
import { VettingTab } from "@/components/language/vettingTab";
import { PracticeTab } from "@/components/language/practiceTab";

export default function Language() {
  return (
    <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="hidden lg:block border-b border-border px-6 py-4">
        <h2 className="text-xl font-semibold text-foreground">Language Bridge</h2>
      </div>

      {/* Tabs */}
      {/* <Tabs defaultValue="vetting" className="h-full flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b border-border bg-transparent h-12">
          <TabsTrigger value="vetting" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            Vetting
          </TabsTrigger>
          <TabsTrigger value="practice" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            Practice
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="vetting" className="m-0 h-full">
            <VettingTab />
          </TabsContent>

          <TabsContent value="practice" className="m-0 h-full">
            <PracticeTab />
          </TabsContent>
        </div>
      </Tabs> */}
    </div>
  );
}
