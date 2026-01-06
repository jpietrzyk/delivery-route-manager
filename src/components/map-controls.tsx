import { DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BackToDeliveriesLink } from "@/components/ui/orders-count-display";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { pl } from "@/lib/translations";

interface MapControlsProps {
  totalOrdersCount: number;
  totalAvailableOrders: number;
  filteredUnassignedOrdersCount: number;
  onResetFilters?: () => void;
}

export function MapControls({
  totalOrdersCount,
  totalAvailableOrders,
  filteredUnassignedOrdersCount,
  onResetFilters,
}: MapControlsProps) {
  return (
    <NavigationMenu className="absolute top-4 left-16 z-20">
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <BackToDeliveriesLink />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <DrawerTrigger asChild>
            <Button
              className="border border-border/50 bg-background/50 hover:bg-accent/50 text-sm font-medium px-3 py-2 rounded shadow-sm transition-colors inline-flex items-center gap-2 h-9"
              variant="ghost"
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              {pl.unassigned} ({filteredUnassignedOrdersCount})
            </Button>
          </DrawerTrigger>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <OrdersCountDisplay
            count={totalOrdersCount}
            totalCount={totalAvailableOrders}
            onResetFilters={onResetFilters}
          />
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
