import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Users,
  Folder,
  User,
} from "lucide-react";

// Navigation item type
export interface NavigationItem {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

// Sidebar variants
const sidebarVariants = cva(
  "flex h-full flex-col bg-background border-r transition-all duration-300",
  {
    variants: {
      collapsed: {
        true: "w-16",
        false: "w-64",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: boolean;
  mobile?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    { className, collapsed = false, onCollapsedChange, children, ...props },
    ref
  ) => {
    const handleToggle = () => {
      onCollapsedChange?.(!collapsed);
    };

    return (
      <div
        ref={ref}
        className={cn(sidebarVariants({ collapsed }), className)}
        {...props}
      >
        {children}
        {onCollapsedChange && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggle}
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

// Sidebar header
export interface SidebarHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode;
  title?: string;
}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, logo, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-16 items-center border-b px-4", className)}
        {...props}
      >
        {logo && <div className="flex items-center gap-2">{logo}</div>}
        {title && <h2 className="font-semibold truncate">{title}</h2>}
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

// Sidebar navigation
export interface SidebarNavigationProps
  extends React.HTMLAttributes<HTMLElement> {
  items?: NavigationItem[];
}

const SidebarNavigation = React.forwardRef<HTMLElement, SidebarNavigationProps>(
  ({ className, items = [], children, ...props }, ref) => {
    const defaultItems: NavigationItem[] = [
      {
        title: "Dashboard",
        icon: Home,
        href: "/",
        active: true,
      },
      {
        title: "Projects",
        icon: Folder,
        href: "/projects",
      },
      {
        title: "Team",
        icon: Users,
        href: "/team",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/settings",
      },
    ];

    const navigationItems = items.length > 0 ? items : defaultItems;

    return (
      <nav
        ref={ref}
        className={cn("flex-1 space-y-1 p-2", className)}
        {...props}
      >
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
                item.active && "bg-accent text-accent-foreground",
                className
              )}
              aria-disabled={item.disabled}
            >
              {Icon && <Icon className="size-4" />}
              <span className="truncate">{item.title}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
        {children}
      </nav>
    );
  }
);
SidebarNavigation.displayName = "SidebarNavigation";

// Sidebar footer
export interface SidebarFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, user, children, ...props }, ref) => {
    const defaultUser = {
      name: "John Doe",
      email: "john@example.com",
      avatar: undefined,
    };

    const currentUser = user || defaultUser;

    return (
      <div ref={ref} className={cn("border-t p-4", className)} {...props}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="size-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.email}
            </p>
          </div>
        </div>
        {children}
      </div>
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";

// Mobile sidebar trigger
export interface MobileSidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MobileSidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  MobileSidebarTriggerProps
>(({ className, open = false, onOpenChange, children, ...props }, ref) => {
  const handleClick = () => {
    onOpenChange?.(!open);
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={handleClick}
      {...props}
    >
      {open ? <X className="size-4" /> : <Menu className="size-4" />}
      <span className="sr-only">{open ? "Close sidebar" : "Open sidebar"}</span>
      {children}
    </Button>
  );
});
MobileSidebarTrigger.displayName = "MobileSidebarTrigger";

// Complete sidebar component
export interface CompleteSidebarProps {
  className?: string;
  collapsible?: boolean;
  mobile?: boolean;
  defaultCollapsed?: boolean;
  header?: {
    logo?: React.ReactNode;
    title?: string;
  };
  navigation?: NavigationItem[];
  footer?: {
    user?: {
      name: string;
      email: string;
      avatar?: string;
    };
  };
}

const CompleteSidebar: React.FC<CompleteSidebarProps> = ({
  className,
  collapsible = true,
  mobile = false,
  defaultCollapsed = false,
  header,
  navigation,
  footer,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Mobile sidebar using Sheet
  if (mobile) {
    return (
      <>
        <div className="flex items-center gap-2">
          <MobileSidebarTrigger
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          />
          {header?.title && (
            <span className="font-semibold">{header.title}</span>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar className="border-0" collapsible={false}>
              <SidebarHeader logo={header?.logo} title={header?.title} />
              <SidebarNavigation items={navigation} />
              <SidebarFooter user={footer?.user} />
            </Sidebar>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop sidebar
  return (
    <Sidebar
      className={className}
      collapsible={collapsible}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
    >
      <SidebarHeader logo={header?.logo} title={header?.title} />
      <SidebarNavigation items={navigation} />
      <SidebarFooter user={footer?.user} />
    </Sidebar>
  );
};
CompleteSidebar.displayName = "CompleteSidebar";

export {
  Sidebar,
  SidebarHeader,
  SidebarNavigation,
  SidebarFooter,
  MobileSidebarTrigger,
  CompleteSidebar,
};
