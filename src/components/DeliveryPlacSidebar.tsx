import { Sidebar } from "@/components/ui/sidebar";
import React from "react";

interface DeliveryPlacSidebarProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const DeliveryPlacSidebar: React.FC<DeliveryPlacSidebarProps> = ({
  header,
  children,
  footer,
}) => {
  return (
    <Sidebar className="w-72 bg-white border-l h-full flex flex-col shadow-lg z-50">
      {header && <div className="p-4 border-b">{header}</div>}
      <div className="flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="p-4 border-t">{footer}</div>}
    </Sidebar>
  );
};
