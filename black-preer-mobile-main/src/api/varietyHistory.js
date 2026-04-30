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

export const deleteVarietyRecord = async (id) => {
  try {
    const res = await axios.delete(
      `${API_BASE}/api/variety-predict/${id}`
    );

    return res.data;
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete record");
  }
};

export const clearVarietyHistory = async () => {
  try {
    const res = await axios.delete(
      `${API_BASE}/api/variety-predict`
    );

    return res.data;
  } catch (error) {
    console.error("Clear error:", error);
    throw new Error("Failed to clear history");
  }
};