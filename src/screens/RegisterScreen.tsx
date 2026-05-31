import React, {useState} from 'react';

import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native';

import {
  registerUser,
} from '../services/authService';

type Props = {
  navigation: any;
};

export default function RegisterScreen({
  navigation,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [role, setRole] =
    useState<
      'client' | 'driver'
    >('client');

  const handleRegister =
    async () => {
      if (loading) return;

      try {
        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
          !name.trim() ||
          !trimmedEmail ||
          !phone.trim() ||
          !password.trim()
        ) {
          Alert.alert(
            'Erreur',
            'Veuillez remplir tous les champs.',
          );
          return;
        }

        if (!emailRegex.test(trimmedEmail)) {
          Alert.alert(
            'Erreur',
            'Veuillez entrer une adresse email valide.',
          );
          return;
        }

        if (password.length < 6) {
          Alert.alert(
            'Erreur',
            'Le mot de passe doit contenir au moins 6 caractères.',
          );
          return;
        }

        setLoading(true);
        await registerUser(
          name.trim(),
          trimmedEmail,
          password,
          phone.trim(),
          role,
        );

        Alert.alert(
          'Succès',
          'Compte créé avec succès.',
        );

        navigation.replace(
          'Login',
        );
      } catch (error: any) {
        console.error('Registration Error:', error);
        Alert.alert(
          'Erreur',
          error.message,
        );
      } finally {
        setLoading(false);
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
        Inscription
      </Text>

      <Text style={styles.label}>
        Nom complet
      </Text>

      <TextInput
        placeholder="emmanuel"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

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
        Téléphone
      </Text>

      <TextInput
        placeholder="695064812"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
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

      <Text style={styles.label}>
        Choisissez votre rôle
      </Text>

      <View
        style={
          styles.roleContainer
        }>
        <TouchableOpacity
          onPress={() =>
            setRole('client')
          }
          style={[
            styles.roleButton,
            role === 'client'
              ? styles.selected
              : styles.unselected,
          ]}>
          <Text
            style={[
              styles.roleText,
              role === 'client'
                ? styles.selectedText
                : styles.unselectedText,
            ]}>
            Client
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setRole('driver')
          }
          style={[
            styles.roleButton,
            role === 'driver'
              ? styles.selected
              : styles.unselected,
          ]}>
          <Text
            style={[
              styles.roleText,
              role === 'driver'
                ? styles.selectedText
                : styles.unselectedText,
            ]}>
            Chauffeur
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text
            style={styles.buttonText}>
            Créer mon compte
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.replace(
            'Login',
          )
        }>
        <Text
          style={styles.link}>
          Déjà un compte ?
          {'\n'}
          Se connecter
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

    roleContainer: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      marginBottom: 20,
    },

    roleButton: {
      width: '48%',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
    },

    selected: {
      backgroundColor:
        '#D32F2F',
    },

    unselected: {
      backgroundColor:
        '#EEEEEE',
    },

    roleText: {
      fontWeight: 'bold',
    },

    selectedText: {
      color: '#FFF',
    },

    unselectedText: {
      color: '#333',
    },

    button: {
      backgroundColor:
        '#D32F2F',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
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