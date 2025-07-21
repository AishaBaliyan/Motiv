import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PremiumModal from '../components/PremiumModal';

export default function SuccessScreen() {
  const router = useRouter();
  const [showPremium, setShowPremium] = useState(false);

  // Show premium modal after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPremium(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  const handleGoToBlank = () => {
    router.push('/blank');
  };

  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    // Handle upgrade logic here
    const price = plan === 'monthly' ? '$3.99/month' : '$29.99/year';
    Alert.alert(
      "Premium Upgrade",
      `Starting your 7-day free trial for the ${plan} plan (${price} after trial).`,
      [
        {
          text: "Continue",
          onPress: () => {
            setShowPremium(false);
            // Here you would implement actual payment processing
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.message}>You have successfully signed in.</Text>
        <Text style={styles.submessage}>Welcome to the app!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Start Over</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.trackerButton]}
            onPress={handleGoToBlank}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Open Tracker 🗺️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
        onUpgrade={handleUpgrade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 12,
  },
  message: {
    fontSize: 20,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  submessage: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1E90FF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: '600',
  },
  trackerButton: {
    backgroundColor: '#2ECC71',
  },
});