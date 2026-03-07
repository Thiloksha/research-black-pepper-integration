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

export default function DiseaseResultScreen({ route, navigation }) {

  const { image, disease, confidence, treatment } = route.params;

  const handleSave = () => {
    Alert.alert("Saved", "Result saved successfully!");
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

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Detected Disease</Text>
          <Text style={styles.resultValue}>{disease}</Text>

          <Text style={styles.label}>Confidence</Text>
          <Text style={styles.value}>{confidence}</Text>

          <Text style={styles.label}>Treatment Recommendation</Text>
          <Text style={styles.value}>{treatment}</Text>
        </View>

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