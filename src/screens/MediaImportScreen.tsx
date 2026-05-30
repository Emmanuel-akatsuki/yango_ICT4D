import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { uploadMedia, saveProject } from '../services/supabaseService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const MediaImportScreen = ({ navigation }: any) => {
  const [selectedMedia, setSelectedMedia] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 0, // Illimité
    });

    if (result.assets) {
      setSelectedMedia([...selectedMedia, ...result.assets]);
    }
  };

  const handleUploadAll = async () => {
    if (selectedMedia.length === 0) return;
    
    setUploading(true);
    try {
      for (const asset of selectedMedia) {
        if (asset.uri && asset.fileName) {
          const url = await uploadMedia(asset.uri, asset.fileName);
          if (url) {
            // Sauvegarde dans la DB Supabase (Jour 3)
            await saveProject('user_test_001', asset.fileName, url);
          }
        }
      }
      Alert.alert('Succès', 'Tous les fichiers ont été importés dans votre studio.');
      navigation.navigate('ProjectsHome');
    } catch (error) {
      Alert.alert('Erreur', 'L\'importation a échoué');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importer des médias</Text>
      
      <TouchableOpacity style={styles.pickButton} onPress={pickMedia}>
        <Icon name="plus-box-multiple" size={40} color="#FFB800" />
        <Text style={styles.pickText}>Sélectionner des vidéos de la galerie</Text>
      </TouchableOpacity>

      <FlatList
        data={selectedMedia}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.mediaThumbnail}>
            <Icon name="play-circle" size={30} color="white" style={styles.playIcon} />
            <Text style={styles.fileName} numberOfLines={1}>{item.fileName}</Text>
          </View>
        )}
        style={styles.list}
      />

      {selectedMedia.length > 0 && (
        <TouchableOpacity 
          style={[styles.uploadButton, uploading && styles.disabledButton]} 
          onPress={handleUploadAll}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.uploadButtonText}>Lancer l'importation ({selectedMedia.length})</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  pickButton: {
    height: 150,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  pickText: { color: '#888', marginTop: 10 },
  list: { flex: 1 },
  mediaThumbnail: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#333',
    margin: '1.5%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playIcon: { position: 'absolute', opacity: 0.7 },
  fileName: { color: 'white', fontSize: 10, position: 'absolute', bottom: 5, paddingHorizontal: 5 },
  uploadButton: { backgroundColor: '#FFB800', padding: 18, borderRadius: 12, alignItems: 'center' },
  disabledButton: { backgroundColor: '#555' },
  uploadButtonText: { color: 'black', fontWeight: 'bold', fontSize: 16 }
});