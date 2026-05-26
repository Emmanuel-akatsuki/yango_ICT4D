import { db } from '../config/firebase';
import { doc, setDoc, collection, addDoc, GeoPoint, Timestamp } from 'firebase/firestore';

/**
 * Service pour initialiser les données de test
 * À exécuter une seule fois au démarrage
 */

/**
 * Initialiser les données du chauffeur de test
 */
export async function initializeTestDriver(
  driverId: string,
  driverName: string = 'Jean Dupont',
  email: string = 'driver@test.com',
  phone: string = '+237123456789'
) {
  const driverRef = doc(db, 'drivers', driverId);
  
  await setDoc(
    driverRef,
    {
      nom: driverName,
      email,
      telephone: phone,
      isOnline: false,
      currentPosition: new GeoPoint(4.0511, 9.7679), // Position par défaut (Yaoundé)
      lastUpdated: Timestamp.now(),
      note: 4.8,
      totalCourses: 42,
      totalEarnings: 125000,
      acceptanceRate: 0.95,
      role: 'driver',
      createdAt: Timestamp.now(),
    },
    { merge: true } // Fusion avec les données existantes
  );

  console.log('✅ Chauffeur de test initialisé:', driverId);
}

/**
 * Créer des courses de test pour le développement
 */
export async function createTestRides() {
  const testRides = [
    {
      clientId: 'client_001',
      driverId: null,
      pickupLocation: new GeoPoint(4.0511, 9.7679),
      pickupAddress: 'Avenue Kennedy, Yaoundé',
      dropoffLocation: new GeoPoint(4.0480, 9.7620),
      dropoffAddress: 'Centre Hospitalier Universitaire, Yaoundé',
      status: 'pending',
      fare: 3500,
      distance: 2.5 * 1000, // en mètres
      duration: 900, // en secondes (15 minutes)
      requestedAt: Timestamp.now(),
    },
    {
      clientId: 'client_002',
      driverId: null,
      pickupLocation: new GeoPoint(4.0530, 9.7700),
      pickupAddress: 'Gare centrale, Yaoundé',
      dropoffLocation: new GeoPoint(4.0450, 9.7650),
      dropoffAddress: 'Aéroport international de Yaoundé',
      status: 'pending',
      fare: 8500,
      distance: 22 * 1000, // 22 km
      duration: 1800, // 30 minutes
      requestedAt: Timestamp.now(),
    },
    {
      clientId: 'client_003',
      driverId: null,
      pickupLocation: new GeoPoint(4.0450, 9.7700),
      pickupAddress: 'Mall Yaoundé, Yaoundé',
      dropoffLocation: new GeoPoint(4.0500, 9.7650),
      dropoffAddress: 'Quartier Bastos, Yaoundé',
      status: 'pending',
      fare: 5000,
      distance: 4 * 1000,
      duration: 600, // 10 minutes
      requestedAt: Timestamp.now(),
    },
  ];

  const createdRides = [];
  for (const ride of testRides) {
    try {
      const docRef = await addDoc(collection(db, 'rides'), ride);
      createdRides.push({ id: docRef.id, ...ride });
      console.log('✅ Course de test créée:', docRef.id);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la course:', error);
    }
  }

  return createdRides;
}

/**
 * Initialiser les données de test (à appeler une fois au démarrage)
 */
export async function initializeTestData(driverId: string) {
  try {
    console.log('🔄 Initialisation des données de test...');
    
    // 1. Initialiser le chauffeur
    await initializeTestDriver(driverId);
    
    // 2. Créer des courses de test
    await createTestRides();
    
    console.log('✅ Données de test initialisées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

/**
 * Nettoyer les données de test
 */
export async function cleanupTestData() {
  console.log('⚠️ Nettoyage des données de test');
  // À implémenter si nécessaire
}
