import { Building2, Calendar, Settings, Users, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const menuItems = [
  { id: "schedule", label: "Schedule Product", icon: Calendar, active: true },
  { id: "payment", label: "Payment Adjustment", icon: BarChart3 },
  { id: "role", label: "Role Management", icon: Users },
  { id: "commission", label: "Commission Rate Adjustment", icon: FileText },
  { id: "notification", label: "Notification Settings", icon: Settings },
  { id: "exchange", label: "Exchange Rate Setting", icon: Building2 },
];

export function Sidebar({ activeItem = "schedule", onItemClick }: SidebarProps) {
  return (
    <div className="w-64 bg-sidebar-bg text-primary-foreground h-screen">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">HKTV Admin</h1>
            <p className="text-sm opacity-80">Management System</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors",
                activeItem === item.id
                  ? "bg-primary-foreground text-primary font-medium"
                  : "hover:bg-sidebar-hover text-primary-foreground/90"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}