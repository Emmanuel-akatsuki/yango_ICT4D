import React, {useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';

import {
  loginUser,
  getUserData,
} from '../services/authService';

type Props = {
  navigation: any;
};

export default function LoginScreen({
  navigation,
}: Props) {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const handleLogin =
    async () => {
      try {
        if (
          !email.trim() ||
          !password.trim()
        ) {
          Alert.alert(
            'Erreur',
            'Veuillez remplir tous les champs.',
          );
          return;
        }

        const result =
          await loginUser(
            email,
            password,
          );

        const user =
          await getUserData(
            result.user.uid,
          );

        if (
          user.role === 'client'
        ) {
          navigation.replace('ClientHome', {
            userName: user.name || 'Utilisateur',
          });
        } else {
          navigation.replace('DriverHome', {
            userName: user.name || 'Chauffeur',
          });
        }
      } catch (error: any) {
        Alert.alert(
          'Connexion échouée',
          error.message,
        );
      }
    };

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }>
      <Text style={styles.logo}>
         YANGOCLONE
      </Text>

      <Text style={styles.title}>
        Connexion
      </Text>

      <Text style={styles.label}>
        Adresse email
      </Text>

      <TextInput
        placeholder="exemple@gmail.com"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>
        Mot de passe
      </Text>

      <TextInput
        placeholder="********"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}>
        <Text
          style={styles.buttonText}>
          Se connecter
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            'Register',
          )
        }>
        <Text
          style={styles.link}>
          Pas encore de compte ?
          {'\n'}
          Créer un compte
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 25,
      backgroundColor:
        '#FFFFFF',
    },

    logo: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#D32F2F',
      textAlign: 'center',
      marginBottom: 10,
    },

    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#D32F2F',
      textAlign: 'center',
      marginBottom: 30,
    },

    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
      color: '#333',
    },

    input: {
      backgroundColor:
        '#F5F5F5',
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 12,
      padding: 14,
      marginBottom: 15,
    },

    button: {
      backgroundColor:
        '#D32F2F',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },

    buttonText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 16,
    },

    link: {
      textAlign: 'center',
      marginTop: 20,
      color: '#D32F2F',
      fontWeight: 'bold',
    },
  });