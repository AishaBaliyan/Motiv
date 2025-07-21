import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function TrackerScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  
  // Route coordinates (San Francisco to Oakland)
  const route = [
    { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
    { latitude: 37.7849, longitude: -122.4094 },
    { latitude: 37.7949, longitude: -122.3994 },
    { latitude: 37.8049, longitude: -122.3894 },
    { latitude: 37.8149, longitude: -122.3794 },
    { latitude: 37.8249, longitude: -122.3694 },
    { latitude: 37.8349, longitude: -122.3594 },
    { latitude: 37.8449, longitude: -122.3494 },
    { latitude: 37.8549, longitude: -122.3394 },
    { latitude: 37.8649, longitude: -122.3294 },
    { latitude: 37.8044, longitude: -122.2711 }, // Oakland
  ];

  // Tracker state
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(route[0]);
  const [region, setRegion] = useState({
    latitude: 37.8149,
    longitude: -122.3494,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });
  const [isMoving, setIsMoving] = useState(true);
  const [speed, setSpeed] = useState(65);
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState("15 min");
  const [weather] = useState({ temp: 72, condition: "☀️ Sunny" });
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Animate car movement
  useEffect(() => {
    if (isMoving && progress < 100) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + 2, 100);
          const routeIndex = Math.floor((newProgress / 100) * (route.length - 1));
          setCurrentPosition(route[Math.min(routeIndex, route.length - 1)]);
          
          if (newProgress >= 100) {
            setIsMoving(false);
            setEta("Arrived!");
            return 100;
          }
          return newProgress;
        });
        setDistance(prev => prev + 0.3);
        setSpeed(Math.floor(Math.random() * 20) + 55);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isMoving, progress]);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update ETA
  useEffect(() => {
    if (isMoving && progress < 100) {
      const remainingMin = Math.max(1, Math.floor((100 - progress) / 7));
      setEta(`${remainingMin} min`);
    }
  }, [progress, isMoving]);

  // Dark map style
  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#2c2c2c" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#000000" }]
    }
  ];

  const handleReset = () => {
    setProgress(0);
    setDistance(0);
    setIsMoving(true);
    setCurrentPosition(route[0]);
    mapRef.current?.animateToRegion({
      ...region,
      latitude: 37.8149,
      longitude: -122.3494,
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={mapStyle}
          provider={PROVIDER_GOOGLE}
        >
          {/* Route line */}
          <Polyline
            coordinates={route}
            strokeColor="#666"
            strokeWidth={3}
          />
          
          {/* Completed route */}
          <Polyline
            coordinates={route.slice(0, Math.floor((progress / 100) * route.length))}
            strokeColor="#1E90FF"
            strokeWidth={4}
          />

          {/* Start marker */}
          <Marker
            coordinate={route[0]}
            title="Start"
            description="San Francisco"
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText}>A</Text>
            </View>
          </Marker>

          {/* End marker */}
          <Marker
            coordinate={route[route.length - 1]}
            title="Destination"
            description="Oakland"
          >
            <View style={[styles.markerContainer, styles.endMarker]}>
              <Text style={styles.markerText}>B</Text>
            </View>
          </Marker>

          {/* Car marker */}
          <Marker
            coordinate={currentPosition}
            title="Current Location"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.carMarker}>
              <Text style={styles.carIcon}>🚗</Text>
              {isMoving && <View style={styles.pulse} />}
            </View>
          </Marker>
        </MapView>

        {/* Top Info Bar */}
        <View style={styles.topBar}>
          <View style={styles.weatherBox}>
            <Text style={styles.weatherTemp}>{weather.temp}°</Text>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>
          <View style={styles.timeBox}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>

        {/* Route Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Info Card */}
        <View style={styles.tripCard}>
          <Text style={styles.tripTitle}>Current Trip</Text>
          
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationAddress}>Market St, San Francisco</Text>
            </View>
          </View>

          <View style={styles.routeDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <View style={styles.locationRow}>
            <View style={[styles.locationDot, styles.destinationDot]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationAddress}>Oakland, CA</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statValue}>{speed}</Text>
            <Text style={styles.statLabel}>mph</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📍</Text>
            <Text style={styles.statValue}>{distance.toFixed(1)}</Text>
            <Text style={styles.statLabel}>miles</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{eta}</Text>
            <Text style={styles.statLabel}>ETA</Text>
          </View>
        </View>

        {/* Nearby Places */}
        <View style={styles.nearbyContainer}>
          <Text style={styles.sectionTitle}>Nearby Places</Text>
          
          <TouchableOpacity style={styles.placeCard}>
            <Text style={styles.placeIcon}>⛽</Text>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>Shell Gas Station</Text>
              <Text style={styles.placeDistance}>0.8 mi • $4.29/gal</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.placeCard}>
            <Text style={styles.placeIcon}>☕</Text>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>Starbucks</Text>
              <Text style={styles.placeDistance}>1.2 mi • Open until 9 PM</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.placeCard}>
            <Text style={styles.placeIcon}>🍔</Text>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>In-N-Out Burger</Text>
              <Text style={styles.placeDistance}>2.5 mi • Drive-thru open</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {isMoving ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.pauseButton]}
              onPress={() => setIsMoving(false)}
            >
              <Text style={styles.controlButtonText}>⏸️ Pause Trip</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.resumeButton]}
              onPress={() => progress < 100 && setIsMoving(true)}
            >
              <Text style={styles.controlButtonText}>▶️ Resume Trip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.controlButtonText}>🔄 Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  mapContainer: {
    height: 350,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  endMarker: {
    backgroundColor: '#4CAF50',
  },
  markerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  carMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIcon: {
    fontSize: 24,
    textAlign: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 144, 255, 0.3)',
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  weatherTemp: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weatherCondition: {
    color: '#888',
    fontSize: 12,
  },
  timeBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E90FF',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tripCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  tripTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E90FF',
    marginRight: 12,
  },
  destinationDot: {
    backgroundColor: '#4CAF50',
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  locationAddress: {
    color: 'white',
    fontSize: 16,
  },
  routeDots: {
    marginLeft: 5,
    marginVertical: 8,
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: '#444',
    borderRadius: 1,
    marginVertical: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  nearbyContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  placeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeDistance: {
    color: '#888',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#E74C3C',
  },
  resumeButton: {
    backgroundColor: '#2ECC71',
  },
  resetButton: {
    backgroundColor: '#3498DB',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});