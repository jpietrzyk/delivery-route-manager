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
  currentMapProvider?: "leaflet" | "mapy" | "here";
  onMapProviderChange?: (provider: "leaflet" | "mapy" | "here") => void;
}

export function MapControls({
  totalOrdersCount,
  totalAvailableOrders,
  onResetFilters,
  onResetData,
  currentMapProvider = "leaflet",
  onMapProviderChange,
}: MapControlsProps) {
  const getMapProviderLabel = () => {
    switch (currentMapProvider) {
      case "mapy":
        return (
          <>
            <Map className="h-4 w-4" />
            {pl.mapycz}
          </>
        );
      case "here":
        return (
          <>
            <Map className="h-4 w-4" />
            {pl.here}
          </>
        );
      default:
        return (
          <>
            <MapPin className="h-4 w-4" />
            {pl.leaflet}
          </>
        );
    }
  };

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
              aria-label={pl.reset}
            >
              <RefreshCcw className="h-4 w-4" />
              {pl.reset}
            </button>
          </NavigationMenuItem>
        )}
        {onMapProviderChange && (
          <NavigationMenuItem>
            <NavigationMenuTrigger className="border border-border/50 bg-background/50 hover:bg-accent/50 text-sm font-medium px-3 py-2 rounded shadow-sm transition-colors inline-flex items-center gap-2 h-9">
              {getMapProviderLabel()}
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-transparent border-none shadow-none">
              <div className="w-48 p-1.5 bg-background/80 rounded shadow-sm">
                <button
                  onClick={() => onMapProviderChange("leaflet")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                    currentMapProvider === "leaflet"
                      ? "bg-accent/50 text-green-700 font-medium"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  {pl.leaflet}
                </button>
                <button
                  onClick={() => onMapProviderChange("mapy")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                    currentMapProvider === "mapy"
                      ? "bg-accent/50 text-blue-700 font-medium"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Map className="h-4 w-4" />
                  {pl.mapycz}
                </button>
                <button
                  onClick={() => onMapProviderChange("here")}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors ${
                    currentMapProvider === "here"
                      ? "bg-accent/50 text-purple-700 font-medium"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Map className="h-4 w-4" />
                  {pl.here}
                </button>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
