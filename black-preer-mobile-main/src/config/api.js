import { Platform } from "react-native";

const LAPTOP_IP = "192.168.1.2";

export const API_BASE =
  Platform.OS === "web"
    ? "http://127.0.0.1:5001"
    : `http://${LAPTOP_IP}:5001`;
    
// export const API_BASE =
//   Platform.OS === "web"
//     ? "http://127.0.0.1:8000"
//     : `http://${LAPTOP_IP}:8000`;