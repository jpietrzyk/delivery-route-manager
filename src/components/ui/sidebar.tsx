import * as React from "react";

// Navigation item type
export interface NavigationItem {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean;
  mobile?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
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
  ({ logo, title, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {logo && <div>{logo}</div>}
        {title && <h2>{title}</h2>}
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
      <nav ref={ref} {...props}>
        {navigationItems.map((item, index) => {
          return (
            <a key={index} href={item.href} aria-disabled={item.disabled}>
              {item.title}
              {item.badge && <span>{item.badge}</span>}
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
      <div ref={ref} {...props}>
        <div>
          {currentUser.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} />
          ) : null}
          <div>
            <p>{currentUser.name}</p>
            <p>{currentUser.email}</p>
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
    <button ref={ref} onClick={handleClick} {...props}>
      {open ? "Close sidebar" : "Open sidebar"}
      {children}
    </button>
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
        <div>
          <MobileSidebarTrigger
            open={mobileOpen}
            onOpenChange={setMobileOpen}
          />
          {header?.title && <span>{header.title}</span>}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left">
            <Sidebar collapsible={false}>
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
