export {
  Sidebar,
  SidebarHeader,
  SidebarNavigation,
  SidebarFooter,
  MobileSidebarTrigger,
  CompleteSidebar,
} from "@/components/ui/sidebar";
                </svg>
              </Toggle>
              <ItemContent>
                <ItemTitle>{trimCustomerName(order.customer)}</ItemTitle>
                <ItemDescription>{order.name.slice(0, 40)}</ItemDescription>
              </ItemContent>
            </Item>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <div className="space-y-2">
            <div className="font-bold text-base">{order.name}</div>
            <div className="text-muted-foreground">
              <strong>Customer:</strong> {order.customer}
            </div>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <span>{order.status.toUpperCase()}</span>
            </div>
            <div>
              <strong>Priority:</strong> {order.priority.toUpperCase()}
            </div>
            <div className="text-green-600">
              <strong>📍 Location:</strong> {order.location.lat.toFixed(4)},{" "}
              {order.location.lng.toFixed(4)}
            </div>
            {order.totalAmount && (
              <div>
                <strong>Total:</strong> €{order.totalAmount.toLocaleString()}
              </div>
            )}
            {order.comment && (
              <div className="mt-2 pt-2 border-t text-muted-foreground italic">
                {order.comment}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Order Item Component for Inactive Orders
  const InactiveOrderItem = ({ order }: { order: Order }) => {
    return (
      <Item>
        <Toggle
          pressed={false}
          onPressedChange={(pressed) => {
            if (pressed) {
              handleOrderStateChange(order, true);
            }
          }}
          size="sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </Toggle>
        <ItemContent>
          <ItemTitle>{trimCustomerName(order.customer)}</ItemTitle>
          <ItemDescription>{order.name.slice(0, 15)}</ItemDescription>
        </ItemContent>
      </Item>
    );
  };

  // Inline styles to ensure visibility
  // ...no custom sidebarStyle or buttonStyle

  return (
    <div className={className}>
      {/* Header */}
      <div>{/* ...keep shadcn/ui default header and button */}</div>

      {/* Content Section */}
      <nav>
        {!collapsed && children ? (
          <div>{children}</div>
        ) : !collapsed ? (
          <>
            <div>
              <span>🚚 Delivery Route</span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={routeOrders.map((order) => order.id)}
                strategy={verticalListSortingStrategy}
              >
                <ItemGroup>
                  {routeOrders.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </ItemGroup>
              </SortableContext>
            </DndContext>
          </>
        ) : (
          <div>
            <span>ROUTE</span>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div>
        {!collapsed && (
          <div>
            <p>© PFS 2025</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
