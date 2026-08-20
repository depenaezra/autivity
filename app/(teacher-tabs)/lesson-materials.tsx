import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { ResourcesScreenLayout } from '../../components/teacher/home/resources-screen-layout';
import { LessonMaterialCard } from '../../components/teacher/home/lesson-material-card';
import { AddMaterialCard } from '../../components/teacher/home/add-material-card';
import { deleteMaterial, getMaterials, uploadMaterial, updateMaterial } from '../../src/services/materials';

export interface LessonMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'ppt' | 'image' | 'video' | 'other';
  category: string;
  size: string;
  dateAdded: string;
  assignedClasses: string;
  description: string;
  url?: string;
  file_path?: string;
}

const CATEGORIES = ['All', 'Worksheet', 'Presentation', 'Sensory & Visual', 'Audio & Video'];

export default function LessonMaterialsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload Modal State
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; size: string; uri: string; mimeType?: string } | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Worksheet' | 'Presentation' | 'Sensory & Visual' | 'Audio & Video'>('Worksheet');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadClasses, setUploadClasses] = useState('All Classes');

  const [previewMaterial, setPreviewMaterial] = useState<LessonMaterial | null>(null);

  // Edit Material Modal State
  const [editingMaterial, setEditingMaterial] = useState<LessonMaterial | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'Worksheet' | 'Presentation' | 'Sensory & Visual' | 'Audio & Video'>('Worksheet');
  const [editDescription, setEditDescription] = useState('');
  const [editClasses, setEditClasses] = useState('All Classes');

  const openSwipeableRef = React.useRef<any>(null);

  const handleEditPress = (item: LessonMaterial) => {
    setEditingMaterial(item);
    setEditTitle(item.title ? item.title.replace(/\.[^/.]+$/, '') : '');
    setEditCategory((item.category as any) || 'Worksheet');
    setEditDescription(item.description || '');
    setEditClasses(item.assignedClasses || 'All Classes');
    setEditModalVisible(true);
  };

  const handleConfirmEdit = async () => {
    if (!editingMaterial || !editTitle.trim()) {
      Alert.alert('Missing Info', 'Please provide a title.');
      return;
    }

    setIsUpdating(true);
    try {
      await updateMaterial(editingMaterial.id, {
        title: editTitle.trim(),
        category: editCategory,
        description: editDescription.trim(),
        assignedClasses: editClasses,
      });

      await fetchMaterialsFromDB();
      setEditModalVisible(false);
      setEditingMaterial(null);
      Alert.alert('Success', 'Material updated successfully.');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchMaterialsFromDB();
  }, []);

  const fetchMaterialsFromDB = async () => {
    setIsLoadingMaterials(true);
    try {
      const dbMaterials = await getMaterials();

      const formatted = dbMaterials.map((mat: any) => {
        const date = new Date(mat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const cleanTitle = mat.title ? mat.title.replace(/\.[^/.]+$/, '') : mat.title;

        return {
          id: mat.id,
          title: cleanTitle,
          type: mat.type,
          category: mat.category,
          size: mat.size,
          dateAdded: date,
          assignedClasses: mat.assigned_classes,
          description: mat.description,
          url: mat.file_url,
          file_path: mat.file_path,
        };
      });
      setMaterials(formatted);
    } catch (error: any) {
      Alert.alert("Error fetching materials", error.message);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const filteredMaterials = materials.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedClasses.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const sizeInMb = file.size ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : '1.5 MB';
        const rawName = file.name || 'New Lesson Material';
        const cleanName = rawName.replace(/\.[^/.]+$/, '');

        setPendingFile({
          name: cleanName,
          size: sizeInMb,
          uri: file.uri,
          mimeType: file.mimeType || 'application/octet-stream',
        });
        setUploadTitle(cleanName);

        const lowerName = (file.name || '').toLowerCase();
        if (lowerName.includes('.ppt') || lowerName.includes('presentation')) setUploadCategory('Presentation');
        else if (lowerName.includes('.mp4') || lowerName.includes('.mp3') || lowerName.includes('video') || lowerName.includes('audio')) setUploadCategory('Audio & Video');
        else if (lowerName.includes('.png') || lowerName.includes('.jpg') || lowerName.includes('visual')) setUploadCategory('Sensory & Visual');
        else setUploadCategory('Worksheet');

        setUploadDescription('Uploaded teacher resource file for lesson instruction and student practice.');
        setUploadClasses('All Classes');
        setUploadModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadTitle.trim() || !pendingFile) {
      Alert.alert('Missing Info', 'Please provide a file and a title.');
      return;
    }

    setIsUploading(true);
    let type = 'pdf';
    if (uploadCategory === 'Presentation') type = 'ppt';
    else if (uploadCategory === 'Sensory & Visual') type = 'image';
    else if (uploadCategory === 'Audio & Video') type = 'video';

    try {
      await uploadMaterial(
        pendingFile.uri,
        pendingFile.name,
        pendingFile.mimeType || 'application/octet-stream',
        {
          title: uploadTitle.trim(),
          type,
          category: uploadCategory,
          size: pendingFile.size,
          description: uploadDescription.trim(),
          assignedClasses: uploadClasses
        }
      );

      await fetchMaterialsFromDB();
      setUploadModalVisible(false);
      setPendingFile(null);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenMaterial = (item: LessonMaterial) => {
    setPreviewMaterial(item);
  };

  const handleViewActualFile = async (item: LessonMaterial) => {
    if (item.url) {
      try {
        setPreviewMaterial(null);
        await new Promise((resolve) => setTimeout(resolve, 400));
        await Linking.openURL(item.url);
      } catch (err) {
        console.error('Failed to open document with Linking, trying WebBrowser:', err);
        try {
          await WebBrowser.openBrowserAsync(item.url);
        } catch (webErr) {
          console.error('Failed to open with WebBrowser:', webErr);
          Alert.alert('Error', 'Failed to open the file link.');
        }
      }
    } else {
      Alert.alert('Error', 'No document file source available.');
    }
  };

  const handleDownloadFile = async (item: LessonMaterial) => {
    if (!item.url) {
      Alert.alert('Error', 'No file source available.');
      return;
    }

    try {
      const fileName = item.title.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      const download = await FileSystem.downloadAsync(item.url, fileUri);

      if (download.status === 200) {
        Alert.alert(
          'Download Complete',
          `${item.title} has been saved.`,
          [
            {
              text: 'Open File',
              onPress: async () => {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(download.uri);
                } else {
                  await Linking.openURL(download.uri);
                }
              },
            },
            {
              text: 'OK',
            },
          ]
        );
      } else {
        throw new Error('Download failed');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert(
        'Download Failed',
        error.message || 'Unable to download file.'
      );
    }
  };

  const handleDeleteMaterial = (item: LessonMaterial) => {
    Alert.alert(
      'Delete Material',
      `Are you sure you want to remove "${item.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.file_path) {
                await deleteMaterial(item.id, item.file_path);
                setMaterials(materials.filter((m) => m.id !== item.id));
              }
            } catch (error: any) {
              Alert.alert('Delete Failed', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ResourcesScreenLayout
        title="Resources"
        onBackPress={() => router.back()}
        onAddPress={handlePickDocument}
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      >
        <View className={`bg-white ${isTablet ? 'px-12 py-6' : 'px-6 py-4'}`}>
          {/* SEARCH BAR */}
          <View className={`flex-row items-center bg-[#F9FAFB] border-[#E5E7EB] rounded-2xl px-4 mb-4 ${isTablet ? 'h-14 border-[2px]' : 'h-12 border-2'}`}>
            <Ionicons name="search" size={isTablet ? 24 : 20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search materials, topics, or classes..."
              placeholderTextColor="#9CA3AF"
              className={`flex-1 ml-3 font-quicksand-medium text-[#4B5563] ${isTablet ? 'text-lg' : 'text-base'}`}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>

          {/* FILES COUNT BADGE */}
          <View 
            className="flex-row items-center bg-white border-[2px] border-[#BBE8FB] rounded-[6px] self-start px-2 py-0.5 gap-1"
            style={{ marginBottom: isTablet ? 16 : 12 }}
          >
            <Ionicons name="document-text" size={isTablet ? 16 : 12} color="#62A9E6" />
            <Text className={`font-fredoka-one text-[#62A9E6] uppercase ${isTablet ? 'text-[14px]' : 'text-[11px]'}`}>
              {filteredMaterials.length === 1 ? '1 file' : `${filteredMaterials.length} files`}
            </Text>
          </View>

          {/* MATERIALS LIST / GRID */}
          {isLoadingMaterials ? (
            <ActivityIndicator size="large" color="#62A9E6" className="mt-10" />
          ) : (
            <View className={`flex-row flex-wrap justify-between ${isTablet ? 'gap-y-6' : 'gap-y-4'}`}>
              {filteredMaterials.map((item) => (
                <LessonMaterialCard
                  key={item.id}
                  item={item}
                  isTablet={isTablet}
                  onPress={() => handleOpenMaterial(item)}
                  onEdit={() => handleEditPress(item)}
                  onDelete={() => handleDeleteMaterial(item)}
                  onSwipeableWillOpen={(ref) => {
                    if (openSwipeableRef.current && openSwipeableRef.current !== ref) {
                      openSwipeableRef.current.close();
                    }
                    openSwipeableRef.current = ref;
                  }}
                />
              ))}

              {/* Add Material Button Card */}
              <AddMaterialCard
                isTablet={isTablet}
                onPress={handlePickDocument}
              />
            </View>
          )}
        </View>
      </ResourcesScreenLayout>

      {/* UPLOAD FILE DETAILS MODAL */}
      <Modal visible={isUploadModalVisible} transparent={true} animationType="fade" onRequestClose={() => !isUploading && setUploadModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full max-w-lg rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4 border-b border-[#F3F4F6] pb-3">
              <Text className="font-fredoka-one text-2xl text-[#4B5563]">Add Lesson Material</Text>
              {!isUploading && (
                <Pressable onPress={() => setUploadModalVisible(false)} className="p-1">
                  <Ionicons name="close" size={26} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            {pendingFile && (
              <View className="bg-[#EFF6FF] border border-[#62A9E6] rounded-xl p-3 mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-2">
                  <Feather name="file" size={20} color="#62A9E6" />
                  <View className="ml-2 flex-1">
                    <Text numberOfLines={1} className="font-quicksand-bold text-[#4784B8] text-sm">{pendingFile.name}</Text>
                    <Text className="font-quicksand-medium text-xs text-[#62A9E6]">{pendingFile.size}</Text>
                  </View>
                </View>
                {!isUploading && (
                  <Pressable onPress={handlePickDocument}>
                    <Text className="font-quicksand-bold text-xs text-[#5298D4] underline">Change</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Material Title</Text>
            <TextInput
              value={uploadTitle}
              onChangeText={setUploadTitle}
              editable={!isUploading}
              placeholder="e.g. Tracing Shapes Worksheet"
              placeholderTextColor="#9CA3AF"
              className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 font-quicksand-medium text-base text-[#4B5563] mb-4"
            />

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(['Worksheet', 'Presentation', 'Sensory & Visual', 'Audio & Video'] as const).map((cat) => {
                const isCatSelected = uploadCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    disabled={isUploading}
                    onPress={() => setUploadCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl border ${isCatSelected ? 'bg-[#EFF6FF] border-[#62A9E6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                  >
                    <Text className={`font-quicksand-bold text-xs ${isCatSelected ? 'text-[#5298D4]' : 'text-[#6B7280]'}`}>{cat}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Assign to Class</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {['All Classes', 'Class 1A', 'Class 2B', 'Class 1C'].map((cls) => {
                const isClsSelected = uploadClasses === cls;
                return (
                  <Pressable
                    key={cls}
                    disabled={isUploading}
                    onPress={() => setUploadClasses(cls)}
                    className={`px-3.5 py-2 rounded-xl border ${isClsSelected ? 'bg-[#EFF6FF] border-[#62A9E6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                  >
                    <Text className={`font-quicksand-bold text-xs ${isClsSelected ? 'text-[#5298D4]' : 'text-[#6B7280]'}`}>{cls}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Description (Optional)</Text>
            <TextInput
              value={uploadDescription}
              onChangeText={setUploadDescription}
              editable={!isUploading}
              placeholder="Brief note about how to use this material..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 font-quicksand-medium text-sm text-[#4B5563] mb-6 h-20"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="flex-row gap-3">
              <Pressable
                disabled={isUploading}
                onPress={() => setUploadModalVisible(false)}
                className={`flex-1 rounded-xl bg-[#F3F4F6] border-b-[3px] border-[#D1D5DB] justify-center items-center ${isTablet ? 'h-16' : 'h-14'} ${isUploading ? 'opacity-50' : ''}`}
              >
                <Text className="font-quicksand-bold text-[#6B7280] text-base">Cancel</Text>
              </Pressable>

              <Pressable
                disabled={isUploading}
                onPress={handleConfirmUpload}
                className={`flex-1 rounded-xl bg-[#62A9E6] border-b-[3px] border-[#5298D4] justify-center items-center ${isTablet ? 'h-16' : 'h-14'} ${isUploading ? 'opacity-70' : ''}`}
              >
                {isUploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-quicksand-bold text-white text-base">Add Material</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDIT MATERIAL DETAILS MODAL */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="fade" onRequestClose={() => !isUpdating && setEditModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full max-w-lg rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4 border-b border-[#F3F4F6] pb-3">
              <Text className="font-fredoka-one text-2xl text-[#4B5563]">Edit Material Details</Text>
              {!isUpdating && (
                <Pressable onPress={() => setEditModalVisible(false)} className="p-1">
                  <Ionicons name="close" size={26} color="#9CA3AF" />
                </Pressable>
              )}
            </View>

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Material Title</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              editable={!isUpdating}
              placeholder="Material title..."
              placeholderTextColor="#9CA3AF"
              className="w-full h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 font-quicksand-medium text-base text-[#4B5563] mb-4"
            />

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(['Worksheet', 'Presentation', 'Sensory & Visual', 'Audio & Video'] as const).map((cat) => {
                const isCatSelected = editCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    disabled={isUpdating}
                    onPress={() => setEditCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl border ${isCatSelected ? 'bg-[#EFF6FF] border-[#62A9E6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                  >
                    <Text className={`font-quicksand-bold text-xs ${isCatSelected ? 'text-[#5298D4]' : 'text-[#6B7280]'}`}>{cat}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Assign to Class</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {['All Classes', 'Class 1A', 'Class 2B', 'Class 1C'].map((cls) => {
                const isClsSelected = editClasses === cls;
                return (
                  <Pressable
                    key={cls}
                    disabled={isUpdating}
                    onPress={() => setEditClasses(cls)}
                    className={`px-3.5 py-2 rounded-xl border ${isClsSelected ? 'bg-[#EFF6FF] border-[#62A9E6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                  >
                    <Text className={`font-quicksand-bold text-xs ${isClsSelected ? 'text-[#5298D4]' : 'text-[#6B7280]'}`}>{cls}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className="font-quicksand-bold text-[#4B5563] text-sm mb-1.5">Description (Optional)</Text>
            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              editable={!isUpdating}
              placeholder="Brief note about how to use this material..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 font-quicksand-medium text-sm text-[#4B5563] mb-6 h-20"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="flex-row gap-3">
              <Pressable
                disabled={isUpdating}
                onPress={() => setEditModalVisible(false)}
                className={`flex-1 rounded-xl bg-[#F3F4F6] border-b-[3px] border-[#D1D5DB] justify-center items-center ${isTablet ? 'h-16' : 'h-14'} ${isUpdating ? 'opacity-50' : ''}`}
              >
                <Text className="font-quicksand-bold text-[#6B7280] text-base">Cancel</Text>
              </Pressable>

              <Pressable
                disabled={isUpdating}
                onPress={handleConfirmEdit}
                className={`flex-1 rounded-xl bg-[#62A9E6] border-b-[3px] border-[#5298D4] justify-center items-center ${isTablet ? 'h-16' : 'h-14'} ${isUpdating ? 'opacity-70' : ''}`}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-quicksand-bold text-white text-base">Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* BUILT-IN MATERIAL PREVIEW & OPEN MODAL */}
      <Modal visible={!!previewMaterial} transparent={true} animationType="fade" onRequestClose={() => setPreviewMaterial(null)}>
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white w-full max-w-xl rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-2xl">
            {previewMaterial && (
              <>
                <View className="flex-row justify-between items-start mb-4 border-b border-[#F3F4F6] pb-4">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-14 h-14 rounded-2xl items-center justify-center mr-3 bg-[#EFF6FF]">
                      <MaterialCommunityIcons 
                        name={previewMaterial.type === 'ppt' ? 'presentation' : previewMaterial.type === 'image' ? 'cards-outline' : previewMaterial.type === 'video' ? 'video-outline' : previewMaterial.type === 'pdf' ? 'file-document-outline' : 'file-outline'} 
                        size={28} 
                        color="#62A9E6" 
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-xs uppercase mb-0.5 text-[#62A9E6]">
                        {previewMaterial.category} • {previewMaterial.size}
                      </Text>
                      <Text numberOfLines={2} className="font-fredoka-one text-xl text-[#4B5563]">{previewMaterial.title}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setPreviewMaterial(null)} className="p-1">
                    <Ionicons name="close" size={26} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* Simulated Viewer Area */}
                <View className="bg-[#F8FAFC] border-[2px] border-[#E2E8F0] rounded-2xl p-6 items-center justify-center mb-6 min-h-[200px]">
                  <MaterialCommunityIcons 
                    name={previewMaterial.type === 'ppt' ? 'presentation' : previewMaterial.type === 'image' ? 'cards-outline' : previewMaterial.type === 'video' ? 'video-outline' : previewMaterial.type === 'pdf' ? 'file-document-outline' : 'file-outline'} 
                    size={64} 
                    color="#62A9E6" 
                  />
                  <Text className="font-quicksand-bold text-[#4B5563] text-lg mt-3 text-center">{previewMaterial.title}</Text>
                  <Text className="font-quicksand-medium text-[#64748B] text-sm mt-1 text-center max-w-[360px]">{previewMaterial.description}</Text>
                  <View className="bg-white border border-[#CBD5E1] px-4 py-2 rounded-full mt-4 flex-row items-center">
                    <Feather name="check-circle" size={14} color="#10B981" />
                    <Text className="font-quicksand-bold text-xs text-[#334155] ml-1.5">Ready for classroom display</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center bg-[#F1F5F9] px-4 py-3 rounded-xl mb-6">
                  <View className="flex-1">
                    <Text className="font-quicksand-bold text-xs text-[#64748B]">Assigned To</Text>
                    <Text className="font-quicksand-bold text-sm text-[#334155]">{previewMaterial.assignedClasses}</Text>
                  </View>
                  <View className="flex-1 items-end">
                    <Text className="font-quicksand-bold text-xs text-[#64748B]">Date Uploaded</Text>
                    <Text className="font-quicksand-bold text-sm text-[#334155]">{previewMaterial.dateAdded}</Text>
                  </View>
                </View>

                {/* MODAL ACTIONS */}
                <View className="flex-row gap-3 mt-4">
                  <Pressable onPress={() => setPreviewMaterial(null)} className="flex-1 rounded-xl bg-[#F3F4F6] border-b-[3px] border-[#D1D5DB] justify-center items-center h-12">
                    <Text className="font-quicksand-bold text-[#6B7280] text-base">Close</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDownloadFile(previewMaterial)}
                    className="flex-1 rounded-xl bg-[#10B981] border-b-[3px] border-[#059669] justify-center items-center px-4 h-12"
                  >
                    <View className="flex-row items-center justify-center">
                      <Feather name="download" size={18} color="white" style={{ marginRight: 6 }} />
                      <Text className="font-quicksand-bold text-white text-base">Download</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleViewActualFile(previewMaterial)}
                    className="flex-1 rounded-xl bg-[#62A9E6] border-b-[3px] border-[#5298D4] justify-center items-center px-4 h-12"
                  >
                    <View className="flex-row items-center justify-center">
                      <Feather name="external-link" size={18} color="white" style={{ marginRight: 6 }} />
                      <Text className="font-quicksand-bold text-white text-base">View</Text>
                    </View>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
