import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, ActivityIndicator, Alert } from 'react-native';
import Video from 'react-native-video';
import { Canvas, ColorMatrix, Fill, useImage } from '@react-native-skia/skia';
import { BottomToolbar, EditorMode } from '../components/videoEditor/BottomToolbar';
import { exportVideo } from '../services/videoExportService';

const SEPIA_MATRIX = [
  0.393, 0.769, 0.189, 0, 0,
  0.349, 0.686, 0.168, 0, 0,
  0.272, 0.534, 0.131, 0, 0,
  0, 0, 0, 1, 0,
];

export const VideoEditorScreen = ({ route, navigation }: any) => {
  const { videoUri } = route.params;
  const [mode, setMode] = useState<EditorMode>('none');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulation d'audio Supabase (Jour 1-2 Dev 6)
  const [selectedAudio, setSelectedAudio] = useState<string | undefined>();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportVideo({
        videoPath: videoUri,
        audioPath: selectedAudio,
        filter: filter === 'sepia' ? 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131' : undefined,
        textOverlay: text ? { text, color: 'white', fontSize: 24 } : undefined
      }, setProgress);
      
      Alert.alert('Succès', 'Vidéo enregistrée dans la galerie !');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'L\'exportation a échoué');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Lecteur Vidéo avec Filtre Skia (Jour 4-5 Dev 5) */}
      <View style={styles.previewContainer}>
        <Video
          source={{ uri: videoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          repeat
          muted={!!selectedAudio}
        />
        
        {/* Overlay Skia pour prévisualisation Filtre */}
        {filter === 'sepia' && (
          <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <Fill>
              <ColorMatrix matrix={SEPIA_MATRIX} />
            </Fill>
          </Canvas>
        )}

        {/* Overlay Texte (Jour 3 Dev 5) */}
        {text !== '' && (
          <View style={styles.textOverlay}>
            <Text style={styles.previewText}>{text}</Text>
          </View>
        )}
      </View>

      {/* Panneaux de contrôle selon le mode */}
      {mode === 'texte' && (
        <TextInput
          style={styles.textInput}
          placeholder="Tapez votre texte..."
          placeholderTextColor="#666"
          onChangeText={setText}
          value={text}
        />
      )}

      {mode === 'filtres' && (
        <View style={styles.filterBar}>
          <Text style={styles.filterBtn} onPress={() => setFilter(null)}>Normal</Text>
          <Text style={styles.filterBtn} onPress={() => setFilter('sepia')}>Sepia</Text>
        </View>
      )}

      {isExporting && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FFB800" />
          <Text style={{color: 'white', marginTop: 10}}>Exportation en cours...</Text>
        </View>
      )}

      <BottomToolbar activeMode={mode} onModeChange={setMode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textOverlay: {
    position: 'absolute',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  previewText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  textInput: {
    backgroundColor: '#222',
    color: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  filterBtn: { color: '#FFB800', fontWeight: 'bold' },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
});