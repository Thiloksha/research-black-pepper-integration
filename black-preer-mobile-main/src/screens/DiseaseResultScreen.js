import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DiseaseResultScreen({ route, navigation }) {
  const {
    image,
    disease,
    confidence,
    treatment,
    description,
    probabilities,
    lowConfidence
  } = route.params;

  const handleSave = async () => {
    try {
      const newItem = {
        id: Date.now().toString(),
        image,
        disease,
        confidence,
        treatment,
        description,
        probabilities,
        lowConfidence: lowConfidence || false,
        savedAt: new Date().toLocaleString(),
      };

      const existing = await AsyncStorage.getItem("disease_history");
      const history = existing ? JSON.parse(existing) : [];

      history.unshift(newItem);

      await AsyncStorage.setItem("disease_history", JSON.stringify(history));

      navigation.navigate("DiseaseHistory");
    } catch (error) {
      console.log("Save error:", error);
      Alert.alert("Error", "Failed to save result.");
    }
  };

  const handleHistory = () => {
    navigation.navigate("DiseaseHistory");
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a3409', '#2d5016', '#1a3409']}
        style={styles.header}
      >
        <Text style={styles.title}>Detection Result</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Image source={{ uri: image }} style={styles.image} />

        {lowConfidence && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠ Low Confidence Detection</Text>
            <Text style={styles.warningText}>
              This result may indicate an early or mild infection. The AI model
              confidence is lower than normal. Monitor the plant and capture a
              clearer close-up image for more accurate detection.
            </Text>
          </View>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Detected Disease</Text>
          <Text style={styles.resultValue}>{disease}</Text>

          <Text style={styles.label}>Confidence</Text>
          <Text style={styles.value}>{confidence}</Text>

          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{description}</Text>

          <Text style={styles.label}>Treatment Recommendation</Text>
          <Text style={styles.value}>{treatment}</Text>
        </View>

        {probabilities && Object.keys(probabilities).length > 0 && (
          <View style={styles.probCard}>
            <Text style={styles.probTitle}>All Predictions</Text>

            {Object.entries(probabilities).map(([key, value]) => (
              <View key={key} style={styles.probRow}>
                <Text style={styles.probDisease}>{key}</Text>
                <Text style={styles.probValue}>{value}%</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 Save Result</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyButton} onPress={handleHistory}>
          <Text style={styles.historyText}>📜 View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center"
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold"
  },

  content: {
    padding: 20
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 15,
    marginBottom: 20
  },

  warningCard: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffe08a",
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#856404",
    marginBottom: 6
  },

  warningText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20
  },

  resultCard: {
    backgroundColor: "#f1f8e9",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20
  },

  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2d5016"
  },

  resultValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 10
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10
  },

  value: {
    fontSize: 15,
    color: "#444",
    marginTop: 4
  },

  probCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#dceccf"
  },

  probTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2d5016"
  },

  probRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },

  probDisease: {
    fontSize: 15,
    color: "#333"
  },

  probValue: {
    fontSize: 15,
    fontWeight: "600"
  },

  saveButton: {
    backgroundColor: "#8bc34a",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 15
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16
  },

  historyButton: {
    borderWidth: 2,
    borderColor: "#8bc34a",
    padding: 16,
    borderRadius: 50,
    alignItems: "center"
  },

  historyText: {
    color: "#2d5016",
    fontWeight: "700"
  }
});