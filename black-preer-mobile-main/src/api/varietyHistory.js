import axios from "axios";
import { API_BASE } from "../config/api";

export const getVarietyHistory = async (page = 1, limit = 10) => {
  try {
    const res = await axios.get(
      `${API_BASE}/api/variety-predict/history`,
      {
        params: { page, limit },
      }
    );

    return res.data; // ✅ correct
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error("Failed to fetch history");
  }
};