# PFS Maps

## Description

PFS Maps is a delivery route management application built with React and TypeScript. It provides an interactive map-based interface for visualizing and managing delivery routes, orders, and waypoints.

### Key Features

- **Dual Map Provider Support**: Seamlessly switch between Leaflet and Mapy.cz map providers
- **Interactive Route Management**: Drag-and-drop waypoint reordering with real-time route recalculation
- **Advanced Order Filtering**: Filter orders by priority (low/medium/high), status (pending/in-progress/completed/cancelled), amount, complexity, and update date
- **Delivery Route Visualization**: View assigned orders on delivery routes and manage unassigned orders
- **Responsive UI**: Modern interface with shadcn/ui components, supporting both desktop and mobile views
- **Real-time Updates**: Live order count display showing filtered vs total orders (Zamówienia: X / Y)

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Maps**: Leaflet, Mapy.cz SDK
- **State Management**: React Context API with custom hooks
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, TypeScript strict mode

## Od jacka

### Development

- Netlify functions arte in ... netlify/functions directory
- As app needs orders data (even mocked) use netlify dev for development app server
  - Netlify dev is run by default when `pnpm run dev` is launched

- AppScript for prepare json
