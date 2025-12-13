import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Truck, Settings } from "lucide-react";

export function DeliverySidebar() {
  return (
    <Sidebar
      side="right"
      className="border-l bg-white shadow-lg z-50 flex flex-col h-full"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        Trasa D-001
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="#" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </a>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <a href="#" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Zlecenia
            </a>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <a href="#" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ustawienia
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="text-xs text-gray-500 px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
}
