import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  PermissionsAndroid, 
  Platform,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

const POSITION_SECOURS = {
  latitude: 3.8666,
  longitude: 11.5167,
  latitudeDelta: 0.015,
  longitudeDelta: 0.012,
};

export default function ClientHomeScreen() {
  const [currentLocation, setCurrentLocation] = useState(POSITION_SECOURS);
  const [estConnecte, setEstConnecte] = useState<boolean | null>(true);
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');
  
  // État pour afficher ou masquer la fenêtre d'urgence SOS
  const [modalSosVisible, setModalSosVisible] = useState(false);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setEstConnecte(state.isConnected);
    });
    demanderPermissionGPS();
    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  const demanderPermissionGPS = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Accès au GPS requis",
            message: "Yango a besoin de votre position pour vous localiser sur la carte.",
            buttonNeutral: "Plus tard",
            buttonNegative: "Refuser",
            buttonPositive: "Autoriser",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          recupererPositionGPS();
        } else {
          Alert.alert("GPS Refusé", "La localisation automatique est désactivée.");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      recupererPositionGPS();
    }
  };

  const recupererPositionGPS = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.012,
        });
        setDepart("Ma position actuelle");
      },
      (error) => {
        Alert.alert("Erreur GPS", "Impossible de récupérer votre position.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const gererCommandeTrajet = () => {
    if (!estConnecte) {
      Alert.alert("Hors-ligne", "Impossible de commander une course sans connexion.");
      return;
    }
    if (!destination.trim()) {
      Alert.alert("Destination manquante", "Veuillez entrer une destination.");
      return;
    }
    Alert.alert("Recherche", `Course de : ${depart} vers : ${destination}`);
  };

  // Actions du menu d'urgence
  const declencherFilsEtMicro = () => {
    setModalSosVisible(false);
    Alert.alert("SOS : Multimédia", "Déclenchement de la caméra et du micro (Tâche du Développeur 5)...");
  };

  const trouverSecoursProches = () => {
    setModalSosVisible(false);
    Alert.alert("SOS : Secours", "Calcul des points de secours les plus proches (Tâche du Développeur 4)...");
  };
   //..................................
  return (
    <View style={styles.container}>
      {!estConnecte && (
        <View style={styles.bandeauHorsLigne}>
          <Text style={styles.texteHorsLigne}>Connexion Internet perdue.</Text>
        </View>
      )}

      {/* Carte Google Maps */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={currentLocation}
        showsUserLocation={true}
      >
        <Marker coordinate={currentLocation} title="Point de départ" />
      </MapView>

      {/* 🚨 Bouton Flottant SOS Permanent */}
      <TouchableOpacity 
        style={styles.boutonSosFlottant} 
        onPress={() => setModalSosVisible(true)}
      >
        <Text style={styles.texteBoutonSos}>🚨 SOS</Text>
      </TouchableOpacity>

      {/* Boîtier de Commande Yango */}
      <View style={styles.boiteCommande}>
        <Text style={styles.titreBoite}>Où allons-nous ?</Text>
        <View style={styles.conteneurInput}>
          <View style={[styles.pointIndicateur, { backgroundColor: '#4CAF50' }]} />
          <TextInput
            style={styles.inputStyle}
            placeholder="Point de départ"
            placeholderTextColor="#999"
            value={depart}
            onChangeText={setDepart}
          />
        </View>

        <View style={styles.conteneurInput}>
          <View style={[styles.pointIndicateur, { backgroundColor: '#F44336' }]} />
          <TextInput
            style={styles.inputStyle}
            placeholder="Entrez la destination"
            placeholderTextColor="#999"
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <TouchableOpacity style={styles.boutonCommander} onPress={gererCommandeTrajet}>
          <Text style={styles.texteBouton}>Rechercher un véhicule</Text>
        </TouchableOpacity>
      </View>

      {/* 📋 Fenêtre Modale d'Urgence SOS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalSosVisible}
        onRequestClose={() => setModalSosVisible(false)}
      >
        <View style={styles.centrageModal}>
          <View style={styles.vueModal}>
            <Text style={styles.titreModal}>🚨 CENTRE D'URGENCE SOS</Text>
            <Text style={styles.descriptionModal}>Choisissez l'assistance immédiate requise :</Text>

            {/* Option 1 : Points de secours (D4) */}
            <TouchableOpacity style={styles.boutonOptionSos} onPress={trouverSecoursProches}>
              <Text style={styles.texteOptionSos}>🏥 Trouver les secours les plus proches</Text>
            </TouchableOpacity>

            {/* Option 2 : Filmer la scène (D5) */}
            <TouchableOpacity style={[styles.boutonOptionSos, { backgroundColor: '#E53935' }]} onPress={declencherFilsEtMicro}>
              <Text style={[styles.texteOptionSos, { color: '#FFF' }]}>🎥 Filmer la scène & Activer le micro</Text>
            </TouchableOpacity>

            {/* Bouton Annuler */}
            <TouchableOpacity style={styles.boutonFermerModal} onPress={() => setModalSosVisible(false)}>
              <Text style={styles.texteFermerModal}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bandeauHorsLigne: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#D32F2F',
    width: width * 0.9,
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
    alignItems: 'center',
  },
  texteHorsLigne: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  boutonSosFlottant: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 8,
    zIndex: 5,
  },
  texteBoutonSos: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  boiteCommande: {
    backgroundColor: '#FFF',
    width: width,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    elevation: 10,
  },
  titreBoite: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15,
  },
  conteneurInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    height: 50,
  },
  pointIndicateur: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  inputStyle: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  boutonCommander: {
    backgroundColor: '#FFD600',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  texteBouton: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Styles de la fenêtre modale SOS
  centrageModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  vueModal: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titreModal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10,
    textAlign: 'center',
  },
  descriptionModal: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  boutonOptionSos: {
    backgroundColor: '#F5F5F5',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  texteOptionSos: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  boutonFermerModal: {
    marginTop: 10,
    padding: 10,
  },
  texteFermerModal: {
    color: '#777',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
