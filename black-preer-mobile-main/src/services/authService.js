import axios from "axios";
import { API_BASE } from "../config/api";

// ⚠️ change IP to your PC IP
const API_URL = `${API_BASE}/api/auth`;

export const registerUser = async (fullName, email, password) => {
  const res = await axios.post(`${API_URL}/register`, {
    fullName,
    email,
    password,
  });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return res.data;
};