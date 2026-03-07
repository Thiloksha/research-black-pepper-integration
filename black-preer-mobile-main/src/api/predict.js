import { Platform } from "react-native";
import { API_BASE } from "../config/api";

export async function predictImage(uri) {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append("file", blob, "image.jpg");
  } else {
    formData.append("file", {
      uri,
      name: "image.jpg",
      type: "image/jpeg",
    } );
  }

//   const res = await fetch(`${API_BASE}/predict`
  const res = await fetch(`${API_BASE}/api/variety/predict`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const txt = await res.text();
    console.log("Backend error:", txt);
    throw new Error(txt);
  }

  return res.json();
}