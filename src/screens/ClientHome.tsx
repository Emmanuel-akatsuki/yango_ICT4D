import React, {
  useState,
} from 'react';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';

import MapView from 'react-native-maps';

import {
  createRide,
} from '../services/rideService';

import {
  GlobalStyles,
} from '../theme/globalStyles';

const { width } = Dimensions.get('window');

export default function ClientHome({ route }: any) {
  const { userName } = route.params || { userName: 'Client' };

  const [pickup,setPickup] =
  useState('');

  const [destination,
  setDestination] =
  useState('');

  const [vehicleType,
  setVehicleType] =
  useState({ id: 'eco', label: 'Économique', desc: '4 places, Standard' });

  const vehicles = [
    { id: 'eco', label: 'Économique', desc: '4 places, Standard' },
    { id: 'confort', label: 'Confort', desc: 'Berline, Climatisée' },
    { id: 'moto', label: 'Moto', desc: 'Rapide, 1 place' },
  ];

  const handleSOS = () => {
    Alert.alert(
      "URGENCE SOS",
      "Action déclenchée : \n1. Caméra activée (enregistrement)\n2. Points de secours proches : Hôpital Général, Clinique de l'Espoir.\n3. Position envoyée aux secours.",
      [{ text: "OK", style: "destructive" }]
    );
  };

  const sendRide =
  async ()=>{
    if (!pickup || !destination) {
      Alert.alert('Erreur', 'Veuillez remplir le trajet');
      return;
    }

    await createRide({

      clientName:
      userName,

      pickup,

      destination,

      vehicleType,

      status:'pending',

      createdAt:
      Date.now(),

    });

    Alert.alert(
      'Succès',
      'Commande envoyée',
    );
  };

  return (

    <ScrollView
     contentContainerStyle={
      GlobalStyles.container
     }>

      <View style={styles.header}>
        <Text
         style={
         GlobalStyles.title
        }>
          Bonjour 👋, {userName}
        </Text>
        <TouchableOpacity 
          style={styles.sosButton}
          onPress={handleSOS}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <MapView
       style={{
        height:250,
        borderRadius:15,
       }}
      />

      <TextInput
       placeholder="Départ"
       value={pickup}
       onChangeText={
        setPickup
       }
       style={
        GlobalStyles.input
       }
      />

      <TextInput
       placeholder="Destination"
       value={destination}
       onChangeText={
        setDestination
       }
       style={
        GlobalStyles.input
       }
      />

      <Text style={styles.sectionTitle}>Choisir un véhicule</Text>
      <View style={styles.vehicleGrid}>
        {vehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            style={[
              styles.vehicleCard,
              vehicleType.id === v.id && styles.selectedVehicle
            ]}
            onPress={() => setVehicleType(v)}
          >
            <Text style={[
              styles.vehicleLabel,
              vehicleType.id === v.id && styles.selectedText
            ]}>{v.label}</Text>
            <Text style={styles.vehicleDesc}>{v.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
       style={
       GlobalStyles.button
      }
       onPress={sendRide}
      >
        <Text
         style={
         GlobalStyles.buttonText
        }>
          Commander
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sosButton: {
    backgroundColor: '#D32F2F',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  sosText: { color: '#FFF', fontWeight: 'bold' },
  mapContainer: { marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  vehicleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vehicleCard: {
    width: width * 0.28,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedVehicle: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
  },
  vehicleLabel: { fontWeight: 'bold', fontSize: 12 },
  vehicleDesc: { fontSize: 10, color: '#666' },
  selectedText: { color: '#D32F2F' }
});