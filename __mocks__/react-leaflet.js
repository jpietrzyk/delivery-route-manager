// Mock for react-leaflet to avoid ES module issues in Jest
const React = require('react');

// Mock MapContainer
const MapContainer = ({ children, ...props }) => {
  return React.createElement('div', { ...props }, children);
};

// Mock TileLayer
const TileLayer = () => React.createElement('div');

// Mock Marker
const Marker = ({ children, ...props }) => {
  return React.createElement('div', { ...props }, children);
};

// Mock Popup
const Popup = ({ children, ...props }) => {
  return React.createElement('div', { ...props }, children);
};

// Mock Polyline
const Polyline = () => React.createElement('div');

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
