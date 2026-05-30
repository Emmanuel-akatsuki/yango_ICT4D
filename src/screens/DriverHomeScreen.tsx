import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');
const YAOUNDE = { latitude: 3.8666, longitude: 11.5167, latitudeDelta: 0.04, longitudeDelta: 0.04 };

export default function DriverHomeScreen({ navigation }: any) {
  const [commandesEnAttente, setCommandesEnAttente] = useState<any[]>([]);
  const [monTaxi, setMonTaxi] = useState<any>(null);
  const [nomChauffeur, setNomChauffeur] = useState('Chauffeur'); // 💡 État pour le nom
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chargerCaracteristiquesTaxi();
    recupererNomChauffeur(); // 💡 Charge le nom du chauffeur au démarrage

    const unsubscribe = firestore()
      .collection('commandes')
      .where('statut', '==', 'en_attente')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        (snapshot) => {
          if (snapshot) {
            const liste: any[] = [];
            snapshot.forEach((doc) => {
              liste.push({ id: doc.id, ...doc.data() });
            });
            setCommandesEnAttente(liste);
          }
        },
        (error) => console.log(error)
      );

    return () => unsubscribe();
  }, []);

  // 💡 RÉCUPÉRATION : Charge le vrai nom du chauffeur depuis Firestore
  const recupererNomChauffeur = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const doc = await firestore().collection('users').doc(currentUser.uid).get();
      if (doc.exists && doc.data()?.nom) {
        setNomChauffeur(doc.data()?.nom);
      }
    }
  };

  const chargerCaracteristiquesTaxi = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const taxiDoc = await firestore()
        .collection('taxis')
        .where('driverId', '==', currentUser.uid)
        .get();

      if (!taxiDoc.empty) {
        setMonTaxi(taxiDoc.docs.data());
      } else {
        const vehiculeTest = {
          driverId: currentUser.uid,
          modele: "Toyota Yaris (Standard)",
          couleur: "Jaune Yango",
          immatriculation: "CE 442-IX"
        };
        await firestore().collection('taxis').add(vehiculeTest);
        setMonTaxi(vehiculeTest);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const accepterCourse = async (commandeId: string) => {
    try {
      setLoading(true);
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      await firestore().collection('commandes').doc(commandeId).update({
        statut: 'acceptee',
        driverId: currentUser.uid,
      });

      setLoading(false);
      Alert.alert("Course Acceptée ✅", "Vous avez pris en charge ce passager.");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Erreur", error.message);
    }
  };

  return (
    <View style={styles.c}>
      {loading && <View style={styles.loader}><ActivityIndicator size="large" color="#D32F2F" /></View>}

      <MapView provider={PROVIDER_GOOGLE} style={styles.m} region={YAOUNDE} showsUserLocation />

      {/* 🧾 Tableau de bord supérieur : Affiche le NOM et le VÉHICULE du chauffeur connecté */}
      <View style={styles.infosTaxiBox}>
        <Text style={styles.taxiTitle}>👨‍✈️ Chauffeur : <Text style={{ color: '#FFD600' }}>{nomChauffeur}</Text></Text>
        <Text style={styles.taxiSub}>🚖 Véhicule : {monTaxi ? `${monTaxi.couleur} • ${monTaxi.modele} [${monTaxi.immatriculation}]` : 'Chargement...'}</Text>
      </View>

      <View style={styles.box}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Courses disponibles ({commandesEnAttente.length})</Text>
          {navigation && (
            <TouchableOpacity style={styles.btnNav} onPress={() => navigation.navigate('ClientHome')}>
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>🔄 Mode Client</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={commandesEnAttente}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 220 }}
          renderItem={({ item }) => (
            <View style={styles.itemCommande}>
              <View style={{ flex: 1 }}>
                <Text style={styles.textRoute} numberOfLines={1}>📍 {item.depart} ➔ {item.destination}</Text>
                <Text style={styles.textTel}>📞 Client : {item.telephoneClient}</Text>
              </View>
              <TouchableOpacity style={styles.btnAccepter} onPress={() => accepterCourse(item.id)}>
                <Text style={styles.btnAccepterText}>Prendre</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.texteVide}>Aucune commande en attente...</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center' },
  m: { ...StyleSheet.absoluteFillObject },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99, justifyContent: 'center', alignItems: 'center' },
  infosTaxiBox: { position: 'absolute', top: 40, left: 15, right: 15, backgroundColor: '#111', borderRadius: 12, padding: 15, elevation: 5, zIndex: 2 },
  taxiTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  taxiSub: { color: '#AAA', fontSize: 13 },
  box: { backgroundColor: '#FFF', width: width, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, elevation: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  btnNav: { backgroundColor: '#D32F2F', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  itemCommande: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  textRoute: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
  textTel: { fontSize: 13, color: '#666' },
  btnAccepter: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  btnAccepterText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  texteVide: { color: '#888', textAlign: 'center', marginVertical: 30, fontSize: 14 }
});
