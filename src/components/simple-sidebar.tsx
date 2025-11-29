import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Folder,
  Map,
  BarChart3,
  Layers,
} from "lucide-react";

interface SimpleSidebarProps {
  className?: string;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({ className = "" }) => {
  const [collapsed, setCollapsed] = useState(false);

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      active: true,
    },
    {
      title: "Maps",
      icon: Map,
      href: "/maps",
    },
    {
      title: "Layers",
      icon: Layers,
      href: "/layers",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      title: "Team",
      icon: Users,
      href: "/team",
    },
    {
      title: "Projects",
      icon: Folder,
      href: "/projects",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div
      className={`
      flex h-full flex-col bg-white border-r border-gray-200
      transition-all duration-300 ease-in-out shadow-lg
      ${collapsed ? "w-16" : "w-64"}
      ${className}
    `}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold text-sm">
              P
            </div>
            <h2 className="font-semibold text-gray-900">PFS Maps</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                hover:bg-gray-100 hover:text-gray-900
                focus:bg-gray-100 focus:text-gray-900 focus:outline-none
                ${
                  item.active
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600"
                }
                ${collapsed ? "justify-center px-2" : ""}
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-700 text-sm font-medium">
            <span className="text-xs">JD</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-gray-500 truncate">
                john.doe@profistahl.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleSidebar;
