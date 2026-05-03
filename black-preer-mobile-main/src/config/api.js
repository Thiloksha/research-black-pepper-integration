import { Platform } from "react-native";

const LAPTOP_IP = "10.13.149.211";

export const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:5000"
    : `http://${LAPTOP_IP}:5000`;

export const WEATHER_URL = `${API_BASE}/api/weather`;

// export const API_BASE =
//   Platform.OS === "web"
//     ? "http://127.0.0.1:8000"
//     : `http://${LAPTOP_IP}:8000`;