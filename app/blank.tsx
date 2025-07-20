import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BlankScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* This is intentionally blank - just a black screen */}
      
      {/* Optional: Add a hidden button to go back (press in the center of screen) */}
      <TouchableOpacity 
        style={styles.hiddenButton} 
        onPress={() => router.back()}
        activeOpacity={1}
      >
        {/* Invisible button for going back */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  hiddenButton: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    width: '50%',
    height: '20%',
    // Uncomment the line below to see the button area during development
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});