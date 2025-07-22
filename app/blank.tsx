import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { DeviceMotion } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Type definitions
interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

interface WeatherInfo {
  temp: number;
  condition: string;
}

interface DriveLockStatus {
  isActive: boolean;
  appsBlocked: boolean;
  distanceFromCar: number;
  phoneOrientation: string;
  parkingTimer: number;
  emergencyOverride: boolean;
}

interface SafetyAlert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'emergency';
  message: string;
  timestamp: Date;
}

export default function TrackerScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  
  // Location state with proper types
  const [userLocation, setUserLocation] = useState<LocationCoordinate | null>(null);
  const [carLocation, setCarLocation] = useState<LocationCoordinate | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [weather] = useState<WeatherInfo>({ temp: 72, condition: "☀️ Sunny" });
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

  // DriveLock features
  const [driveLock, setDriveLock] = useState<DriveLockStatus>({
    isActive: false,
    appsBlocked: false,
    distanceFromCar: 0,
    phoneOrientation: 'upright',
    parkingTimer: 0,
    emergencyOverride: false,
  });

  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [blockedApps] = useState<string[]>(['Instagram', 'TikTok', 'Snapchat', 'Twitter', 'Facebook']);
  const [motionData, setMotionData] = useState<any>(null);
  const [overrideTimer, setOverrideTimer] = useState<number>(0);

  // Request location permission and start tracking
  useEffect(() => {
    requestLocationPermission();
    startMotionTracking();
    
    // Cleanup subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      DeviceMotion.removeAllListeners();
    };
  }, []);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
      updateDriveLockStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parking timer effect
  useEffect(() => {
    if (driveLock.parkingTimer > 0 && speed === 0) {
      const timer = setTimeout(() => {
        setDriveLock(prev => ({
          ...prev,
          parkingTimer: prev.parkingTimer - 1,
          appsBlocked: prev.parkingTimer > 1 && !prev.emergencyOverride
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [driveLock.parkingTimer, speed]);

  // Emergency override timer effect
  useEffect(() => {
    if (overrideTimer > 0) {
      const timer = setTimeout(() => {
        setOverrideTimer(prev => {
          if (prev === 1) {
            // Override expires
            setDriveLock(prevDrive => ({ ...prevDrive, emergencyOverride: false }));
            addSafetyAlert('info', 'Emergency override expired - DriveLock reactivated');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [overrideTimer]);

  const startMotionTracking = () => {
    DeviceMotion.setUpdateInterval(1000);
    DeviceMotion.addListener((motionData) => {
      setMotionData(motionData);
      updatePhoneOrientation(motionData);
    });
  };

  const updatePhoneOrientation = (motion: any) => {
    if (!motion?.rotation) return;
    
    const { beta, gamma } = motion.rotation;
    let orientation = 'upright';
    
    if (Math.abs(beta) > 1.5) orientation = 'tilted-forward';
    if (Math.abs(gamma) > 1.5) orientation = 'tilted-sideways';
    if (beta > 2.5) orientation = 'facing-driver';
    
    setDriveLock(prev => ({ ...prev, phoneOrientation: orientation }));
  };

  const updateDriveLockStatus = () => {
    // Simulate various sensors and conditions
    const isMoving = speed > 0;
    
    setDriveLock(prev => {
      const newStatus = { ...prev };
      
      // Distance simulation (in real app, this would use actual sensors)
      if (carLocation && userLocation) {
        const distance = calculateDistance(userLocation, carLocation);
        newStatus.distanceFromCar = distance;
      }
      
      // App blocking logic - only block if not in emergency override
      const shouldBlockApps = 
        newStatus.isActive && 
        isMoving && 
        newStatus.distanceFromCar < 3 &&
        !newStatus.emergencyOverride;
      
      if (shouldBlockApps !== newStatus.appsBlocked) {
        newStatus.appsBlocked = shouldBlockApps;
        if (!newStatus.emergencyOverride) {
          addSafetyAlert(
            shouldBlockApps ? 'danger' : 'info',
            shouldBlockApps ? 'Apps blocked - Driving detected' : 'Apps unblocked - Safe to use'
          );
        }
      }
      
      // Set parking timer when stopped
      if (isMoving && newStatus.parkingTimer === 0) {
        // Reset timer when starting to move
      } else if (!isMoving && newStatus.parkingTimer === 0 && newStatus.appsBlocked) {
        newStatus.parkingTimer = 120; // 2 minutes
      }
      
      // Check for safety violations
      checkSafetyViolations(newStatus);
      
      return newStatus;
    });
  };

  const calculateDistance = (pos1: LocationCoordinate, pos2: LocationCoordinate): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = pos1.latitude * Math.PI/180;
    const φ2 = pos2.latitude * Math.PI/180;
    const Δφ = (pos2.latitude-pos1.latitude) * Math.PI/180;
    const Δλ = (pos2.longitude-pos1.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const checkSafetyViolations = (status: DriveLockStatus) => {
    if (status.phoneOrientation === 'facing-driver' && speed > 0 && !status.emergencyOverride) {
      addSafetyAlert('warning', 'Phone facing driver while moving - Potential distraction');
    }
    
    if (status.distanceFromCar > 3 && status.appsBlocked) {
      addSafetyAlert('info', 'Far from vehicle - Apps will unblock soon');
    }

    if (status.emergencyOverride && speed > 0) {
      addSafetyAlert('warning', 'Emergency override active while driving - Use with caution');
    }
  };

  const addSafetyAlert = (type: 'warning' | 'danger' | 'info' | 'emergency', message: string) => {
    const alert: SafetyAlert = {
      id: Math.random().toString(),
      type,
      message,
      timestamp: new Date()
    };
    
    setSafetyAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
  };

  const handleEmergencyOverride = () => {
    Alert.alert(
      '🚨 Emergency Override',
      'This will temporarily disable DriveLock for 5 minutes. Use only in genuine emergencies.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm Override',
          style: 'destructive',
          onPress: () => {
            setDriveLock(prev => ({ 
              ...prev, 
              emergencyOverride: true,
              appsBlocked: false 
            }));
            setOverrideTimer(300); // 5 minutes
            addSafetyAlert('emergency', 'Emergency override activated - 5 minute timer started');
          }
        }
      ]
    );
  };

  const requestLocationPermission = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for DriveLock to function properly.',
          [{ text: 'OK' }]
        );
        return;
      }

      setLocationPermission(true);
      startLocationTracking();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const startLocationTracking = async (): Promise<void> => {
    try {
      setIsTracking(true);

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = initialLocation.coords;
      const newLocation: LocationCoordinate = { latitude, longitude };
      
      setUserLocation(newLocation);
      // Set car location slightly offset for demonstration
      setCarLocation({
        latitude: latitude + 0.0001,
        longitude: longitude + 0.0001
      });
      
      setSpeed(Math.round((initialLocation.coords.speed || 0) * 2.237)); // Convert m/s to mph
      setAccuracy(Math.round(initialLocation.coords.accuracy || 0));

      // Update map region to user location
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Start watching location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location: Location.LocationObject) => {
          const { latitude, longitude } = location.coords;
          const newLocation: LocationCoordinate = { latitude, longitude };
          
          setUserLocation(newLocation);
          setSpeed(Math.round((location.coords.speed || 0) * 2.237)); // Convert m/s to mph
          setAccuracy(Math.round(location.coords.accuracy || 0));
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location');
      setIsTracking(false);
    }
  };

  const stopLocationTracking = (): void => {
    setIsTracking(false);
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  const centerOnUser = (): void => {
    if (userLocation) {
      const newRegion: Region = {
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const toggleDriveLock = () => {
    setDriveLock(prev => ({ 
      ...prev, 
      isActive: !prev.isActive,
      appsBlocked: false,
      parkingTimer: 0,
      emergencyOverride: false
    }));
    setOverrideTimer(0);
    addSafetyAlert('info', `DriveLock ${!driveLock.isActive ? 'enabled' : 'disabled'}`);
  };

  // Helper function to get alert style
  const getAlertStyle = (alertType: 'warning' | 'danger' | 'info' | 'emergency') => {
    switch (alertType) {
      case 'danger':
        return styles.alertDanger;
      case 'warning':
        return styles.alertWarning;
      case 'info':
        return styles.alertInfo;
      case 'emergency':
        return styles.alertEmergency;
      default:
        return styles.alertInfo;
    }
  };

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

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion: Region) => setRegion(newRegion)}
          customMapStyle={mapStyle}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              description="Current position"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.userMarker}>
                <View style={[styles.userDot, { 
                  backgroundColor: driveLock.emergencyOverride ? '#F39C12' : 
                                   driveLock.appsBlocked ? '#E74C3C' : '#1E90FF' 
                }]} />
                {isTracking && <View style={styles.pulse} />}
              </View>
            </Marker>
          )}

          {/* Car location marker */}
          {carLocation && (
            <Marker
              coordinate={carLocation}
              title="Vehicle"
              description="Car location"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.carMarker}>
                <Text style={styles.carIcon}>🚗</Text>
              </View>
            </Marker>
          )}

          {/* 3-meter safety zone */}
          {carLocation && (
            <Circle
              center={carLocation}
              radius={3}
              strokeColor="rgba(231, 76, 60, 0.5)"
              fillColor="rgba(231, 76, 60, 0.1)"
              strokeWidth={2}
            />
          )}
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

        {/* DriveLock Status */}
        <View style={styles.driveLockStatus}>
          <View style={[styles.statusIndicator, { 
            backgroundColor: driveLock.emergencyOverride ? '#F39C12' :
                            driveLock.isActive ? (driveLock.appsBlocked ? '#E74C3C' : '#F39C12') : '#666'
          }]} />
          <Text style={styles.statusText}>
            {driveLock.emergencyOverride ? 'EMERGENCY OVERRIDE' :
             driveLock.isActive ? (driveLock.appsBlocked ? 'APPS BLOCKED' : 'DRIVELOCK ACTIVE') : 'DRIVELOCK OFF'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* DriveLock Control */}
        <View style={styles.driveLockCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔒 DriveLock System</Text>
            <Switch
              value={driveLock.isActive}
              onValueChange={toggleDriveLock}
              trackColor={{ false: '#666', true: '#1E90FF' }}
              thumbColor={driveLock.isActive ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          {driveLock.parkingTimer > 0 && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                🅿️ Parking Timer: {Math.floor(driveLock.parkingTimer / 60)}:{(driveLock.parkingTimer % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}

          {overrideTimer > 0 && (
            <View style={styles.overrideContainer}>
              <Text style={styles.overrideText}>
                🚨 Emergency Override: {Math.floor(overrideTimer / 60)}:{(overrideTimer % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          )}
        </View>

        {/* Safety Sensors Grid */}
        <View style={styles.sensorsGrid}>
          <View style={styles.sensorCard}>
            <Text style={styles.sensorIcon}>⚡</Text>
            <Text style={styles.sensorValue}>{speed}</Text>
            <Text style={styles.sensorLabel}>mph</Text>
          </View>
          
          <View style={styles.sensorCard}>
            <Text style={styles.sensorIcon}>🎯</Text>
            <Text style={styles.sensorValue}>{accuracy}</Text>
            <Text style={styles.sensorLabel}>accuracy (m)</Text>
          </View>
          
          <View style={styles.sensorCard}>
            <Text style={styles.sensorIcon}>📍</Text>
            <Text style={styles.sensorValue}>{isTracking ? 'ON' : 'OFF'}</Text>
            <Text style={styles.sensorLabel}>tracking</Text>
          </View>
        </View>

        {/* Advanced Sensors */}
        <View style={styles.advancedSensors}>
          <View style={styles.sensorRow}>
            <Text style={styles.sensorRowLabel}>📱 Phone Orientation:</Text>
            <Text style={[styles.sensorRowValue, 
              driveLock.phoneOrientation === 'facing-driver' && !driveLock.emergencyOverride && styles.dangerText
            ]}>
              {driveLock.phoneOrientation.replace('-', ' ')}
            </Text>
          </View>
          
          <View style={styles.sensorRow}>
            <Text style={styles.sensorRowLabel}>📏 Distance from Car:</Text>
            <Text style={[styles.sensorRowValue,
              driveLock.distanceFromCar < 3 && !driveLock.emergencyOverride && styles.dangerText
            ]}>
              {driveLock.distanceFromCar.toFixed(1)}m
            </Text>
          </View>
        </View>

        {/* Emergency Override Button */}
        {driveLock.isActive && driveLock.appsBlocked && !driveLock.emergencyOverride && (
          <TouchableOpacity 
            style={styles.emergencyButton}
            onPress={handleEmergencyOverride}
          >
            <Text style={styles.emergencyButtonText}>🚨 EMERGENCY OVERRIDE</Text>
            <Text style={styles.emergencySubtext}>Use only in genuine emergencies</Text>
          </TouchableOpacity>
        )}

        {/* Blocked Apps */}
        {driveLock.appsBlocked && !driveLock.emergencyOverride && (
          <View style={styles.blockedAppsCard}>
            <Text style={styles.cardTitle}>🚫 Blocked Apps</Text>
            <View style={styles.appsList}>
              {blockedApps.map((app, index) => (
                <View key={index} style={styles.appItem}>
                  <Text style={styles.appName}>{app}</Text>
                  <Text style={styles.blockedIcon}>🔒</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Override Active Notice */}
        {driveLock.emergencyOverride && (
          <View style={styles.overrideNotice}>
            <Text style={styles.cardTitle}>⚠️ Emergency Override Active</Text>
            <Text style={styles.overrideNoticeText}>
              All apps are temporarily unblocked. Please drive safely and use this only in genuine emergencies.
            </Text>
          </View>
        )}

        {/* Safety Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.cardTitle}>⚠️ Safety Alerts</Text>
          {safetyAlerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, getAlertStyle(alert.type)]}>
              <Text style={styles.alertText}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.timestamp.toLocaleTimeString()}</Text>
            </View>
          ))}
          {safetyAlerts.length === 0 && (
            <Text style={styles.noAlertsText}>No recent alerts</Text>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {isTracking ? (
            <TouchableOpacity 
              style={[styles.controlButton, styles.stopButton]}
              onPress={stopLocationTracking}
            >
              <Text style={styles.controlButtonText}>⏹️ Stop Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.controlButton, styles.startButton]}
              onPress={startLocationTracking}
              disabled={!locationPermission}
            >
              <Text style={styles.controlButtonText}>▶️ Start Tracking</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.controlButton, styles.centerButton]}
            onPress={centerOnUser}
            disabled={!userLocation}
          >
            <Text style={styles.controlButtonText}>🎯 Center Map</Text>
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
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1E90FF',
    borderWidth: 3,
    borderColor: 'white',
  },
  pulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 144, 255, 0.3)',
    zIndex: -1,
  },
  carMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  carIcon: {
    fontSize: 24,
    textAlign: 'center',
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
  driveLockStatus: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  driveLockCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timerContainer: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  timerText: {
    color: '#F39C12',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overrideContainer: {
    backgroundColor: '#2a1a1a',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  overrideText: {
    color: '#F39C12',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sensorsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  sensorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  sensorValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sensorLabel: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },
  advancedSensors: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorRowLabel: {
    color: '#888',
    fontSize: 14,
  },
  sensorRowValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#E74C3C',
  },
  emergencyButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F39C12',
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emergencySubtext: {
    color: '#F39C12',
    fontSize: 14,
  },
  overrideNotice: {
    backgroundColor: '#2a2a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  overrideNoticeText: {
    color: '#F39C12',
    fontSize: 16,
    lineHeight: 22,
  },
  blockedAppsCard: {
    backgroundColor: '#2a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  appsList: {
    gap: 8,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
  },
  appName: {
    color: 'white',
    fontSize: 16,
  },
  blockedIcon: {
    fontSize: 16,
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alertCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertDanger: {
    backgroundColor: '#2a1a1a',
    borderLeftColor: '#E74C3C',
  },
  alertWarning: {
    backgroundColor: '#2a2a1a',
    borderLeftColor: '#F39C12',
  },
  alertInfo: {
    backgroundColor: '#1a1a2a',
    borderLeftColor: '#3498DB',
  },
  alertEmergency: {
    backgroundColor: '#2a1a1a',
    borderLeftColor: '#F39C12',
  },
  alertText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  alertTime: {
    color: '#888',
    fontSize: 12,
  },
  noAlertsText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
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
  startButton: {
    backgroundColor: '#2ECC71',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
  },
  centerButton: {
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