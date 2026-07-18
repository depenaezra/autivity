import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LessonMaterialsHeaderSvg from '../../assets/images/headers/lesson-materials-header.svg';
import { deleteMaterial, getMaterials, uploadMaterial } from '../../src/services/materials';

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
  color: string;
  darkColor: string;
  lightColor: string;
  iconName: any;
}

const CATEGORIES = ['All', 'Worksheet', 'Presentation', 'Sensory & Visual', 'Audio & Video'];

// Helper to map DB types to UI styling
const mapTypeToStyling = (type: string) => {
  switch (type) {
    case 'ppt': return { color: '#F97316', darkColor: '#C2410C', lightColor: '#FFEDD5', iconName: 'presentation' };
    case 'image': return { color: '#10B981', darkColor: '#047857', lightColor: '#D1FAE5', iconName: 'cards-outline' };
    case 'video': return { color: '#3B82F6', darkColor: '#1D4ED8', lightColor: '#DBEAFE', iconName: 'video-outline' };
    default: return { color: '#EF4444', darkColor: '#B91C1C', lightColor: '#FEE2E2', iconName: 'file-document-outline' };
  }
};

export default function LessonMaterialsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const insets = useSafeAreaInsets();

  // [MODIFIED] State starts empty instead of using INITIAL_MATERIALS
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload Modal State
  const [isUploadModalVisible, setUploadModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // [ADDED] Loading state for file upload
  const [pendingFile, setPendingFile] = useState<{ name: string; size: string; uri: string; mimeType?: string } | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Worksheet' | 'Presentation' | 'Sensory & Visual' | 'Audio & Video'>('Worksheet');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadClasses, setUploadClasses] = useState('All Classes');

  const [previewMaterial, setPreviewMaterial] = useState<LessonMaterial | null>(null);

  // [ADDED] Fetch materials on load
  useEffect(() => {
    fetchMaterialsFromDB();
  }, []);

  const fetchMaterialsFromDB = async () => {
    setIsLoadingMaterials(true);
    try {
      const dbMaterials = await getMaterials();

      // Map DB schema to UI schema
      const formatted = dbMaterials.map((mat: any) => {
        const styling = mapTypeToStyling(mat.type);
        const date = new Date(mat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return {
          id: mat.id,
          title: mat.title,
          type: mat.type,
          category: mat.category,
          size: mat.size,
          dateAdded: date,
          assignedClasses: mat.assigned_classes,
          description: mat.description,
          url: mat.file_url,
          file_path: mat.file_path,
          ...styling,
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

        setPendingFile({
          name: file.name || 'New Lesson Material.pdf',
          size: sizeInMb,
          uri: file.uri,
          mimeType: file.mimeType || 'application/octet-stream',
        });
        setUploadTitle(file.name || 'New Lesson Material.pdf');

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

  // [MODIFIED] Added async cloud upload logic
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

      // Refresh list after successful upload
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
        // Dismiss the modal first to avoid concurrent transition deadlock on iOS/Android
        setPreviewMaterial(null);
        await new Promise((resolve) => setTimeout(resolve, 400));
        
        // Try opening with Linking first (default system browser / handler)
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

  // [MODIFIED] Connected to DB deletion service
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
                // Remove from local state immediately for fast UI
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
        {/* HEADER SECTION */}
        <View className={`w-full relative overflow-hidden ${isTablet ? 'h-[320px]' : 'h-[240px]'}`}>
          <View className="absolute w-full z-0" style={{ height: '115%', top: -15 }}>
            <LessonMaterialsHeaderSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
          </View>

          <View
            className={`flex-1 justify-between relative z-10 ${isTablet ? 'px-12 pb-8' : 'px-6 pb-6'}`}
            style={{ paddingTop: insets.top + (isTablet ? 24 : 16) }}
          >
            <Pressable onPress={() => router.back()} className="mb-auto self-start p-2 -ml-2">
              <Ionicons name="arrow-back" size={isTablet ? 32 : 28} color="#4B5563" />
            </Pressable>

            <View>
              <View className="bg-white/60 self-start px-3 py-1 rounded-md border border-white mb-2">
                <Text className={`text-[#5298D4] font-quicksand-bold uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-xs'}`}>
                  CURRICULUM RESOURCES
                </Text>
              </View>
              <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-5xl' : 'text-4xl'}`}>
                Lesson Materials
              </Text>
              <View className="flex-row items-center gap-4 mt-2">
                <View className="flex-row items-center gap-1.5">
                  <Feather name="file-text" size={isTablet ? 18 : 14} color="#6B7280" />
                  <Text className={`text-[#6B7280] font-quicksand-medium ${isTablet ? 'text-lg' : 'text-sm'}`}>
                    {materials.length} files
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Feather name="grid" size={isTablet ? 18 : 14} color="#6B7280" />
                  <Text className={`text-[#6B7280] font-quicksand-medium ${isTablet ? 'text-lg' : 'text-sm'}`}>
                    {CATEGORIES.length - 1} categories
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* SEARCH AND UPLOAD BAR */}
        <View className={isTablet ? 'px-12 mt-8' : 'px-6 mt-6'}>
          <View className={`flex-row items-center gap-3 ${isTablet ? 'mb-6' : 'mb-4'}`}>
            <View className={`flex-1 flex-row items-center bg-white border-[#E5E7EB] rounded-2xl px-4 ${isTablet ? 'h-14 border-[2px]' : 'h-12 border-2'}`}>
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

            <Pressable
              onPress={handlePickDocument}
              className={`bg-[#62A9E6] flex-row items-center justify-center rounded-2xl border-b-[4px] border-[#5298D4] ${isTablet ? 'px-6 h-14 gap-2.5' : 'px-4 h-12 gap-1.5'}`}
            >
              <Feather name="upload-cloud" size={isTablet ? 22 : 18} color="white" />
              <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-lg' : 'text-sm'}`}>
                Upload
              </Text>
            </Pressable>
          </View>

          {/* CATEGORY FILTER TABS */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6" contentContainerStyle={{ paddingRight: 20 }}>
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category;
              const count = category === 'All' ? materials.length : materials.filter((m) => m.category === category).length;
              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`flex-row items-center mr-3 px-4 py-2.5 rounded-full border-2 ${isSelected ? 'bg-[#62A9E6] border-[#5298D4]' : 'bg-white border-[#E5E7EB]'}`}
                >
                  <Text className={`font-quicksand-bold ${isSelected ? 'text-white' : 'text-[#6B7280]'} ${isTablet ? 'text-base' : 'text-sm'}`}>
                    {category}
                  </Text>
                  <View className={`ml-2 px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/30' : 'bg-[#F3F4F6]'}`}>
                    <Text className={`font-quicksand-bold text-xs ${isSelected ? 'text-white' : 'text-[#6B7280]'}`}>
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* MATERIALS LIST / GRID */}
        <View className={isTablet ? 'px-12 pb-16' : 'px-6 pb-12'}>
          {isLoadingMaterials ? (
            <ActivityIndicator size="large" color="#62A9E6" className="mt-10" />
          ) : (
            <View className={`flex-row flex-wrap justify-between ${isTablet ? 'gap-y-6' : 'gap-y-4'}`}>
              {filteredMaterials.map((item) => (
                <View
                  key={item.id}
                  className={`bg-white border-[#E5E7EB] overflow-hidden ${isTablet ? 'w-[48%] rounded-[24px] border-[3px] border-b-[5px] p-6' : 'w-full rounded-[18px] border-[2px] border-b-[4px] p-4.5'}`}
                >
                  {/* Top Row: Icon Badge + Actions */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View className={`rounded-2xl items-center justify-center ${isTablet ? 'w-16 h-16' : 'w-14 h-14'}`} style={{ backgroundColor: item.lightColor }}>
                      <MaterialCommunityIcons name={item.iconName} size={isTablet ? 32 : 26} color={item.darkColor} />
                    </View>
                    <View className="flex-row items-center gap-2">
                      <View className="bg-[#F3F4F6] px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                        <Text className="font-quicksand-bold text-xs text-[#6B7280] uppercase">{item.type}</Text>
                      </View>
                      <Pressable onPress={() => handleDeleteMaterial(item)} className="p-2 -mr-1 rounded-full active:bg-red-50">
                        <Feather name="trash-2" size={18} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </View>

                  <Text numberOfLines={2} className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-xl mb-2' : 'text-lg mb-1'}`}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-sm mb-4 leading-5' : 'text-xs mb-3 leading-4'}`}>
                    {item.description}
                  </Text>

                  {/* Metadata Tags */}
                  <View className="flex-row flex-wrap items-center gap-2 mb-5">
                    <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      <Feather name="hard-drive" size={12} color="#64748B" />
                      <Text className="font-quicksand-medium text-xs text-[#64748B] ml-1">{item.size}</Text>
                    </View>
                    <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      <Feather name="users" size={12} color="#64748B" />
                      <Text className="font-quicksand-medium text-xs text-[#64748B] ml-1">{item.assignedClasses}</Text>
                    </View>
                    <View className="flex-row items-center bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      <Feather name="calendar" size={12} color="#64748B" />
                      <Text className="font-quicksand-medium text-xs text-[#64748B] ml-1">{item.dateAdded}</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleOpenMaterial(item)}
                    className={`flex-row items-center justify-center rounded-xl border-b-[3px] bg-[#62A9E6] border-[#5298D4] ${isTablet ? 'h-14' : 'h-12'}`}
                  >
                    <Feather name="file-text" size={16} color="white" style={{ marginRight: 6 }} />
                    <Text className="font-quicksand-bold text-white text-base">Open Material</Text>
                  </Pressable>
                </View>
              ))}

              {/* Upload Button Card */}
              <Pressable
                onPress={handlePickDocument}
                className={`bg-[#F9FAFB] border-[2px] border-dashed border-[#D1D5DB] items-center justify-center ${isTablet ? 'w-[48%] min-h-[260px] rounded-[24px] p-6' : 'w-full min-h-[180px] rounded-[18px] p-6 mt-2'}`}
              >
                <View className="w-16 h-16 rounded-full bg-[#E5E7EB] items-center justify-center mb-4">
                  <Feather name="plus" size={32} color="#6B7280" />
                </View>
                <Text className={`font-quicksand-bold text-[#6B7280] ${isTablet ? 'text-xl' : 'text-lg'}`}>Add New Material</Text>
                <Text className="font-quicksand-medium text-[#9CA3AF] text-center text-sm mt-1 max-w-[220px]">
                  Upload PDF, PPT, Word, flashcards, or multimedia lesson aids
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* UPLOAD FILE DETAILS MODAL */}
      <Modal visible={isUploadModalVisible} transparent={true} animationType="fade" onRequestClose={() => !isUploading && setUploadModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className={`bg-white w-full max-w-lg rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-xl`}>
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
              placeholder="e.g. Tracing Shapes Worksheet.pdf"
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

      {/* BUILT-IN MATERIAL PREVIEW & OPEN MODAL */}
      <Modal visible={!!previewMaterial} transparent={true} animationType="fade" onRequestClose={() => setPreviewMaterial(null)}>
        <View className="flex-1 justify-center items-center bg-black/60 px-6">
          <View className="bg-white w-full max-w-xl rounded-[24px] border-[3px] border-[#D5D0D2] border-b-[6px] p-6 shadow-2xl">
            {previewMaterial && (
              <>
                <View className="flex-row justify-between items-start mb-4 border-b border-[#F3F4F6] pb-4">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="w-14 h-14 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: previewMaterial.lightColor }}>
                      <MaterialCommunityIcons name={previewMaterial.iconName} size={28} color={previewMaterial.darkColor} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-quicksand-bold text-xs uppercase mb-0.5" style={{ color: previewMaterial.darkColor }}>
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
                  <MaterialCommunityIcons name={previewMaterial.iconName} size={64} color={previewMaterial.color} />
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
                  <Pressable onPress={() => setPreviewMaterial(null)} className={`flex-1 rounded-xl bg-[#F3F4F6] border-b-[3px] border-[#D1D5DB] justify-center items-center ${isTablet ? 'h-16' : 'h-14'}`}>
                    <Text className="font-quicksand-bold text-[#6B7280] text-base">Close</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      handleViewActualFile(previewMaterial);
                    }}
                    className={`flex-2 rounded-xl bg-[#62A9E6] border-b-[3px] border-[#5298D4] justify-center items-center px-4 ${isTablet ? 'h-16' : 'h-14'}`}
                  >
                    <View className="flex-row items-center justify-center">
                      <Feather name="external-link" size={18} color="white" style={{ marginRight: 6 }} />
                      <Text className="font-quicksand-bold text-white text-base">View the File</Text>
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