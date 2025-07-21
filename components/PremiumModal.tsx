import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'yearly') => void;
}

export default function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>🚀 Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock advanced tracking features and get the most out of your experience!
            </Text>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📍</Text>
                <Text style={styles.featureText}>Real-time GPS tracking</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>📊</Text>
                <Text style={styles.featureText}>Advanced analytics</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>☁️</Text>
                <Text style={styles.featureText}>Cloud backup</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>Unlimited locations</Text>
              </View>
            </View>

            {/* Pricing Plans */}
            <View style={styles.plansContainer}>
              <TouchableOpacity 
                style={styles.planCard}
                onPress={() => onUpgrade('monthly')}
              >
                <Text style={styles.planTitle}>Monthly</Text>
                <Text style={styles.planPrice}>$3.99/month</Text>
                <Text style={styles.planDescription}>Cancel anytime</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.planCard, styles.popularPlan]}
                onPress={() => onUpgrade('yearly')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
                <Text style={styles.planTitle}>Yearly</Text>
                <Text style={styles.planPrice}>$29.99/year</Text>
                <Text style={styles.planDescription}>Save 37%</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.trialText}>
              🆓 Start your 7-day free trial • Cancel anytime
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
    maxWidth: 400,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
  },
  plansContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  popularPlan: {
    borderColor: '#1E90FF',
    backgroundColor: '#1E1E2E',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#1E90FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#888',
  },
  trialText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 24,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: '#888',
    fontSize: 16,
  },
});