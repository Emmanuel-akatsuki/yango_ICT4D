import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type EditorMode = 'none' | 'modifier' | 'audio' | 'texte' | 'filtres' | 'effets';

interface Props {
  activeMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

export const BottomToolbar: React.FC<Props> = ({ activeMode, onModeChange }) => {
  const tools = [
    { id: 'modifier', icon: 'movie-edit', label: 'Modifier' },
    { id: 'audio', icon: 'music-note', label: 'Audio' },
    { id: 'texte', icon: 'format-text', label: 'Texte' },
    { id: 'filtres', icon: 'auto-fix', label: 'Filtres' },
    { id: 'effets', icon: 'sparkles', label: 'Effets' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.toolButton, activeMode === tool.id && styles.activeButton]}
            onPress={() => onModeChange(tool.id as EditorMode)}
          >
            <Icon name={tool.icon} size={24} color={activeMode === tool.id ? '#FFB800' : '#FFF'} />
            <Text style={[styles.label, activeMode === tool.id && styles.activeLabel]}>
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    marginHorizontal: 5,
  },
  activeButton: {
    transform: [{ scale: 1.1 }],
  },
  label: { color: '#888', fontSize: 11, marginTop: 4 },
  activeLabel: { color: '#FFB800', fontWeight: 'bold' },
});