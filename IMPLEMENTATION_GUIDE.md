# Yango ICT4D - Application Chauffeur

## 📱 Vue d'ensemble

Application React Native pour les chauffeurs Yango permettant :
- ✅ Gestion du statut en ligne/hors ligne
- ✅ Réception et acceptation/refus de courses en temps réel
- ✅ Navigation avec suivi de position en direct
- ✅ Gestion des différentes étapes de la course
- ✅ Feedback et notation après course

## 🎯 Plan de développement 5 jours

### Jour 1-2 : Écran d'accueil et gestion du statut
- [x] Création de l'écran d'accueil pour le chauffeur
- [x] Intégration du bouton "En ligne / Hors ligne"
- [x] Affichage de la carte principale avec suivi de position
- [x] Service de gestion du statut du chauffeur

### Jour 3 : Gestion des courses en temps réel
- [x] Pop-up de réception de course
- [x] Écouteur Firestore pour courses en attente
- [x] Boutons interactifs Accepter/Refuser

### Jour 4-5 : Mode navigation et changements d'état
- [x] Écran de navigation vers client/destination
- [x] Boutons : "Arrivé", "Commencer la course", "Terminer la course"
- [x] Gestion des changements d'état
- [x] Écran de completion et feedback

## 📂 Structure des fichiers

```
src/
├── components/
│   └── RideRequestPopup.tsx          # Pop-up de réception de course
├── config/
│   └── firebase.ts                   # Configuration Firebase
├── screens/
│   ├── DriverMainScreen.tsx          # Navigation principale (onglets)
│   ├── DriverHomeScreen.tsx          # Écran d'accueil
│   ├── RideNavigationScreen.tsx      # Écran de navigation
│   └── RideCompletionScreen.tsx      # Écran de completion
└── services/
    ├── authService.ts                # Authentification
    ├── driverStatusService.ts        # Gestion du statut chauffeur
    ├── rideService.ts                # Gestion des courses
    ├── userService.ts                # Gestion des utilisateurs
    ├── geoService.ts                 # Services géographiques
    └── testDataService.ts            # Données de test
```

## 🚀 Initialisation et Test

### 1. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 2. Initialiser les données de test

Deux options :

#### Option A : Via App.tsx (recommandé pour dev)

Modifier `App.tsx` :
```typescript
import { initializeTestData } from './src/services/testDataService';

useEffect(() => {
  // Initialiser les données de test
  initializeTestData(TEST_DRIVER_ID).catch(console.error);
}, []);
```

#### Option B : Via console de débogage

```typescript
import { initializeTestData } from './src/services/testDataService';
await initializeTestData('driver_test_001');
```

### 3. Lancer l'app

```bash
# Android
npm run android

# iOS
npm run ios
```

### 4. Tester les fonctionnalités

#### Test 1 : Basculer En ligne/Hors ligne
1. Appuyer sur le bouton toggle "En ligne/Hors ligne"
2. La position doit commencer à être suivie
3. Vérifier dans Firestore que `drivers/{driverId}.isOnline = true`

#### Test 2 : Réception de course
1. Assurez-vous d'être en ligne
2. Aller dans Firestore et créer manuellement une course avec status "pending"
3. Le pop-up de réception devrait apparaître automatiquement
4. Tester les boutons Accepter/Refuser

#### Test 3 : Navigation
1. Accepter une course depuis le pop-up
2. Basculer vers l'onglet "Navigation"
3. Vérifier que la carte montre le trajet vers le client
4. Tester les boutons "Arrivé" → "Commencer" → "Terminer"

#### Test 4 : Feedback
1. À la fin de la course, l'écran de notation doit apparaître
2. Donner une note et des commentaires
3. Vérifier que les données sont sauvegardées dans Firestore

## 🔧 Configuration Firestore

### Collections et documents à créer

#### Collection: `drivers`
```json
{
  "driverId": {
    "nom": "Jean Dupont",
    "email": "driver@test.com",
    "telephone": "+237123456789",
    "isOnline": false,
    "currentPosition": {
      "latitude": 4.0511,
      "longitude": 9.7679
    },
    "lastUpdated": "2024-05-26T12:00:00Z",
    "note": 4.8,
    "totalCourses": 42,
    "totalEarnings": 125000,
    "acceptanceRate": 0.95,
    "role": "driver",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Collection: `rides`
```json
{
  "rideId": {
    "clientId": "client_001",
    "driverId": "driver_test_001",
    "pickupLocation": {
      "latitude": 4.0511,
      "longitude": 9.7679
    },
    "pickupAddress": "Avenue Kennedy, Yaoundé",
    "dropoffLocation": {
      "latitude": 4.0480,
      "longitude": 9.7620
    },
    "dropoffAddress": "Centre Hospitalier Universitaire, Yaoundé",
    "status": "pending|accepted|arriving|arrived|in_progress|completed",
    "fare": 3500,
    "distance": 2500,
    "duration": 900,
    "requestedAt": "2024-05-26T12:00:00Z",
    "acceptedAt": null,
    "startedAt": null,
    "completedAt": null,
    "driverRating": null,
    "driverComments": ""
  }
}
```

## 🎨 Design et Couleurs

- **Primaire** : #FFB800 (Jaune/Or - Yango)
- **Succès** : #4CAF50 (Vert)
- **Erreur** : #f44336 (Rouge)
- **Info** : #2196F3 (Bleu)
- **Dark** : #1a1a1a
- **Light** : #f5f5f5

## 🔐 Permissions requises

### Android
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS
Ajouter dans `Info.plist` :
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>L'application a besoin de votre localisation pour proposer les courses</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>L'application a besoin de votre localisation en arrière-plan pour le suivi</string>
```

## 📝 TODO et Prochaines étapes

### Haute Priorité
- [ ] Tester complètement sur Android/iOS
- [ ] Ajouter la géoquerying avec geofire-common pour les alentours
- [ ] Gestion complète des erreurs réseau
- [ ] Persistance des données en cache local

### Moyenne Priorité
- [ ] Écran d'historique des courses
- [ ] Profil du chauffeur avec statistiques
- [ ] Notifications push pour courses
- [ ] Support du mode sombre

### Basse Priorité
- [ ] Support multilingue
- [ ] Analytics et tracking
- [ ] Intégration paiement
- [ ] Support mode offline

## 🐛 Dépannage

### Les courses ne s'affichent pas
1. Vérifier que la base de données Firestore contient des courses avec status "pending"
2. Vérifier que le chauffeur est en ligne (`isOnline = true`)
3. Vérifier les logs console pour les erreurs

### La géolocalisation ne fonctionne pas
1. Vérifier les permissions dans les paramètres de l'app
2. Activer les services de localisation du téléphone
3. Vérifier que vous n'êtes pas en mode de débogage réseau

### La carte ne charge pas
1. Vérifier que la clé Google Maps est configurée dans les fichiers build
2. Vérifier la connexion internet
3. Redémarrer l'application

## 📞 Support

Pour toute question ou problème, consultez :
- Documentation Firebase: https://firebase.google.com/docs
- React Native Maps: https://github.com/react-native-maps/react-native-maps
- Geofire Common: https://github.com/FirebaseExtended/geofire-common

## 📄 Licence

Copyright © 2024 Yango ICT4D. Tous droits réservés.
