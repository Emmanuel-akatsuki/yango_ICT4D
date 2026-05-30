import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const gererConnexion = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Veuillez remplir votre e-mail et votre mot de passe.");
      return;
    }

    try {
      setLoading(true);
      // Connexion via Firebase Authentication
      await auth().signInWithEmailAndPassword(email, password);
      // La bascule d'écran vers l'accueil est gérée automatiquement par AppNavigator
    } catch (error: any) {
      Alert.alert("Échec de la connexion", "Identifiants incorrects ou compte inexistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion Yango</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Adresse e-mail" 
        placeholderTextColor="#666" 
        keyboardType="email-address"
        autoCapitalize="none"
        value={email} 
        onChangeText={setEmail} 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Mot de passe" 
        placeholderTextColor="#666" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />

      <TouchableOpacity style={styles.btn} onPress={gererConnexion} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Se connecter</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    color: '#000',
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#111',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    fontSize: 14,
  },
});
