import React from "react";
import { CompleteSidebar } from "@/components/ui/sidebar";
import type {
  CompleteSidebarProps,
  NavigationItem,
} from "@/components/ui/sidebar";

const ExampleWithDesktopSidebar: React.FC = () => {
  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      href: "/",
      active: true,
    },
    {
      title: "Maps",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
      href: "/maps",
    },
    {
      title: "Projects",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      ),
      href: "/projects",
      badge: "3",
    },
    {
      title: "Analytics",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      href: "/analytics",
    },
    {
      title: "Settings",
      icon: () => (
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      href: "/settings",
    },
  ];

  const sidebarProps: CompleteSidebarProps = {
    collapsible: true,
    mobile: false,
    defaultCollapsed: false,
    header: {
      logo: (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
          P
        </div>
      ),
      title: "PFS Maps",
    },
    navigation: navigationItems,
    footer: {
      user: {
        name: "John Doe",
        email: "john.doe@profistahl.com",
      },
    },
  };

  return (
    <div className="flex h-screen">
      <CompleteSidebar {...sidebarProps} />
      <main className="flex-1 bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight">
            PFS Maps Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your mapping dashboard. Navigate using the sidebar to
            access different sections.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold">Active Maps</h3>
              <p className="text-sm text-muted-foreground">
                5 maps currently active
              </p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold">Data Points</h3>
              <p className="text-sm text-muted-foreground">1,234 data points</p>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold">Uptime</h3>
              <p className="text-sm text-muted-foreground">99.9% uptime</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ExampleWithMobileSidebar: React.FC = () => {
  const sidebarProps: CompleteSidebarProps = {
    collapsible: false,
    mobile: true,
    header: {
      title: "PFS Maps",
    },
    footer: {
      user: {
        name: "John Doe",
        email: "john.doe@profistahl.com",
      },
    },
  };

  return (
    <div className="p-4">
      <CompleteSidebar {...sidebarProps} />
      <main className="mt-4 bg-background">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight">
            PFS Maps Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Mobile view with collapsible sidebar.
          </p>
        </div>
      </main>
    </div>
  );
};

export { ExampleWithDesktopSidebar, ExampleWithMobileSidebar };
