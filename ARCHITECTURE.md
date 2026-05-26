# Architecture et Services - Yango Driver App

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────┐
│           App.tsx (Racine)              │
│  Gestion de l'authentification et       │
│  navigation vers DriverMainScreen       │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      DriverMainScreen (Onglets)         │
│  Navigation entre Home et Navigation     │
│  • Accueil                              │
│  • Navigation                           │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
  ┌────────────┐  ┌──────────────────┐
  │   Home     │  │    Navigation    │
  │   Screen   │  │     Screen       │
  └────────────┘  └──────────────────┘
      │ │              │ │
      │ │              │ └─ RideCompletionScreen
      │ └─ RideRequestPopup
      │
      └─ Services Firestore
         • driverStatusService
         • rideService
         • geoService
```

## 📦 Services Expliqués

### 1. **driverStatusService.ts**
Gère le statut et la position du chauffeur

#### Fonctions principales :
```typescript
// Mettre à jour le statut du chauffeur
updateDriverStatus(driverId, isOnline, position)

// Écouter les changements de position en temps réel
subscribeToDriverPosition(driverId, callback)

// Obtenir les infos du chauffeur
getDriverInfo(driverId)
```

#### Exemple d'utilisation :
```typescript
import { updateDriverStatus, subscribeToDriverPosition } from '../services/driverStatusService';

// Mettre le chauffeur en ligne
await updateDriverStatus('driver_123', true, {
  lat: 4.0511,
  lng: 9.7679
});

// Écouter sa position
const unsubscribe = subscribeToDriverPosition('driver_123', (position) => {
  console.log('Nouvelle position:', position);
});

// Arrêter l'écoute
unsubscribe();
```

### 2. **rideService.ts**
Gère les courses et leur cycle de vie

#### Enums et types :
```typescript
enum RideStatus {
  PENDING = 'pending',        // En attente
  ACCEPTED = 'accepted',      // Acceptée
  ARRIVING = 'arriving',      // En route vers client
  ARRIVED = 'arrived',        // Arrivé chez client
  IN_PROGRESS = 'in_progress',// En cours
  COMPLETED = 'completed',    // Terminée
  CANCELLED = 'cancelled'     // Annulée
}
```

#### Fonctions principales :
```typescript
// Créer une demande de course (client)
createRideRequest(clientId, pickupLoc, dropoffLoc, ...) → rideId

// Chauffeur accepte une course
acceptRide(rideId, driverId)

// Chauffeur refuse une course
rejectRide(rideId)

// Signaler l'arrivée chez le client
markAsArrived(rideId)

// Commencer la course
startRide(rideId)

// Terminer la course
completeRide(rideId)

// Écouter les courses en attente (pour les chauffeurs)
subscribeToPendingRides(lat, lng, radiusKm, callback) → unsubscribe

// Écouter la course actuelle du chauffeur
subscribeToCurrentRide(driverId, callback) → unsubscribe
```

#### Exemple d'utilisation :
```typescript
import {
  acceptRide,
  subscribeToCurrentRide,
  RideStatus,
} from '../services/rideService';

// Accepter une course
await acceptRide('ride_456', 'driver_123');

// Écouter la course actuelle
const unsub = subscribeToCurrentRide('driver_123', (ride) => {
  if (ride) {
    console.log('Course actuelle:', ride.status);
    
    if (ride.status === RideStatus.ACCEPTED) {
      // Afficher le trajet vers le client
    } else if (ride.status === RideStatus.IN_PROGRESS) {
      // Afficher le trajet vers la destination
    }
  }
});
```

### 3. **driverStatusService.ts** + **rideService.ts** (Flux complet)

```
Chauffeur en ligne
    ↓
Écoute des courses
    ↓
Réception d'une course → Pop-up
    ↓
Accepter / Refuser
    ↓
Status = ACCEPTED
    ↓
Navigation vers client
    ↓
Arrivé → Status = ARRIVED
    ↓
Commencer course → Status = IN_PROGRESS
    ↓
Navigation vers destination
    ↓
Terminer → Status = COMPLETED
    ↓
Écran de feedback
```

### 4. **testDataService.ts**
Service d'initialisation des données de test

#### Fonctions :
```typescript
// Initialiser un chauffeur de test
initializeTestDriver(driverId, nom, email, phone)

// Créer des courses de test
createTestRides() → [rideId, ...]

// Initialiser tout (driver + courses)
initializeTestData(driverId)

