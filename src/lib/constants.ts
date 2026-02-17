export const UNIT_CATEGORIES = [
  { label: "Temperatura", units: ["°C", "°F", "K"] },
  {
    label: "Wilgotność / Środowisko",
    units: ["%", "RH%", "ppm", "ppb", "AQI"],
  },
  {
    label: "Elektryczność",
    units: ["V", "mV", "kV", "A", "mA", "W", "kW", "kWh", "Hz", "Ω"],
  },
  { label: "Ciśnienie", units: ["Pa", "hPa", "kPa", "bar", "psi", "atm"] },
  {
    label: "Odległość / Ruch",
    units: ["m", "cm", "mm", "km", "m/s", "km/h", "rpm"],
  },
  { label: "Światło / Dźwięk", units: ["lx", "lm", "cd", "dB", "dB(A)"] },
  { label: "Objętość / Przepływ", units: ["l", "m³", "l/min", "m³/h"] },
  { label: "Inne", units: ["count", "boolean (0/1)", "hex", "raw"] },
] as const;

export const MAX_CHART_READINGS = 50;
export const MAX_WS_RECONNECT_ATTEMPTS = 5;

export const TREND_MIN_READINGS = 20;
export const TREND_WINDOW_SIZE = 10;
export const TREND_THRESHOLD_RATIO = 0.05;
