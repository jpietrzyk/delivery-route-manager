import { BackToDeliveriesLink } from "@/components/ui/orders-count-display";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { pl } from "@/lib/translations";
import { MapPin, Map, RefreshCcw } from "lucide-react";

interface MapControlsProps {
  totalOrdersCount: number;
  totalAvailableOrders: number;
  onResetFilters?: () => void;
  onResetData?: () => void;
  currentMapProvider?: "leaflet" | "mapy";
  onMapProviderChange?: (provider: "leaflet" | "mapy") => void;
}

export function MapControls({
  totalOrdersCount,
  totalAvailableOrders,
  onResetFilters,
  onResetData,
  currentMapProvider = "leaflet",
  onMapProviderChange,
}: MapControlsProps) {
  return (
    <NavigationMenu className="absolute top-4 left-16 z-20" viewport={false}>
      <NavigationMenuList className="gap-2">
        <NavigationMenuItem>
          <BackToDeliveriesLink />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <OrdersCountDisplay
            count={totalOrdersCount}
            totalCount={totalAvailableOrders}
            onResetFilters={onResetFilters}
          />
        </NavigationMenuItem>
        {onResetData && (
          <NavigationMenuItem>
            <button
              onClick={onResetData}
              className="border border-border/50 bg-background/50 hover:bg-accent/50 text-sm font-medium px-3 py-2 rounded shadow-sm transition-colors inline-flex items-center gap-2 h-9"
              aria-label="Reset data"
            >
              <RefreshCcw className="h-4 w-4" />
              {pl.reset}
            </button>
          </NavigationMenuItem>
        )}
        {onMapProviderChange && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="border border-border/50 bg-background/50 hover:bg-accent/50 text-sm font-medium px-3 py-2 rounded shadow-sm transition-colors inline-flex items-center gap-2 h-9">
              {currentMapProvider === "mapy" ? (
                <>
                  <Map className="h-4 w-4" />
                  Mapy.cz
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Leaflet
                </>
              )}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-48 p-1.5 bg-background/95 backdrop-blur-sm border border-border/50 rounded shadow-sm">
                <button
                  onClick={() => onMapProviderChange("leaflet")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                    currentMapProvider === "leaflet"
                      ? "bg-green-50 text-green-700 border border-green-300 font-medium"
                      : "border border-transparent hover:bg-accent hover:border-border/50"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Leaflet
                </button>
                <button
                  onClick={() => onMapProviderChange("mapy")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                    currentMapProvider === "mapy"
                      ? "bg-blue-50 text-blue-700 border border-blue-300 font-medium"
                      : "border border-transparent hover:bg-accent hover:border-border/50"
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Mapy.cz
                </button>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
