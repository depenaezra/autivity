import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TurnTakingCategory } from '../types';
import { CATEGORY_METADATA, CategoryMeta } from '../data/categories';

interface CategorySelectorModalProps {
  visible: boolean;
  selectedCategory: TurnTakingCategory;
  onSelectCategory: (category: TurnTakingCategory) => void;
  onConfirm: () => void;
  onClose?: () => void;
}

export default function CategorySelectorModal({
  visible,
  selectedCategory,
  onSelectCategory,
  onConfirm,
  onClose,
}: CategorySelectorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="apps-outline" size={28} color="#62A9E6" />
            </View>

            <Text style={styles.title}>Choose Activity</Text>
            <Text style={styles.subtitle}>
              Select a tracing category for this turn-taking session
            </Text>
          </View>

          {/* CATEGORIES SCROLLABLE LIST */}
          <ScrollView
            style={styles.categoryList}
            contentContainerStyle={styles.categoryListContent}
            showsVerticalScrollIndicator={false}
          >
            {CATEGORY_METADATA.map((cat: CategoryMeta) => {
              const isSelected = selectedCategory === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.85}
                  onPress={() => onSelectCategory(cat.id)}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.selectedCategoryCard,
                  ]}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.selectedIconCircle,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={24}
                      color={isSelected ? '#FFFFFF' : '#62A9E6'}
                    />
                  </View>

                  <View style={styles.categoryInfo}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.categoryTitle,
                          isSelected && styles.selectedCategoryTitle,
                        ]}
                      >
                        {cat.title}
                      </Text>

                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: cat.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.difficultyText,
                            { color: cat.badgeColor },
                          ]}
                        >
                          {cat.difficulty}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.categorySubtitle}>
                      {cat.subtitle}
                    </Text>

                    <Text style={styles.categoryDescription}>
                      {cat.description}
                    </Text>
                  </View>

                  {/* SELECT CHECKMARK */}
                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.selectedCheckCircle,
                    ]}
                  >
                    {isSelected ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : (
                      <View style={styles.unselectedDot} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* CONFIRM BUTTON */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>
                Confirm & Continue
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#F1F1F1',
    padding: 20,

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  header: {
    alignItems: 'center',
    marginBottom: 16,
  },

  headerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF5FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#BBE8FB',
  },

  title: {
    fontFamily: 'Fredoka-One',
    fontSize: 24,
    color: '#484A4B',
    textAlign: 'center',
  },

  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },

  categoryList: {
    marginVertical: 4,
  },

  categoryListContent: {
    gap: 10,
    paddingBottom: 8,
  },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 14,
  },

  selectedCategoryCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#62A9E6',
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EAF5FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#BBE8FB',
  },

  selectedIconCircle: {
    backgroundColor: '#62A9E6',
    borderColor: '#62A9E6',
  },

  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },

  categoryTitle: {
    fontFamily: 'Fredoka-One',
    fontSize: 17,
    color: '#484A4B',
  },

  selectedCategoryTitle: {
    color: '#1E3A8A',
  },

  categorySubtitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#62A9E6',
    marginTop: 2,
  },

  categoryDescription: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },

  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  difficultyText: {
    fontFamily: 'Fredoka-One',
    fontSize: 11,
    textTransform: 'uppercase',
  },

  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedCheckCircle: {
    backgroundColor: '#62A9E6',
    borderColor: '#62A9E6',
  },

  unselectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },

  footer: {
    marginTop: 14,
    paddingTop: 8,
  },

  confirmButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#62A9E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,

    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  confirmButtonText: {
    fontFamily: 'Fredoka-One',
    fontSize: 17,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});
