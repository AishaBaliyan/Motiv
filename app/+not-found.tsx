import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🤔</Text>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Text style={styles.message}>The page you're looking for cannot be found.</Text>
        
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to Sign In</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'black',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#1E90FF',
    borderRadius: 10,
  },
  linkText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});