// Mock for react-leaflet to avoid ES module issues in Jest
const React = require('react');

// Mock MapContainer
const MapContainer = ({ children, ...props }) => {
  return React.createElement('div', { ...props }, children);
};

// Mock TileLayer
const TileLayer = () => React.createElement('div');

// Mock Marker - drop leaflet-only props so they don't leak to DOM
const Marker = ({ children, eventHandlers, icon, position, ...props }) => {
  const safeProps = { ...props };
  return React.createElement('div', safeProps, children);
};

// Mock Popup
const Popup = ({ children, ...props }) => {
  return React.createElement('div', { ...props }, children);
};

// Mock Polyline - ignore leaflet-only props to avoid React DOM warnings
const Polyline = ({ eventHandlers, pathOptions, positions, ...props }) =>
  React.createElement('div', props);

// Mock useMap hook
const useMap = () => ({
  setView: jest.fn(),
  fitBounds: jest.fn(),
  // Add other map methods as needed
});

module.exports = {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
};
