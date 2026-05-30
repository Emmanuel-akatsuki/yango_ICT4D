import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

export interface ExportOptions {
  videoPath: string;
  audioPath?: string;
  filter?: string;
  textOverlay?: {
    text: string;
    color: string;
    fontSize: number;
  };
}

export const exportVideo = async (
  options: ExportOptions,
  onProgress: (progress: number) => void
) => {
  const outputPath = `${options.videoPath.replace('.mp4', '_edited.mp4')}`;
  
  // Construction de la commande FFmpeg complexe
  // 1. Entrée vidéo et audio
  let inputs = `-i ${options.videoPath}`;
  if (options.audioPath) {
    inputs += ` -i ${options.audioPath}`;
  }

  // 2. Filtres et Texte
  let filterComplex = '';
  if (options.filter || options.textOverlay) {
    filterComplex = '-filter_complex "';
    if (options.filter) filterComplex += `${options.filter}`;
    if (options.textOverlay) {
      const { text, color, fontSize } = options.textOverlay;
      filterComplex += `${options.filter ? ',' : ''}drawtext=text='${text}':fontcolor=${color}:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2`;
    }
    filterComplex += '"';
  }

  // Commande finale : Mixage audio (map) + filtres + encodage rapide
  const command = `${inputs} ${filterComplex} -map 0:v ${options.audioPath ? '-map 1:a' : '-map 0:a'} -c:v libx264 -preset ultrafast -shortest ${outputPath}`;

  return new Promise((resolve, reject) => {
    FFmpegKit.executeAsync(command, async (session) => {
      const returnCode = await session.getReturnCode();
      
      if (ReturnCode.isSuccess(returnCode)) {
        // Enregistrement dans la galerie (Jour 4-5 Dev 6)
        await CameraRoll.saveAsset(outputPath, { type: 'video' });
        resolve(outputPath);
      } else {
        reject(new Error('Échec de l\'exportation FFmpeg'));
      }
    }, (log) => {
      // Simulation de progression basée sur les logs de temps
      console.log(log.getMessage());
    });
  });
};