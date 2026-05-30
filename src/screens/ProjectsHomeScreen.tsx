import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { fetchUserProjects, Project } from '../services/supabaseService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ProjectsHomeScreen = ({ navigation }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await fetchUserProjects('user_test_001');
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => navigation.navigate('VideoEditor', { videoUri: item.video_url })}
    >
      <View style={styles.projectInfo}>
        <Icon name="movie-play" size={30} color="#FFB800" />
        <View style={styles.textContainer}>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={styles.projectDate}>
            Créé le {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#555" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Studio Yango</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MediaImport')}>
          <Icon name="plus-circle" size={35} color="#FFB800" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Projets récents</Text>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProjects} tintColor="#FFB800" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun projet récent.</Text>
            <Text style={styles.emptySub}>Commencez par importer une vidéo.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 15, fontWeight: '600', textTransform: 'uppercase' },
  projectCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  projectInfo: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { marginLeft: 15 },
  projectName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  projectDate: { color: '#555', fontSize: 12 },
  emptyState: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptySub: { color: '#555', marginTop: 10 }
});