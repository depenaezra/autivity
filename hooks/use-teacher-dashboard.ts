import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { archiveClass, createClass, getTeacherClasses, updateClass, deleteClass } from '../src/services/classes';
import { getMaterialCount } from '../src/services/materials';
import { getUserProfile } from '../src/services/profile';
import { getStudentCount, getTeacherStudents } from '../src/services/students';

export interface ClassItem {
  id: string;
  title: string;
  level: string;
  people: number;
  image?: any;
  themeColor: string;
  shadowColor: string;
  themeName?: string;
  schedule?: string;
  isArchived?: boolean;
}

export const themeColors = [
  { name: 'blue', value: '#BBE8FB', border: '#62A9E6' },
  { name: 'green', value: '#CBFAC4', border: '#179D33' },
  { name: 'orange', value: '#FFDBD4', border: '#FF8870' },
  { name: 'yellow', value: '#FFF3C4', border: '#FFAE02' },
];

const classCards: Record<string, any> = {
  green: require('../assets/images/class-cards/class-frog.png'),
  orange: require('../assets/images/class-cards/class-hamster.png'),
  yellow: require('../assets/images/class-cards/class-penguin.png'),
  blue: require('../assets/images/class-cards/class-whale.png'),
};

export function useTeacherDashboard() {
  const { firstName: paramFirstName } = useLocalSearchParams();
  const [firstName, setFirstName] = useState<string>((paramFirstName as string) || '');

  const [classesData, setClassesData] = useState<ClassItem[]>([]);
  const [archivedClasses, setArchivedClasses] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  const [stats, setStats] = useState({ students: 0, classes: 0, lessons: 0 });
  const [isAddClassModalVisible, setAddClassModalVisible] = useState(false);
  const [isArchivedModalVisible, setArchivedModalVisible] = useState(false);
  
  const slideAnim = useSharedValue(600);

  // Form State for Adding Class
  const [newClassName, _setNewClassName] = useState('');
  const [newClassSchedule, _setNewClassSchedule] = useState('');
  const [newClassGrade, _setNewClassGrade] = useState('Grade 1');
  const [newClassTheme, _setNewClassTheme] = useState('#FDBA74');

  const setNewClassName = (val: string) => {
    if (val !== newClassName) _setNewClassName(val);
  };
  const setNewClassSchedule = (val: string) => {
    if (val !== newClassSchedule) _setNewClassSchedule(val);
  };
  const setNewClassGrade = (val: string) => {
    if (val !== newClassGrade) _setNewClassGrade(val);
  };
  const setNewClassTheme = (val: string) => {
    if (val !== newClassTheme) _setNewClassTheme(val);
  };

  useEffect(() => {
    if (paramFirstName) {
      setFirstName(paramFirstName as string);
    }
  }, [paramFirstName]);

  const fetchProfile = async () => {
    try {
      const profileData = await getUserProfile();
      if (profileData && profileData.first_name) {
        setFirstName(profileData.first_name);
      }
    } catch (error) {
      console.log('Error fetching profile in home screen:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const [classData, studentData] = await Promise.all([
        getTeacherClasses(),
        getTeacherStudents(),
      ]);
      
      const formattedClasses = classData.map((dbClass: any) => {
        const theme = themeColors.find(t => t.name === dbClass.theme_name) || themeColors[0];
        return {
          id: dbClass.id,
          title: dbClass.title,
          level: dbClass.grade || 'Grade 1',
          people: Array.isArray(dbClass.students) ? dbClass.students.length : 0,
          schedule: dbClass.schedule,
          image: classCards[theme.name] || require('../assets/images/polar-bear.png'),
          themeColor: theme.value,
          shadowColor: theme.border,
          themeName: theme.name,
          isArchived: dbClass.is_archived || false,
        };
      });

      const activeClasses = formattedClasses.filter((c: any) => !c.isArchived);
      const archived = formattedClasses.filter((c: any) => c.isArchived);

      setClassesData(activeClasses);
      setArchivedClasses(archived);
      setStudentsData(studentData);
    } catch (error: any) {
      Alert.alert("Error fetching classes", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchiveClass = async (classId: string) => {
    try {
      await archiveClass(classId, false);
      await fetchClasses();
    } catch (error: any) {
      Alert.alert("Error unarchiving class", error.message);
    }
  };

  const handleStartEditClass = (classItem: ClassItem) => {
    setEditingClassId(classItem.id);
    setNewClassName(classItem.title);
    setNewClassGrade(classItem.level);
    const theme = themeColors.find(t => t.name === classItem.themeName) || themeColors[0];
    setNewClassTheme(theme.value);

    setNewClassSchedule(classItem.schedule || 'MON, WED at 08:00 AM');

    setAddClassModalVisible(true);
  };

  const handleArchiveClass = async (classId: string) => {
    try {
      await archiveClass(classId, true);
      await fetchClasses();
    } catch (error: any) {
      Alert.alert("Error archiving class", error.message);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    Alert.alert(
      "Delete Class",
      "Are you sure you want to delete this class? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClass(classId);
              await fetchClasses();
            } catch (error: any) {
              Alert.alert("Error deleting class", error.message);
            }
          }
        }
      ]
    );
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;

    const selectedTheme = themeColors.find(c => c.value === newClassTheme) || themeColors[0];
    const scheduleStr = newClassSchedule.trim();

    setIsCreating(true);
    try {
      if (editingClassId) {
        await updateClass(
          editingClassId,
          newClassName.trim(),
          newClassGrade.trim() || 'Grade 1',
          scheduleStr,
          selectedTheme.name
        );
      } else {
        await createClass(
          newClassName.trim(),
          newClassGrade.trim() || 'Grade 1',
          scheduleStr,
          selectedTheme.name
        );
      }

      await fetchClasses();
      setAddClassModalVisible(false);
    } catch (error: any) {
      Alert.alert(editingClassId ? "Error updating class" : "Error creating class", error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Auto-reset form fields when Modal closes
  useEffect(() => {
    if (!isAddClassModalVisible) {
      setNewClassName('');
      setNewClassSchedule('');
      setNewClassGrade('Grade 1');
      setNewClassTheme('#FDBA74');
      setEditingClassId(null);
    }
  }, [isAddClassModalVisible]);

  // Load stats when class data changes
  useEffect(() => {
    const loadStats = async () => {
      const studentCount = await getStudentCount();
      const materialCount = await getMaterialCount();
      setStats({ students: studentCount, classes: classesData.length, lessons: materialCount });
    };
    loadStats();
  }, [classesData]);

  // Focus effect to reload classes & profile
  useFocusEffect(
    useCallback(() => {
      fetchClasses();
      fetchProfile();
    }, [])
  );

  // Animate modal entry
  useEffect(() => {
    if (isAddClassModalVisible || isArchivedModalVisible) {
      slideAnim.value = 600;
      slideAnim.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [isAddClassModalVisible, isArchivedModalVisible]);

  return {
    firstName,
    classesData,
    archivedClasses,
    studentsData,
    isLoading,
    isCreating,
    stats,
    isAddClassModalVisible,
    setAddClassModalVisible,
    isArchivedModalVisible,
    setArchivedModalVisible,
    slideAnim,
    // Add Class Form State
    newClassName,
    setNewClassName,
    newClassSchedule,
    setNewClassSchedule,
    newClassGrade,
    setNewClassGrade,
    newClassTheme,
    setNewClassTheme,
    editingClassId,
    // Operations
    handleAddClass,
    handleUnarchiveClass,
    handleStartEditClass,
    handleArchiveClass,
    handleDeleteClass,
    fetchClasses,
  };
}
