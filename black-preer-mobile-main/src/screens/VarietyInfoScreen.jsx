import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function VarietyInfoScreen() {
  const [selectedVariety, setSelectedVariety] = useState(null);

  const varieties = [
    {
      key: 'dingirala',
      name: 'Dingi Rala',
      parentage:
        'Cross: Panniyur-1 × GK 49\n\nThis hybrid brings together genetics from two well-known high-yielding parents:\nPanniyur-1: a popular Indian high-yield variety\nGK 49: a selection known for quality traits in Sri Lanka',
      agronomy:
        'Panicle length: ~12 cm\nFilling %: ~80%\nAnnual yield: ~2245 g per vine\n\nThese figures indicate a strong productive capacity and relatively good quality berry set.',
      quality:
        'Oleoresin: ~12.9%\nOil: ~2.8%\nPiperine: ~5.6%\n\nPiperine is the key compound that gives pepper its heat and pungency, so Dingi Rala has a respectable pungency.',
      summary:
        'Dingi Rala is a balanced, reliable hybrid for growers — combining good yield with decent spice quality and traditional robustness.'
    },
    {
      key: 'kohu',
      name: 'Kohukumbure Rala',
      parentage:
        'Cross: MW 21 × Panniyur-1\n\nThis hybrid uses a local selection (MW 21) crossed with the established Panniyur-1, aiming for improved performance under local growing conditions.',
      agronomy:
        'Panicle length: ~12 cm\nFilling %: ~80%\nAnnual yield: ~2340 g per vine\n\nThis puts Kohukumbure Rala in the middle range for yield among the three varieties.',
      quality:
        'Oleoresin: ~15.4%\nOil: ~3.6%\nPiperine: ~6%\n\nThe notably high oleoresin and oil content here may enhance flavor complexity and aromatic intensity in processed pepper products.',
      summary:
        'Kohukumbure Rala combines good balance in yield with high aromatic and oleoresin content.'
    },
    {
      key: 'bootawe',
      name: 'Bootawe Rala',
      parentage:
        'Cross: Panniyur-1 × DM 7\n\nThis hybrid pairs Panniyur-1 with DM 7 — another local line with desirable agronomic performance.',
      agronomy:
        'Panicle length: ~14 cm\nFilling %: ~80%\nAnnual yield: ~2724 g per vine\n\nThese figures make Bootawe Rala the highest yielder among the three main hybrids.',
      quality:
        'Oleoresin: ~12.9%\nOil: ~3.1%\nPiperine: ~6.3%\n\nBootawe Rala stands out with both higher oil and higher piperine contents.',
      summary:
        'Bootawe Rala is often viewed as a premium hybrid choice due to its higher yields and stronger spice characteristics.'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>📘 Black Pepper Variety Information</Text>
          <Text style={styles.subtitle}>
            Learn about the main Sri Lankan black pepper varieties
          </Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About Sri Lankan Pepper Varieties</Text>
            <Text style={styles.text}>
              Although the origin of black pepper is believed to be the Malabar Coast of India,
              Sri Lanka is also home to a number of wild pepper types. The Department of Export
              Agriculture has introduced improved local hybrids such as Dingi Rala,
              Kohukumbure Rala, and Bootawe Rala.
            </Text>
          </View>

          <Text style={styles.listTitle}>Select a variety for details</Text>

          {varieties.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.varietyButton}
              onPress={() => setSelectedVariety(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.varietyButtonIcon}>🍃</Text>
              <Text style={styles.varietyButtonText}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent
        visible={!!selectedVariety}
        onRequestClose={() => setSelectedVariety(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVariety && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedVariety.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedVariety(null)}>
                    <Ionicons name="close-circle" size={30} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                  <Text style={styles.modalSectionTitle}>🧬 Parentage & Breeding</Text>
                  <Text style={styles.modalText}>{selectedVariety.parentage}</Text>

                  <Text style={styles.modalSectionTitle}>🌾 Agronomic Traits</Text>
                  <Text style={styles.modalText}>{selectedVariety.agronomy}</Text>

                  <Text style={styles.modalSectionTitle}>🔬 Quality Attributes</Text>
                  <Text style={styles.modalText}>{selectedVariety.quality}</Text>

                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>{selectedVariety.summary}</Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, paddingTop: 20, paddingBottom: 40 },
  content: { paddingHorizontal: 20 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5016',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 15,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5016',
    marginBottom: 12,
  },
  varietyButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  varietyButtonIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  varietyButtonText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#2d5016',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d5016',
    flex: 1,
    paddingRight: 10,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5016',
    marginTop: 15,
    marginBottom: 5,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  summaryBox: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  summaryText: {
    fontStyle: 'italic',
    color: '#2E7D32',
    textAlign: 'center',
  },
});