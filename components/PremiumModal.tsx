import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
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

const { width } = Dimensions.get('window');

export default function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleUpgrade = () => {
    onUpgrade(selectedPlan);
    Alert.alert(
      "Premium Upgrade",
      `You selected the ${selectedPlan} plan. Starting your 7-day free trial!`,
      [{ text: "OK", onPress: onClose }]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Premium content */}
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock all features and remove limits</Text>

          {/* Features */}
          <ScrollView style={styles.featuresContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🗺️</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Unlimited Tracking</Text>
                <Text style={styles.featureDesc}>Track unlimited locations & routes</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-time Updates</Text>
                <Text style={styles.featureDesc}>Get instant location updates</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🔔</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Smart Alerts</Text>
                <Text style={styles.featureDesc}>Arrival & departure notifications</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>📊</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Analytics Dashboard</Text>
                <Text style={styles.featureDesc}>Detailed travel insights</Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🌍</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Offline Maps</Text>
                <Text style={styles.featureDesc}>Download maps for offline use</Text>
              </View>
            </View>
          </ScrollView>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <TouchableOpacity 
              style={[
                styles.priceBox, 
                selectedPlan === 'monthly' && styles.priceBoxSelected
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              {selectedPlan === 'monthly' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              <Text style={styles.priceLabel}>Monthly</Text>
              <Text style={styles.price}>$9.99</Text>
              <Text style={styles.priceDesc}>per month</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.priceBox, 
                styles.priceBoxPopular,
                selectedPlan === 'yearly' && styles.priceBoxSelected
              ]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.8}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
              {selectedPlan === 'yearly' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              <Text style={styles.priceLabel}>Yearly</Text>
              <Text style={styles.price}>$79.99</Text>
              <Text style={styles.priceDesc}>per year</Text>
              <Text style={styles.savings}>Save 33%</Text>
            </TouchableOpacity>
          </View>

          {/* Selected plan info */}
          <View style={styles.selectedPlanInfo}>
            <Text style={styles.selectedPlanText}>
              {selectedPlan === 'monthly' 
                ? '• Billed $9.99 monthly after trial' 
                : '• Billed $79.99 annually after trial'}
            </Text>
            <Text style={styles.selectedPlanText}>• Cancel anytime</Text>
          </View>

          {/* Action buttons */}
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>Start 7-Day Free Trial</Text>
            <Text style={styles.trialText}>
              Then {selectedPlan === 'monthly' ? '$9.99/month' : '$79.99/year'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={onClose}>
            <Text style={styles.laterButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxHeight: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  crown: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    maxHeight: 180,
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    color: '#888',
    fontSize: 14,
  },
  pricingContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
  },
  priceBoxSelected: {
    borderColor: '#1E90FF',
    backgroundColor: 'rgba(30, 144, 255, 0.1)',
  },
  priceBoxPopular: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#1E90FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 8,
  },
  price: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  priceDesc: {
    color: '#666',
    fontSize: 12,
  },
  savings: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  selectedPlanInfo: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectedPlanText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  upgradeButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trialText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  laterButton: {
    paddingVertical: 12,
  },
  laterButtonText: {
    color: '#888',
    fontSize: 16,
  },
});