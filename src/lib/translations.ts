/**
 * Polish translations for the UI
 * Simple translation approach without i18n library
 */

export const pl = {
  // Common
  close: "Zamknij",
  orders: "Zamówienia",

  // Order management
  unassignedOrders: "Nieprzypisane zamówienia",
  unassigned: "Nieprzypisane",
  assignedOrders: "Przypisane zamówienia",
  noOrdersAssigned: "Brak przypisanych zamówień",
  noUnassignedOrders: "Brak nieprzypisanych zamówień",
  noOrdersAssignedShort: "Brak przypisanych zamówień",
  availableUnassignedOrders: "Dostępne nieprzypisane zamówienia",

  // Order count
  order: "zamówienie",
  orders_plural: "zamówienia",
  orders_many: "zamówień",
  waiting: "oczekuje",

  // Map popup
  poolOrder: "📦 Zamówienie z puli (nieprzypisane)",
  deliveryOrder: "🚛 Zamówienie dostawy (przypisane)",
  customer: "Klient",
  status: "Status",
  priorityLabel: "Priorytet",
  location: "Lokalizacja",
  total: "Suma",
  unknownOrder: "Nieznane zamówienie",
  productDetails: "Szczegóły produktu",
  notes: "Notatki",
  totalAmountLabel: "Kwota całkowita",
    totalOrders: "📦 Łącznie zamówień",
    allOrdersAssigned: "Wszystkie zamówienia są przypisane! 🎉",

  // Deliveries list
  delivery: "Dostawa",
  plannedDeliveries: "Planowane dostawy",
  viewAllOnMap: "Zobacz wszystkie na mapie",
  backToDeliveries: "Powrót do dostaw",
  loadingDeliveries: "Ładowanie dostaw...",
  noDeliveriesFound: "Brak dostaw",

  // Reset filters dialog
  resetFilters: "Resetuj filtry",
  resetFiltersTitle: "Resetować filtry?",
  resetFiltersDescription: "Czy na pewno chcesz zresetować wszystkie filtry? Przywróci to domyślne ustawienia filtrów.",
  cancel: "Anuluj",
  createDeliveryPrompt: "Rozpocznij, tworząc nową dostawę.",
  details: "Szczegóły",
  viewWithLeaflet: "Zobacz w Leaflet",
  viewWithMapy: "Zobacz w Mapy.cz",
  deliveryDetails: "Szczegóły dostawy",
  deliveryInfo: "Informacje o wybranej dostawie",
  deliveryIdLabel: "ID dostawy",
  nameLabel: "Nazwa",
  loadDeliveriesError: "Nie udało się załadować dostaw. Spróbuj ponownie później.",

  // Actions
  addToDelivery: "Dodaj do dostawy",
  removeFromDelivery: "Usuń z dostawy",
  refreshRoute: "Odśwież trasę",
  recalculating: "Przeliczanie...",
  reset: "Resetuj dane",

  // Route segment
  distance: "Odległość",
  duration: "Czas",
  route: "Trasa",

  // Time units
  hours: "godz",
  minutes: "min",
  hour_short: "h",
  minute_short: "m",

  // Priorities
  priorityLow: "Niski",
  priorityMedium: "Średni",
  priorityHigh: "Wysoki",

  // Statuses
  statusPending: "Oczekujące",
  statusInProgress: "W trakcie",
  statusCompleted: "Zakończone",
  statusCancelled: "Anulowane",

  // Filters
  filters: "Filtry",
  priority: "Priorytet",
  amount: "Kwota",
  complexity: "Złożoność",
  updatedAt: "Data aktualizacji",

  // Amount tiers
  amountLow: "Niska (do 10k)",
  amountMedium: "Średnia (10k-100k)",
  amountHigh: "Wysoka (powyżej 100k)",

  // Complexity tiers
  complexitySimple: "Prosta (30 min)",
  complexityModerate: "Średnia (60 min)",
  complexityComplex: "Złożona (90 min)",

  // Updated at periods
  updatedRecent: "Ostatni tydzień",
  updatedModerate: "1-4 tygodnie",
  updatedOld: "Starsze niż miesiąc",

  // Aria labels
  ariaRemoveOrder: "Usuń zamówienie",
  ariaInfoAboutOrder: "Informacje o zamówieniu",
  ariaRefreshRoute: "Odśwież trasę",
  ariaRecalculating: "Przeliczanie...",
} as const;

/**
 * Helper function to get proper Polish plural form
 * Polish has 3 forms: 1, 2-4, 5+
 */
export function getOrdersCountText(count: number): string {
  if (count === 1) {
    return `${count} ${pl.order} ${pl.waiting}`;
  } else if (count >= 2 && count <= 4) {
    return `${count} ${pl.orders_plural} ${pl.waiting}`;
  } else {
    return `${count} ${pl.orders_many} ${pl.waiting}`;
  }
}

/**
 * Format duration in Polish
 */
export function formatDurationPL(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} ${pl.hour_short} ${minutes} ${pl.minute_short}`;
  } else {
    return `${minutes} ${pl.minute_short}`;
  }
}
