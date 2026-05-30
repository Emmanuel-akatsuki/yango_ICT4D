import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, PermissionsAndroid, Platform, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import { launchCamera } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const { width } = Dimensions.get('window');
const YAOUNDE = { latitude: 3.8666, longitude: 11.5167, latitudeDelta: 0.03, longitudeDelta: 0.03 };

export default function ClientHomeScreen({ navigation }: any) {
  const [currentLocation, setCurrentLocation] = useState(YAOUNDE);
  const [estConnecte, setEstConnecte] = useState<boolean | null>(true);
  const [nomUtilisateur, setNomUtilisateur] = useState('Passager'); // 💡 État pour le nom
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');
  const [telephone, setTelephone] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [secoursPoints, setSecoursPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(s => setEstConnecte(s.isConnected));
    demanderGPS();
    recupererNomUtilisateur(); // 💡 Charge le nom au démarrage
    return () => unsub();
  }, []);

  // 💡 RÉCUPÉRATION : Charge le vrai nom depuis Firestore
  const recupererNomUtilisateur = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const doc = await firestore().collection('users').doc(currentUser.uid).get();
      if (doc.exists && doc.data()?.nom) {
        setNomUtilisateur(doc.data()?.nom);
      }
    }
  };

  const demanderGPS = async () => {
    if (Platform.OS === 'android') {
      const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (g === PermissionsAndroid.RESULTS.GRANTED) ActiverGPS();
    } else {
      ActiverGPS();
    }
  };

  const ActiverGPS = () => {
    Geolocation.getCurrentPosition(
      p => {
        setCurrentLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 });
        setDepart("Ma position actuelle");
      },
      e => console.log(e),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const passerCommandeTaxi = async () => {
    if (!destination.trim() || !telephone.trim()) {
      Alert.alert("Champs requis", "Veuillez entrer une destination et votre numéro de téléphone.");
      return;
    }
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      await firestore().collection('commandes').add({
        clientId: currentUser.uid,
        telephoneClient: telephone,
        depart: depart || "Position inconnue",
        destination: destination,
        statut: 'en_attente',
        driverId: null,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      setLoading(false);
      Alert.alert("Course demandée 🚖", "Votre commande a été envoyée en temps réel.");
      setDestination('');
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Échec", err.message);
    }
  };

  const SOS_Secours = async () => {
    setModalVisible(false);
    try {
      const snap = await firestore().collection('emergency_points').get();
      const points: any[] = [];
      snap.forEach(d => points.push({ id: d.id, ...d.data() }));
      setSecoursPoints(points);
      Alert.alert("🚨 Secours localisés", `${points.length} points ajoutés.`);
    } catch (err: any) {
      Alert.alert("Erreur SOS", err.message);
    }
  };

  const SOS_Video = () => {
    setModalVisible(false);
    launchCamera({ mediaType: 'video', videoQuality: 'low', durationLimit: 10 }, async (res) => {
      if (!res.assets || !res.assets.uri) return;
      try {
        setLoading(true);
        const path = `sos_videos/SOS_${Date.now()}.mp4`;
        await storage().ref(path).putFile(res.assets.uri);
        const url = await storage().ref(path).getDownloadURL();
        await firestore().collection('incidents_sos').add({
          position: new firestore.GeoPoint(currentLocation.latitude, currentLocation.longitude),
          videoUrl: url,
          timestamp: firestore.FieldValue.serverTimestamp()
        });
        setLoading(false);
        Alert.alert("Alerte Sécurisée 🚨", "La preuve vidéo a été téléversée.");
      } catch (err: any) {
        setLoading(false);
        Alert.alert("Erreur", err.message);
      }
    });
  };

  return (
    <View style={styles.c}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      )}

      <MapView provider={PROVIDER_GOOGLE} style={styles.m} region={currentLocation} showsUserLocation>
        <Marker coordinate={currentLocation} title="Ma position" pinColor="green" />
        {secoursPoints.map((p, i) => (
          <Marker key={i} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.name} pinColor="blue" />
        ))}
      </MapView>

      {/* 💡 NOUVEAU BANDEAU SUPÉRIEUR : Affiche le nom du Passager connecté */}
      <View style={styles.profilBandeau}>
        <Text style={styles.profilTexte}>👤 Passager : <Text style={{ fontWeight: 'bold' }}>{nomUtilisateur}</Text></Text>
      </View>

      <TouchableOpacity style={styles.sos} onPress={() => setModalVisible(true)}>
        <Text style={styles.sosT}>🚨 SOS</Text>
      </TouchableOpacity>

      <View style={styles.box}>
        <Text style={styles.title}>Demander une course Yango</Text>
        {navigation && (
          <TouchableOpacity style={styles.btnNav} onPress={() => navigation.navigate('DriverHome')}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>🚖 Naviguer vers l'interface Chauffeur</Text>
          </TouchableOpacity>
        )}
        <TextInput style={styles.input} placeholder="Point de départ" placeholderTextColor="#666" value={depart} onChangeText={setDepart} />
        <TextInput style={styles.input} placeholder="Entrez la destination" placeholderTextColor="#666" value={destination} onChangeText={setDestination} />
        <TextInput style={styles.input} placeholder="Votre numéro de téléphone" placeholderTextColor="#666" keyboardType="phone-pad" value={telephone} onChangeText={setTelephone} />
        <TouchableOpacity style={styles.btnCommander} onPress={passerCommandeTaxi}>
          <Text style={styles.btnCommanderText}>Confirmer la commande</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.mc}>
          <View style={styles.mv}>
            <Text style={styles.mt}>🚨 CENTRE ASSISTANCE SOS</Text>
            <TouchableOpacity style={styles.mo} onPress={SOS_Secours}><Text>🏥 Afficher les secours sur la carte</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.mo, { backgroundColor: '#D32F2F' }]} onPress={SOS_Video}><Text style={{ color: '#FFF' }}>🎥 Enregistrer une preuve vidéo & audio</Text></TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 15 }} onPress={() => setModalVisible(false)}><Text style={{ color: '#777' }}>Annuler</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center' },
  m: { ...StyleSheet.absoluteFillObject },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99, justifyContent: 'center', alignItems: 'center' },
  // Style du nouveau bandeau
  profilBandeau: { position: 'absolute', top: 40, left: 15, backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, elevation: 5, zIndex: 2 },
  profilTexte: { color: '#FFF', fontSize: 14 },
  sos: { position: 'absolute', top: 40, right: 20, backgroundColor: '#D32F2F', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 25, zIndex: 5, elevation: 8 },
  sosT: { color: '#FFF', fontWeight: 'bold' },
  box: { backgroundColor: '#FFF', width: width, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 15 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#111' },
  btnNav: { backgroundColor: '#111', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 15, marginBottom: 12, height: 48, color: '#000' },
  btnCommander: { backgroundColor: '#D32F2F', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnCommanderText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  mc: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  mv: { width: width * 0.85, backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center' },
  mt: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F', marginBottom: 20 },
  mo: { backgroundColor: '#F5F5F5', width: '100%', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' }
});
