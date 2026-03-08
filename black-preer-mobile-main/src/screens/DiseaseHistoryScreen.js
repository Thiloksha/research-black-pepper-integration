import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function DiseaseHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem("disease_history");
      const parsed = stored ? JSON.parse(stored) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.log("History load error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all saved results?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("disease_history");
            setHistory([]);
          },
        },
      ]
    );
  };

  const getShortDescription = (text) => {
    if (!text) return "No description available.";
    return text.length > 65 ? `${text.slice(0, 65)}...` : text;
  };

  const isDisplayableImage = (uri) => {
    if (!uri || typeof uri !== "string") return false;

    if (uri.startsWith("blob:")) {
      return false;
    }

    return (
      uri.startsWith("http://") ||
      uri.startsWith("https://") ||
      uri.startsWith("file://") ||
      uri.startsWith("data:image/") ||
      uri.startsWith("/")
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#1a3409", "#2d5016", "#1a3409"]}
        style={styles.header}
      >
        <Text style={styles.title}>Detection History</Text>
      </LinearGradient>

      <View style={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Saved Results</Text>
            <Text style={styles.emptyText}>
              Your saved disease detection records will appear here.
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Text style={styles.clearButtonText}>🗑 Clear History</Text>
            </TouchableOpacity>

            {history.map((item, index) => {
              const canShowImage = isDisplayableImage(item.image);
              const cardKey = item.id ?? `${item.savedAt ?? "item"}-${index}`;

              return (
                <View
                  key={cardKey}
                  style={styles.cardWrapper}
                  onMouseEnter={() =>
                    Platform.OS === "web" && setHoveredId(item.id)
                  }
                  onMouseLeave={() =>
                    Platform.OS === "web" && setHoveredId(null)
                  }
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.card}
                    onPress={() =>
                      navigation.navigate("DiseaseResult", {
                        image: item.image,
                        disease: item.disease,
                        confidence: item.confidence,
                        treatment: item.treatment,
                        description: item.description,
                        probabilities: item.probabilities,
                        lowConfidence: item.lowConfidence,
                      })
                    }
                  >
                    {canShowImage ? (
                      <Image source={{ uri: item.image }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderIcon}>🖼️</Text>
                        <Text style={styles.imagePlaceholderText}>
                          Preview unavailable
                        </Text>
                      </View>
                    )}

                    <View style={styles.cardContent}>
                      <Text style={styles.disease}>
                        {item.disease || "Unknown disease"}
                      </Text>
                      <Text style={styles.text}>
                        Confidence: {item.confidence || "N/A"}
                      </Text>
                      <Text style={styles.text}>
                        Saved: {item.savedAt || "Unknown date"}
                      </Text>
                      <Text style={styles.shortDesc}>
                        {getShortDescription(item.description)}
                      </Text>

                      {!canShowImage && Platform.OS === "web" && (
                        <Text style={styles.previewWarning}>
                          Web preview is unavailable for temporary uploaded images.
                        </Text>
                      )}

                      {item.lowConfidence && (
                        <Text style={styles.lowConfidenceText}>
                          ⚠ Low confidence result
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {Platform.OS === "web" && hoveredId === item.id && (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipTitle}>Full Details</Text>
                      <Text style={styles.tooltipText}>
                        <Text style={styles.tooltipLabel}>Description: </Text>
                        {item.description || "No description"}
                      </Text>
                      <Text style={styles.tooltipText}>
                        <Text style={styles.tooltipLabel}>Treatment: </Text>
                        {item.treatment || "No treatment advice"}
                      </Text>
                      {item.lowConfidence && (
                        <Text style={styles.tooltipWarning}>
                          ⚠ This was saved as a low-confidence / possible early
                          infection result.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  emptyCard: {
    backgroundColor: "#f1f8e9",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d5016",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  cardWrapper: {
    position: "relative",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dceccf",
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#eef3ea",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  imagePlaceholderIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
  },
  cardContent: {
    flex: 1,
  },
  disease: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d5016",
    marginBottom: 6,
  },
  text: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  shortDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
    lineHeight: 20,
  },
  previewWarning: {
    marginTop: 8,
    fontSize: 12,
    color: "#8a6d3b",
    lineHeight: 16,
  },
  lowConfidenceText: {
    marginTop: 8,
    color: "#b26a00",
    fontSize: 13,
    fontWeight: "600",
  },
  tooltip: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 300,
    backgroundColor: "#1f2a1f",
    borderRadius: 12,
    padding: 14,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tooltipTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  tooltipText: {
    color: "#f1f1f1",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  tooltipLabel: {
    fontWeight: "700",
    color: "#fff",
  },
  tooltipWarning: {
    color: "#ffd27f",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});