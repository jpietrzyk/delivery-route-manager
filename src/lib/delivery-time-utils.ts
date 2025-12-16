// Haversine formula for straight-line distance in km
export function getDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

export function getDriveMinutes(distanceKm: number) {
  const avgTruckSpeedKmh = 60;
  return Math.round((distanceKm / avgTruckSpeedKmh) * 60);
}

export function getHandlingMinutes(complexity: number) {
  return (complexity ?? 1) * 20;
}
