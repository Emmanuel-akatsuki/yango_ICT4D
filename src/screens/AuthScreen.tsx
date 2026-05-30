import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function AuthScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await auth().signInWithEmailAndPassword(email, password);
      } else {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        // Sauvegarde des infos dans Firebase Firestore
        await firestore().collection('users').doc(userCredential.user.uid).set({
          email: email.toLowerCase(),
          createdAt: firestore.FieldValue.serverTimestamp(),
          lastLogin: firestore.FieldValue.serverTimestamp(),
        });
      }
      // Une fois identifié, on passe au choix du rôle
      navigation.replace('RoleSelection');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.logo}>🔴 Yango ICT4D</Text>
          <Text style={styles.title}>{isLogin ? 'Connexion' : 'Créer un compte'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.7 }]} 
            onPress={handleAuth} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'SE CONNECTER' : "S'INSCRIRE"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isLogin ? "Nouveau ici ? Créez un compte" : 'Déjà inscrit ? Connectez-vous'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, padding: 30, justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#D32F2F', textAlign: 'center', marginBottom: 50 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 25, color: '#333' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#EEE', borderRadius: 12, padding: 18, marginBottom: 15, fontSize: 16, color: '#000' },
  button: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  switchButton: { marginTop: 25, alignItems: 'center' },
  switchText: { color: '#D32F2F', fontSize: 15, fontWeight: '500' },
});