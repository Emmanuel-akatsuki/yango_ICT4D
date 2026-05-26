import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevices, VideoFile } from 'react-native-vision-camera';
import storage from '@react-native-firebase/storage';

interface Props {
  rideId: string; // Lié au profil du trajet d'urgence
  onUploadSuccess: (downloadUrl: string) => void;
}

export const EmergencyMultimediaModule: React.FC<Props> = ({ rideId, onUploadSuccess }) => {
  const devices = useCameraDevices();
  const device = devices.back; // Utilisation de la caméra arrière par défaut
  
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  //  : Gestion des permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const cameraStatus = await Camera.requestCameraPermission();
      const microphoneStatus = await Camera.requestMicrophonePermission();
      
      if (cameraStatus === 'authorized' && microphoneStatus === 'authorized') {
        setHasPermission(true);
      } else {
        Alert.alert('Permissions requises', 'L’accès à la caméra et au micro est nécessaire en cas d’urgence.');
      }
    };

    requestPermissions();

    return () => stopTimer();
  }, []);

  // Gestion du minuteur pour l'overlay UI
  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  //  : Démarrer l'enregistrement local
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;

    try {
      setIsRecording(true);
      startTimer();

      await cameraRef.current.startRecording({
        flash: 'off',
        onRecordingFinished: (video) => handleRecordingFinished(video),
        onRecordingError: (error) => {
          console.error("Erreur d'enregistrement:", error);
          stopRecordingFinishedUI();
        },
      });
    } catch (error) {
      console.error("Impossible de démarrer l'enregistrement:", error);
      stopRecordingFinishedUI();
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    await cameraRef.current.stopRecording();
  };

  const stopRecordingFinishedUI = () => {
    setIsRecording(false);
    stopTimer();
  };

  // : Gestion du fichier final et Upload Firebase Storage
  const handleRecordingFinished = async (video: VideoFile) => {
    stopRecordingFinishedUI();
    setIsUploading(true);

    try {
      const reference = storage().ref(`urgences/trajet_${rideId}_${Date.now()}.mp4`);
      
      // Téléversement du fichier local vers Firebase
      await reference.putFile(video.path);
      
      // Récupération de l'URL finale
      const downloadUrl = await reference.getDownloadURL();
      onUploadSuccess(downloadUrl);
      Alert.alert('Succès', 'La vidéo d’urgence a été sauvegardée avec succès.');
    } catch (error) {
      console.error("Échec du téléversement Firebase:", error);
      Alert.alert('Erreur', 'Impossible d’envoyer la vidéo sur le serveur.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>En attente des permissions caméra et micro...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>Initialisation de la caméra...</Text>
      </View>
    );
  }

  // : Interface d'enregistrement en direct (Overlay + Retour vidéo)
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true}
        audio={true}
      />

      {/* Overlay d'urgence */}
      <View style={styles.overlayTop}>
        {isRecording && (
          <View style={styles.badgeContainer}>
            <View style={styles.dotRed} />
            <Text style={styles.badgeText}>REC {formatTimer(timer)}</Text>
          </View>
        )}
      </View>

      {/* Bouton d'action principal */}
      <View style={styles.overlayBottom}>
        {isUploading ? (
          <ActivityIndicator size="large" color="#FF3B30" />
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, isRecording ? styles.buttonStop : styles.buttonRecord]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? 'ARRÊTER' : 'ENREGISTRER L\'URGENCE'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 20,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonRecord: {
    backgroundColor: '#FF3B30', // Rouge d'urgence
  },
  buttonStop: {
    backgroundColor: '#000000', // Noir pour l'arrêt
    borderWidth: 2,
    borderColor: '#FFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});