// Nettoyer les données de test
cleanupTestData()
```

## 🔄 Flux de données Firestore

### Structure des documents

#### Driver document
```
/drivers/{driverId}
├── nom: string
├── email: string
├── isOnline: boolean
├── currentPosition: GeoPoint {latitude, longitude}
├── lastUpdated: Timestamp
├── note: number (4.8)
├── totalCourses: number
└── totalEarnings: number
```

#### Ride document
```
/rides/{rideId}
├── clientId: string
├── driverId: string (null au début)
├── pickupLocation: GeoPoint
├── pickupAddress: string
├── dropoffLocation: GeoPoint
├── dropoffAddress: string
├── status: string (enum RideStatus)
├── fare: number
├── distance: number (en mètres)
├── duration: number (en secondes)
├── requestedAt: Timestamp
├── acceptedAt: Timestamp
├── startedAt: Timestamp
├── completedAt: Timestamp
├── driverRating: number
└── driverComments: string
```

## 🎯 Cas d'utilisation typiques

### Cas 1 : Chauffeur se connecte et devient disponible

```typescript
// 1. Dans App.tsx
const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  const unsub = onAuthChange((user) => {
    setCurrentUser(user);
    // Initialiser les données du chauffeur
    await initializeTestDriver(user.uid);
  });
}, []);

// 2. Dans DriverHomeScreen
const [isOnline, setIsOnline] = useState(false);

const handleToggleOnline = async () => {
  await updateDriverStatus(driverId, !isOnline, currentPosition);
  setIsOnline(!isOnline);
};

// 3. Écouter les courses
useEffect(() => {
  if (!isOnline) return;
  
  const unsub = subscribeToPendingRides(
    currentPosition.lat,
    currentPosition.lng,
    5,
    (rides) => {
      if (rides.length > 0) {
        // Afficher le pop-up
        setCurrentRideRequest(rides[0]);
      }
    }
  );
  
  return () => unsub();
}, [isOnline, currentPosition]);
```

### Cas 2 : Chauffeur accepte une course

```typescript
// 1. Dans RideRequestPopup
const handleAccept = async () => {
  await acceptRide(rideRequest.id, driverId);
  // La course passe à status ACCEPTED
  // RideNavigationScreen commence à afficher la carte
};

// 2. Dans RideNavigationScreen
useEffect(() => {
  const unsub = subscribeToCurrentRide(driverId, (ride) => {
    setCurrentRide(ride);
    // La UI se met à jour automatiquement
  });
  
  return () => unsub();
}, [driverId]);
```

### Cas 3 : Progression de la course

```typescript
// État initial : ACCEPTED
// → Afficher bouton "Arrivé"
const handleArrivedAtPickup = async () => {
  await markAsArrived(currentRide.id);
  // Status passe à ARRIVED
  // → Afficher bouton "Commencer la course"
};

// Chauffeur a cliqué "Arrivé"
const handleStartRide = async () => {
  await startRide(currentRide.id);
  // Status passe à IN_PROGRESS
  // → Afficher bouton "Terminer la course"
};

// En route vers destination
const handleCompleteRide = async () => {
  await completeRide(currentRide.id);
  // Status passe à COMPLETED
  // → Afficher RideCompletionScreen
};
```

## 🔗 Intégration avec Firebase Rules

Firestore Rules recommandées :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chauffeurs ne peuvent lire/écrire que leurs propres données
    match /drivers/{driverId} {
      allow read, write: if request.auth.uid == driverId;
    }
    
    // Courses lisibles par client et chauffeur
    match /rides/{rideId} {
      allow read: if 
        request.auth.uid == resource.data.clientId || 
        request.auth.uid == resource.data.driverId;
      allow update: if request.auth.uid == resource.data.driverId;
    }
  }
}
```

## 📊 État de l'application en Redux (optionnel)

Si vous voulez ajouter Redux à l'avenir :
```typescript
// store/slices/driverSlice.ts
const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    id: null,
    isOnline: false,
    position: null,
    currentRide: null,
  },
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
    },
  },
});
```

## 🚀 Optimisations futures

1. **Caching local** : Utiliser AsyncStorage pour les données locales
2. **Recherche géographique** : Implémenter geofire-common pour meilleure pérf
3. **Notifications** : Ajouter Firebase Cloud Messaging
4. **Offline support** : Firestore offline persistence
5. **Analytics** : Google Analytics pour Firebase
