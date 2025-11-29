# Shadcn UI Sidebar Component

This directory contains a complete sidebar component implementation based on Shadcn UI design patterns and components.

## Components

### Main Sidebar Components

- **`Sidebar`** - Core sidebar container with collapsible functionality
- **`SidebarHeader`** - Header section with logo and title support
- **`SidebarNavigation`** - Navigation menu with customizable items
- **`SidebarFooter`** - Footer section with user information
- **`MobileSidebarTrigger`** - Mobile menu trigger button
- **`CompleteSidebar`** - Ready-to-use complete sidebar component

### Supporting Components

- **`ScrollArea`** - Radix UI scroll area component
- **`Sheet`** - Radix UI sheet/dialog component for mobile

## Features

### ✅ Desktop Sidebar
- Collapsible functionality (w-16 collapsed, w-64 expanded)
- Smooth transitions and animations
- Customizable navigation items
- User profile in footer
- Collapsible toggle button

### ✅ Mobile Sidebar
- Sheet-based slide-out navigation
- Mobile-optimized trigger button
- Touch-friendly interface
- Responsive design

### ✅ Design System
- Follows Shadcn UI "new-york" style
- Uses Radix UI primitives
- Supports dark mode via CSS variables
- Accessible navigation with proper ARIA attributes

## Usage Examples

### Basic Desktop Sidebar

```tsx
import { CompleteSidebar } from "@/components/ui/sidebar";
import type { NavigationItem } from "@/components/ui/sidebar";

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: Home, // Lucide React icon
    href: "/",
    active: true,
  },
  {
    title: "Projects",
    icon: Folder,
    href: "/projects",
    badge: "3", // Optional badge
  },
];

const sidebarProps = {
  collapsible: true,
  mobile: false,
  defaultCollapsed: false,
  header: {
    logo: <YourLogo />,
    title: "Your App",
  },
  navigation: navigationItems,
  footer: {
    user: {
      name: "John Doe",
      email: "john@example.com",
      avatar: "/avatar.jpg", // Optional
    },
  },
};

<CompleteSidebar {...sidebarProps} />
```

### Mobile Sidebar

```tsx
const mobileSidebarProps = {
  collapsible: false,
  mobile: true,
  header: {
    title: "Your App",
  },
  footer: {
    user: {
      name: "John Doe",
      email: "john@example.com",
    },
  },
};

<CompleteSidebar {...mobileSidebarProps} />
```

### Individual Components

You can also use individual components for more control:

```tsx
<Sidebar collapsible={true} defaultCollapsed={false}>
  <SidebarHeader
    logo={<YourLogo />}
    title="Your App"
  />
  <SidebarNavigation items={navigationItems} />
  <SidebarFooter user={userInfo} />
</Sidebar>
```

## NavigationItem Interface

```tsx
interface NavigationItem {
  title: string;          // Display text
  icon?: ComponentType<{ className?: string }>; // Lucide React icon
  href?: string;          // Link URL
  badge?: string;         // Optional badge text
  active?: boolean;       // Highlight as active
  disabled?: boolean;     // Disable the item
}
```

## Customization

### CSS Classes
The component uses Shadcn UI CSS classes and supports customization through:

- `className` prop for custom styling
- Tailwind CSS custom properties
- CSS variables for theme colors

### Icons
Uses Lucide React icons. Import icons from `lucide-react`:

```tsx
import { Home, Settings, User } from "lucide-react";
```

## Dependencies

- `@radix-ui/react-dialog` - For Sheet component
- `@radix-ui/react-scroll-area` - For ScrollArea component
- `@radix-ui/react-slot` - For Button component
- `class-variance-authority` - For component variants
- `clsx` - For conditional classes
- `lucide-react` - For icons
- `tailwind-merge` - For class merging

## Installation

The required dependencies were automatically added:

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-scroll-area
```

## Testing

To test the sidebar component:

1. Uncomment the `ExampleWithDesktopSidebar` in `src/App.tsx`
2. Run the development server: `pnpm dev`
3. The sidebar will appear with default navigation items
4. Test the collapsible functionality
5. Test on mobile to see the mobile version

## Example Implementation

See `src/components/sidebar-example.tsx` for complete implementation examples including:

- `ExampleWithDesktopSidebar` - Full desktop sidebar with custom navigation
- `ExampleWithMobileSidebar` - Mobile-optimized sidebar

Both examples demonstrate proper usage patterns and styling.

## File Structure

```
src/components/ui/
├── sidebar.tsx          # Main sidebar components
├── sheet.tsx           # Sheet component for mobile
├── scroll-area.tsx     # Scroll area component
└── button.tsx          # Button component (existing)

src/components/
├── sidebar-example.tsx # Usage examples
└── SIDEBAR_README.md   # This documentation
```

## Accessibility

The sidebar component includes:

- Proper ARIA attributes for navigation
- Keyboard navigation support
- Screen reader friendly labels
- Focus management
- Semantic HTML structure

## Responsive Design

- **Desktop**: Fixed sidebar with collapse/expand functionality
- **Mobile**: Sheet-based overlay navigation
- **Tablet**: Adapts to screen size automatically

---

This sidebar component provides a complete, accessible, and customizable navigation solution following modern React and Shadcn UI best practices.
