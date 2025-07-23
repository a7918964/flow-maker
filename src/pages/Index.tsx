import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProductSchedule } from "@/components/ProductSchedule";
import { Badge } from "@/components/ui/badge";
import { Globe, User } from "lucide-react";

const Index = () => {
  const [activeMenuItem, setActiveMenuItem] = useState("schedule");

  const renderContent = () => {
    switch (activeMenuItem) {
      case "schedule":
        return <ProductSchedule />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">功能開發中</h1>
            <p className="text-muted-foreground">此功能正在開發中，敬請期待。</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeItem={activeMenuItem} onItemClick={setActiveMenuItem} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Home / Schedule Product
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">English</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                17
              </Badge>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Serati Ma</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-background">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
