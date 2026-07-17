import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from "@react-native-community/datetimepicker";
import BlueHeaderSvg from '../../assets/images/class-headers/blue-header.svg';
import GreenHeaderSvg from '../../assets/images/class-headers/green-header.svg';
import OrangeHeaderSvg from '../../assets/images/class-headers/orange-header.svg';
import YellowHeaderSvg from '../../assets/images/class-headers/yellow-header.svg';
import { Picker } from "@react-native-picker/picker";
import {
  getClassById,
  getTeacherClasses,
  updateClass,
  deleteClass,
} from "../../src/services/classes";
import {
  addStudent,
  getClassStudents,
  moveStudentClass,
  updateStudentActivities,
} from "../../src/services/students";
import { supabase } from "../../src/lib/supabase";
const AVATARS = [
  "😀","😃","😄","😊","🙂","😍",
  "👧","👦","👶","🧒",
  "🐶","🐱","🐭","🐹","🐰","🦊",
  "🐻","🐼","🐨","🐯","🦁","🐸",
  "🐵","🐧","🐤","🦄","🐙","🐢",
  "🦋","🐝","🐬","🐳","🦖","🦕"
];


export async function deleteStudent(studentId: string) {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);

  if (error) throw error;
}


export const THEME_CONFIG: Record<string, {
  themeColor: string;
  darkThemeColor: string;
  lightThemeColor: string;
}> = {
  green: {
    themeColor: '#4ADE80',
    darkThemeColor: '#059669',
    lightThemeColor: '#D1FAE5',
  },
  orange: {
    themeColor: '#FB923C',
    darkThemeColor: '#EA580C',
    lightThemeColor: '#FFEDD5',
  },
  yellow: {
    themeColor: '#FACC15',
    darkThemeColor: '#CA8A04',
    lightThemeColor: '#FEF9C3',
  },
  blue: {
    themeColor: '#60A5FA',
    darkThemeColor: '#2563EB',
    lightThemeColor: '#DBEAFE',
  },
};

const themeColors = [
  { name: 'orange', value: '#FDBA74', shadow: '#FB923C' },
  { name: 'yellow', value: '#FDE047', shadow: '#EAB308' },
  { name: 'blue', value: '#93C5FD', shadow: '#60A5FA' },
  { name: 'green', value: '#86EFAC', shadow: '#4ADE80' },
];

const ALL_TRACING_CATEGORIES = [
  {
    id: 'lines',
    title: 'Lines Tracing',
    icon: 'create-outline',
    activities: [
      { path: 'lines/horizontal', title: 'Horizontal Lines' },
      { path: 'lines/vertical', title: 'Vertical Lines' },
      { path: 'lines/diagonal-down', title: 'Diagonal Down Lines' },
      { path: 'lines/diagonal-up', title: 'Diagonal Up Lines' },
      { path: 'lines/zigzag', title: 'Zigzag Lines' },
      { path: 'lines/wave', title: 'Wave Lines' },
      { path: 'lines/arc', title: 'Arc Lines' },
    ]
  },
  {
    id: 'shapes',
    title: 'Shapes Tracing',
    icon: 'shapes-outline',
    activities: [
      { path: 'shapes/cross', title: 'Cross Shape' },
      { path: 'shapes/square', title: 'Square Shape' },
      { path: 'shapes/triangle', title: 'Triangle Shape' },
      { path: 'shapes/circle', title: 'Circle Shape' },
      { path: 'shapes/star', title: 'Star Shape' },
      { path: 'shapes/rectangle', title: 'Rectangle Shape' },
      { path: 'shapes/heart', title: 'Heart Shape' },
    ]
  },
  {
    id: 'letters',
    title: 'Letters Tracing',
    icon: 'text-outline',
    activities: [
      { path: 'letters/A', title: 'Letter A' },
      { path: 'letters/B', title: 'Letter B' },
      { path: 'letters/C', title: 'Letter C' },
      { path: 'letters/D', title: 'Letter D' },
      { path: 'letters/E', title: 'Letter E' },
      { path: 'letters/F', title: 'Letter F' },
      { path: 'letters/G', title: 'Letter G' },
      { path: 'letters/H', title: 'Letter H' },
      { path: 'letters/I', title: 'Letter I' },
      { path: 'letters/J', title: 'Letter J' },
      { path: 'letters/K', title: 'Letter K' },
      { path: 'letters/L', title: 'Letter L' },
      { path: 'letters/M', title: 'Letter M' },
      { path: 'letters/N', title: 'Letter N' },
      { path: 'letters/O', title: 'Letter O' },
      { path: 'letters/P', title: 'Letter P' },
      { path: 'letters/Q', title: 'Letter Q' },
      { path: 'letters/R', title: 'Letter R' },
      { path: 'letters/S', title: 'Letter S' },
      { path: 'letters/T', title: 'Letter T' },
      { path: 'letters/U', title: 'Letter U' },
      { path: 'letters/V', title: 'Letter V' },
      { path: 'letters/W', title: 'Letter W' },
      { path: 'letters/X', title: 'Letter X' },
      { path: 'letters/Y', title: 'Letter Y' },
      { path: 'letters/Z', title: 'Letter Z' },
    ]
  },
  {
    id: 'numbers',
    title: 'Numbers Tracing',
    icon: 'calculator-outline',
    activities: [
      { path: 'numbers/0', title: 'Number 0' },
      { path: 'numbers/1', title: 'Number 1' },
      { path: 'numbers/2', title: 'Number 2' },
      { path: 'numbers/3', title: 'Number 3' },
      { path: 'numbers/4', title: 'Number 4' },
      { path: 'numbers/5', title: 'Number 5' },
      { path: 'numbers/6', title: 'Number 6' },
      { path: 'numbers/7', title: 'Number 7' },
      { path: 'numbers/8', title: 'Number 8' },
      { path: 'numbers/9', title: 'Number 9' },
    ]
  }
];

export default function ClassScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
const [startDay, setStartDay] = useState("");
const [endDay, setEndDay] = useState("");
const [editClassSchedule, setEditClassSchedule] = useState("");
  const safeId = Array.isArray(params.classId) ? params.classId[0] : params.classId || (Array.isArray(params.id) ? params.id[0] : params.id);
  const paramName = Array.isArray(params.name) ? params.name[0] : params.name;
  const paramGrade = Array.isArray(params.grade) ? params.grade[0] : params.grade || (Array.isArray(params.level) ? params.level[0] : params.level);
  const paramThemeName = Array.isArray(params.themeName) ? params.themeName[0] : params.themeName;
  const paramThemeColor = Array.isArray(params.themeColor) ? params.themeColor[0] : params.themeColor;
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
  // Local state for dynamic class details (so edits update instantly)
  const [classDetails, setClassDetails] = useState({
    id: safeId as string,
    name: paramName || 'My Class',
    level: paramGrade || 'Grade 1',
    schedule: '',
    themeName: paramThemeName || 'green',
    themeColor: paramThemeColor || THEME_CONFIG.green.themeColor,
  });

 useEffect(() => {
  if (safeId) {
    fetchClassDetails();
    fetchStudents();
  }
}, [safeId]);

const fetchClassDetails = async () => {
  try {
    const data = await getClassById(safeId as string);

    if (!data) return;

    const selectedTheme =
      themeColors.find(t => t.name === data.theme_name)
      || themeColors[3];

    setClassDetails({
      id: data.id,
      name: data.title,
      level: data.grade,
      schedule: data.schedule || "",
      themeName: selectedTheme.name,
      themeColor: selectedTheme.value,
    });

  } catch (e) {
    console.log(e);
  }
};
  const themeConfig = THEME_CONFIG[classDetails.themeName] || THEME_CONFIG.green;

  // State for students
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // State for Add Student Modal
  const [isAddStudentModalVisible, setAddStudentModalVisible] = useState(false);
 const [selectedAvatar, setSelectedAvatar] = useState("😀");
const [newStudentName, setNewStudentName] = useState("");
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);

  // State for Edit Class Modal
  const [isEditClassModalVisible, setEditClassModalVisible] = useState(false);
  const [editClassName, setEditClassName] = useState('');
  const [editClassGrade, setEditClassGrade] = useState('');
 
  const [editClassTheme, setEditClassTheme] = useState('#86EFAC');
  const [isUpdatingClass, setIsUpdatingClass] = useState(false);

  // State for Move Student Modal
  const [isMoveModalVisible, setMoveModalVisible] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string | null>(null);
  const [isMovingStudent, setIsMovingStudent] = useState(false);

  // State for Assign Activities Modal
  const [isAssignModalVisible, setAssignModalVisible] = useState(false);
  const [activeActivityType, setActiveActivityType] = useState('tracing');
  const [activeCategoryTab, setActiveCategoryTab] = useState('lines');
  const [selectedActivityPaths, setSelectedActivityPaths] = useState<string[]>([]);
  const [isSavingActivities, setIsSavingActivities] = useState(false);

  const slideAnim = useRef(new Animated.Value(600)).current;

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true);
      const data = await getClassStudents(safeId as string);
      setStudents(data);
    } catch (error: any) {
      Alert.alert("Error fetching students", error.message);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Modal animation logic
  useEffect(() => {
    if (isAddStudentModalVisible || isEditClassModalVisible || isMoveModalVisible || isAssignModalVisible) {
      slideAnim.setValue(600);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }).start();
    }
  }, [isAddStudentModalVisible, isEditClassModalVisible, isMoveModalVisible, isAssignModalVisible]);

  // Handle adding a student
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) return;

    setIsCreatingStudent(true);
    try {
await addStudent(
  classDetails.id,
  newStudentName.trim(),
 
);
      await fetchStudents();
      setAddStudentModalVisible(false);
      setNewStudentName('');
    } catch (error: any) {
      Alert.alert("Error adding student", error.message);
    } finally {
      setIsCreatingStudent(false);
    }
  };

  // Open Edit Class Modal
const handleOpenEditClass = () => {
  setEditClassName(classDetails.name);
  setEditClassGrade(classDetails.level);

  const selected =
    themeColors.find(t => t.name === classDetails.themeName);

  setEditClassTheme(
    selected ? selected.value : themeColors[3].value
  );

  const schedule = classDetails.schedule || "";

  const match = schedule.match(
    /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*-\s*(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(.*)$/
  );

  if (match) {
    setStartDay(match[1]);
    setEndDay(match[2]);
    setEditClassSchedule(match[3].trim());
  } else {
    setStartDay("Monday");
    setEndDay("Friday");
    setEditClassSchedule(schedule);
  }

  setEditClassModalVisible(true);
};

  // Handle saving edited class details
const handleSaveClassEdit = async () => {

  if (!editClassName.trim()) {
    Alert.alert("Error", "Class name is required");
    return;
  }

  setIsUpdatingClass(true);

  try {

    const selectedTheme =
      themeColors.find(c => c.value === editClassTheme)
      || themeColors[3];


   const scheduleText = [
  startDay,
  endDay ? `- ${endDay}` : "",
  editClassSchedule.trim(),
]
.filter(Boolean)
.join(" ");


    console.log("Saving class:", {
      id: classDetails.id,
      name: editClassName,
      grade: editClassGrade,
      scheduleText,
      theme: selectedTheme.name
    });


    await updateClass(
      classDetails.id,
      editClassName.trim(),
      editClassGrade.trim() || "Grade 1",
      scheduleText,
      selectedTheme.name
    );


    setClassDetails(prev => ({
      ...prev,
      name: editClassName.trim(),
      level: editClassGrade.trim() || "Grade 1",
      schedule: scheduleText,
      themeName: selectedTheme.name,
      themeColor: selectedTheme.value
    }));


    setEditClassModalVisible(false);

    Alert.alert(
      "Success",
      "Class updated successfully!"
    );


  } catch(error:any){

    console.log("UPDATE ERROR:", error);

    Alert.alert(
      "Update Failed",
      error.message
    );

  } finally {

    setIsUpdatingClass(false);

  }
};

  // Handle deleting this class
  const handleDeleteClass = () => {
    Alert.alert(
      "Delete Class",
      `Are you sure you want to permanently delete "${classDetails.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteClass(classDetails.id);
              setEditClassModalVisible(false);
              router.back();
            } catch (error: any) {
              Alert.alert("Error deleting class", error.message);
            }
          }
        }
      ]
    );
  };

  // Open Assign Activities Modal
  const handleOpenAssignActivities = () => {
    const studentObj = students.find(s => s.id === selectedStudent);
    if (!studentObj) return;
    const currentAssigned = studentObj.assigned_activities || [];
    setSelectedActivityPaths([...currentAssigned]);
    setActiveActivityType('tracing');
    setActiveCategoryTab('lines');
    setAssignModalVisible(true);
  };

  // Handle saving assigned activities
  const handleSaveAssignedActivities = async () => {
    if (!selectedStudent) return;
    setIsSavingActivities(true);
    try {
      await updateStudentActivities(selectedStudent, selectedActivityPaths);
      await fetchStudents();
      setAssignModalVisible(false);
      Alert.alert("Success", "Assigned activities updated!");
    } catch (error: any) {
      Alert.alert("Error saving activities", error.message);
    } finally {
      setIsSavingActivities(false);
    }
  };

  // Toggle single activity assignment
  const toggleActivityPath = (path: string) => {
    if (selectedActivityPaths.includes(path)) {
      setSelectedActivityPaths(selectedActivityPaths.filter(p => p !== path));
    } else {
      setSelectedActivityPaths([...selectedActivityPaths, path]);
    }
  };

  // Toggle entire category
  const toggleCategorySelection = (categoryId: string) => {
    const category = ALL_TRACING_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;
    const categoryPaths = category.activities.map(a => a.path);
    const allSelected = categoryPaths.every(p => selectedActivityPaths.includes(p));

    if (allSelected) {
      setSelectedActivityPaths(selectedActivityPaths.filter(p => !categoryPaths.includes(p)));
    } else {
      const newPaths = new Set([...selectedActivityPaths, ...categoryPaths]);
      setSelectedActivityPaths(Array.from(newPaths));
    }
  };

  // Open Move Student Modal
  const handleOpenMoveStudent = async () => {
    try {
      const allTeacherClasses = await getTeacherClasses();
      const filtered = allTeacherClasses.filter((c: any) => c.id !== classDetails.id);
      setAvailableClasses(filtered);
      setSelectedTargetClassId(null);
      setMoveModalVisible(true);
    } catch (error: any) {
      Alert.alert("Error loading classes", error.message);
    }
  };

  // Handle moving student
  const handleConfirmMoveStudent = async () => {
    if (!selectedStudent || !selectedTargetClassId) return;
    setIsMovingStudent(true);
    try {
      await moveStudentClass(selectedStudent, selectedTargetClassId);
      const studentObj = students.find(s => s.id === selectedStudent);
      setSelectedStudent(null);
      await fetchStudents();
      setMoveModalVisible(false);
      Alert.alert("Moved!", `${studentObj?.name || 'Student'} has been moved to the selected class.`);
    } catch (error: any) {
      Alert.alert("Error moving student", error.message);
    } finally {
      setIsMovingStudent(false);
    }
  };

  // Handle deleting student
  const handleDeleteStudent = () => {
    const studentObj = students.find(s => s.id === selectedStudent);
    if (!studentObj) return;

    Alert.alert(
      "Delete Student",
      `Are you sure you want to remove ${studentObj.name} from this class?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
  console.log("Deleting student:", studentObj.id);

  await deleteStudent(studentObj.id);

  console.log("Deleted successfully");

  setSelectedStudent(null);
  await fetchStudents();

  Alert.alert("Deleted", `${studentObj.name} removed from class.`);
} catch (error: any) {
  console.log(error);
  Alert.alert("Error deleting student", error.message);
}
          }
        }
      ]
    );
  };

  const selectedStudentObj = students.find(s => s.id === selectedStudent);
  const activeCategory = ALL_TRACING_CATEGORIES.find(c => c.id === activeCategoryTab) || ALL_TRACING_CATEGORIES[0];

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* HEADER SECTION */}
        <View className={`w-full relative overflow-hidden ${isTablet ? 'h-[320px]' : 'h-[240px]'}`}>
          <View className="absolute w-full z-0" style={{ height: '115%', top: -30 }}>
            {classDetails.themeName === 'orange' ? (
              <OrangeHeaderSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
            ) : classDetails.themeName === 'yellow' ? (
              <YellowHeaderSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
            ) : classDetails.themeName === 'blue' ? (
              <BlueHeaderSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
            ) : (
              <GreenHeaderSvg width="100%" height="100%" preserveAspectRatio="xMidYMax slice" />
            )}
          </View>

          <View
            className={`flex-1 justify-between relative z-10 ${isTablet ? 'px-12 pb-8' : 'px-6 pb-6'}`}
            style={{ paddingTop: insets.top + (isTablet ? 24 : 16) }}
          >
            <View className="flex-row justify-between items-center w-full">
              <Pressable onPress={() => router.back()} className="p-2 -ml-2">
                <Ionicons name="arrow-back" size={isTablet ? 32 : 28} color="#4B5563" />
              </Pressable>

              {/* Edit Class Button */}
              <Pressable
                onPress={handleOpenEditClass}
                className="flex-row items-center bg-white/70 border border-white px-3.5 py-2 rounded-xl shadow-sm"
              >
                <Feather name="edit-2" size={isTablet ? 18 : 15} color={themeConfig.darkThemeColor} />
                <Text className={`font-quicksand-bold ml-1.5 ${isTablet ? 'text-base' : 'text-sm'}`} style={{ color: themeConfig.darkThemeColor }}>
                  Edit Class
                </Text>
              </Pressable>
            </View>

            <View>
              <View className="flex-row items-center gap-2 mb-2">
                <View className="bg-white/70 self-start px-3 py-1 rounded-md border border-white">
                  <Text className={`font-quicksand-bold uppercase tracking-widest ${isTablet ? 'text-sm' : 'text-xs'}`} style={{ color: themeConfig.darkThemeColor }}>
                    {classDetails.level}
                  </Text>
                </View>
                {classDetails.schedule ? (
                  <View className="bg-white/70 self-start px-3 py-1 rounded-md border border-white flex-row items-center">
                    <Ionicons name="time-outline" size={12} color={themeConfig.darkThemeColor} style={{ marginRight: 4 }} />
                    <Text className={`font-quicksand-bold ${isTablet ? 'text-sm' : 'text-xs'}`} style={{ color: themeConfig.darkThemeColor }}>
                      {classDetails.schedule}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-5xl' : 'text-4xl'}`}>
                {classDetails.name}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <Ionicons name="school" size={isTablet ? 18 : 14} color="#6B7280" />
                <Text className={`text-[#6B7280] font-quicksand-medium ${isTablet ? 'text-lg' : 'text-sm'}`}>
                  {students.length} students
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* STUDENT GRID SECTION */}
        <View className={isTablet ? 'px-12 mt-10 mb-10' : 'px-6 mt-8 mb-6'}>
          {isLoadingStudents ? (
            <ActivityIndicator size="large" color={themeConfig.themeColor} className="mt-10" />
          ) : (
            <View className={`flex-row flex-wrap justify-center ${isTablet ? 'gap-x-8 gap-y-10' : 'gap-x-4 gap-y-6'}`}>
              {students.map((student) => {
                const isSelected = selectedStudent === student.id;
                const assignedCount = (student.assigned_activities || []).length;
                return (
                  <Pressable
                    key={student.id}
                    className={`items-center relative ${isTablet ? 'w-[30%]' : 'w-[45%]'}`}
                    onPress={() => setSelectedStudent(isSelected ? null : student.id)}
                  >
                    <View
                      className={`bg-white items-center justify-center shadow-sm relative ${isTablet ? 'w-32 h-32 rounded-full border-[3px]' : 'w-24 h-24 rounded-full border-2'
                        } ${isSelected ? '' : 'border-[#E5E7EB]'}`}
                      style={isSelected ? { borderColor: themeConfig.themeColor } : {}}
                    >
                      <Text style={{ fontSize: isTablet ? 56 : 42 }}> {student.avatar || "😀"} </Text>

                      {/* Assigned Activities Badge */}
                      {assignedCount > 0 && (
                        <View className="absolute -top-1 -right-1 bg-[#62A9E6] border-2 border-white rounded-full px-2 py-0.5 items-center justify-center">
                          <Text className="text-white font-quicksand-bold text-[11px]">{assignedCount}</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className={`font-quicksand-medium text-center ${isTablet ? 'text-2xl mt-4' : 'text-xl mt-2'}`}
                      style={{ color: isSelected ? themeConfig.themeColor : '#4B5563' }}
                    >
                      {student.name}
                    </Text>
                    {assignedCount > 0 && (
                      <Text className="text-[#6B7280] font-quicksand-medium text-xs mt-0.5">
                        {assignedCount} {assignedCount === 1 ? 'activity' : 'activities'}
                      </Text>
                    )}
                  </Pressable>
                );
              })}

              {/* Add Student Button */}
              <Pressable
                className={`items-center ${isTablet ? 'w-[30%]' : 'w-[45%]'}`}
                onPress={() => setAddStudentModalVisible(true)}
              >
                <View className={`bg-[#E5E7EB] border-dashed border-[#9CA3AF] items-center justify-center ${isTablet ? 'w-32 h-32 rounded-full border-[3px]' : 'w-24 h-24 rounded-full border-2'}`}>
                  <Ionicons name="add" size={isTablet ? 56 : 40} color="#6B7280" />
                </View>
                <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-2xl mt-4' : 'text-xl mt-2'}`}>
                  Add Student
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* STUDENT ACTION FOOTER CONTAINER */}
      <View
        className={`w-full bg-[#F9FAFB] pt-2 ${isTablet ? 'px-12 pb-8' : 'px-6 pb-6'}`}
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : (isTablet ? 40 : 24) }}
      >
        {selectedStudent && selectedStudentObj ? (
          <View className="bg-white border border-[#E5E7EB] rounded-3xl p-4 shadow-md">
            <View className="flex-row items-center justify-between mb-3 px-2">
              <Text className="font-quicksand-bold text-[#4B5563] text-base">
                Selected: <Text style={{ color: themeConfig.darkThemeColor }}>{selectedStudentObj.name}</Text>
              </Text>
              <Pressable onPress={() => setSelectedStudent(null)} className="p-1">
                <Text className="font-quicksand-medium text-[#9CA3AF] text-xs">Deselect</Text>
              </Pressable>
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row gap-2 mb-3">
              <Pressable
                onPress={handleOpenAssignActivities}
                className="flex-1 bg-[#EFF6FF] border border-[#BFDBFE] py-2.5 rounded-2xl items-center justify-center flex-row gap-1.5"
              >
                <Ionicons name="list" size={16} color="#2563EB" />
                <Text className="font-quicksand-bold text-[#2563EB] text-xs">
                  Assign ({selectedStudentObj.assigned_activities?.length || 0})
                </Text>
              </Pressable>

              <Pressable
                onPress={handleOpenMoveStudent}
                className="flex-1 bg-[#FDF4FF] border border-[#F5D0FE] py-2.5 rounded-2xl items-center justify-center flex-row gap-1.5"
              >
                <Ionicons name="swap-horizontal" size={16} color="#C084FC" />
                <Text className="font-quicksand-bold text-[#C084FC] text-xs">Move Class</Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteStudent}
                className="bg-[#FEF2F2] border border-[#FECACA] px-3.5 py-2.5 rounded-2xl items-center justify-center flex-row gap-1"
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text className="font-quicksand-bold text-[#EF4444] text-xs">Delete</Text>
              </Pressable>
            </View>

            {/* Prominent Start Activity Button */}
            <Pressable
              onPress={() => {
                router.push({
                  pathname: '/student/[studentId]',
                  params: {
                    studentId: selectedStudentObj.id,
                    studentName: selectedStudentObj.name,
                    assignedActivities: JSON.stringify(selectedStudentObj.assigned_activities || []),
                    classId: selectedStudentObj.class_id,
                    teacherId: selectedStudentObj.teacher_id
                  }
                });
              }}
              className={`w-full flex items-center justify-center border-b-[4px] bg-[#62A9E6] border-[#5298D4] ${isTablet ? 'h-[64px] rounded-2xl' : 'h-[52px] rounded-xl'}`}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="play" size={20} color="white" />
                <Text className={`text-white font-fredoka-regular ${isTablet ? 'text-2xl' : 'text-lg'}`}>
                  Start Activity for {selectedStudentObj.name}
                </Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable
            disabled={true}
            className={`w-full flex items-center justify-center border-b-[4px] p-[10px] bg-[#E5E7EB] border-[#D1D5DB] ${isTablet ? 'h-[72px] rounded-[36px]' : 'h-[56px] rounded-full'}`}
          >
            <Text className={`text-[#9CA3AF] font-fredoka-regular ${isTablet ? 'text-xl' : 'text-base'}`}>
              Select a student to start or assign activities
            </Text>
          </Pressable>
        )}
      </View>

      {/* ADD STUDENT MODAL */}
      <Modal
        visible={isAddStudentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddStudentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <Pressable className="flex-1" onPress={() => setAddStudentModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[40%]' : 'h-[50%]'}`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-fredoka-one text-2xl text-[#4B5563]">Add New Student</Text>
              <Pressable onPress={() => setAddStudentModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <View className="mb-8">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">
                Student Name
                </Text>
                <TextInput
                value={newStudentName}
                onChangeText={setNewStudentName}
               placeholder="e.g. Juan Dela Cruz"
               placeholderTextColor="#9CA3AF"
               className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
                />
              </View>
<Text className="font-quicksand-bold text-[#4B5563] text-base mb-3">
  Choose Avatar
</Text>

<View className="flex-row flex-wrap justify-between mb-6">
  {AVATARS.map((avatar) => {
    const selected = selectedAvatar === avatar;

    return (
      <Pressable
        key={avatar}
        onPress={() => setSelectedAvatar(avatar)}
        className={`w-[22%] aspect-square rounded-2xl mb-3 items-center justify-center border-2 ${
          selected
            ? "border-[#62A9E6] bg-[#EFF6FF]"
            : "border-[#E5E7EB] bg-white"
        }`}
      >
        <Text style={{ fontSize: 34 }}>
          {avatar}
        </Text>
      </Pressable>
    );
  })}
</View>
            <Pressable
              onPress={handleAddStudent}
              className={`py-4 rounded-xl items-center ${newStudentName.trim() && !isCreatingStudent ? 'bg-[#9ACBF9]' : 'bg-[#E5E7EB]'}`}
              disabled={!newStudentName.trim() || isCreatingStudent}
            >
              {isCreatingStudent ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-quicksand-bold text-white text-lg">Add Student</Text>
              )}
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDIT CLASS DETAILS MODAL */}
      <Modal
        visible={isEditClassModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditClassModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/50"
        >
          <Pressable className="flex-1" onPress={() => setEditClassModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[60%]' : 'h-[75%]'}`}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-fredoka-one text-2xl text-[#4B5563]">Edit Class Details</Text>
              <Pressable onPress={() => setEditClassModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Class Name</Text>
                <TextInput
                  value={editClassName}
                  onChangeText={setEditClassName}
                  placeholder="e.g. Class 1A"
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
                />
              </View>

              <View className="mb-4">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Grade</Text>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map((grade) => (
                    <Pressable
                      key={grade}
                      onPress={() => setEditClassGrade(grade)}
                      className={`px-3 py-1.5 rounded-xl border ${editClassGrade === grade
                        ? 'bg-[#9ACBF9] border-[#9ACBF9]'
                        : 'bg-[#F5F8FA] border-[#E5E7EB]'
                        }`}
                    >
                      <Text
                        className={`font-quicksand-bold text-xs ${editClassGrade === grade ? 'text-white' : 'text-[#4B5563]'}`}
                      >
                        {grade}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  value={editClassGrade}
                  onChangeText={setEditClassGrade}
                  placeholder="Or type custom grade"
                  placeholderTextColor="#9CA3AF"
                  className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
                />
              </View>

              <View className="mb-4">

  <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">
    Start Day
  </Text>

  <View className="bg-[#F5F8FA] rounded-xl">
    <Picker
      selectedValue={startDay}
      onValueChange={(value) => setStartDay(value)}
    >
      {DAYS.map((day) => (
        <Picker.Item
          key={day}
          label={day}
          value={day}
        />
      ))}
    </Picker>
  </View>

  <Text className="font-quicksand-bold text-[#4B5563] text-base mt-4 mb-2">
    End Day
  </Text>

  <View className="bg-[#F5F8FA] rounded-xl">
    <Picker
      selectedValue={endDay}
      onValueChange={(value) => setEndDay(value)}
    >
      <Picker.Item label="Select End Day" value="" />
      {DAYS.map((day) => (
        <Picker.Item
          key={day}
          label={day}
          value={day}
        />
      ))}
    </Picker>
  </View>

  <Text className="font-quicksand-bold text-[#4B5563] text-base mt-4 mb-2">
    Time Schedule
  </Text>

  <TextInput
    value={editClassSchedule}
    onChangeText={setEditClassSchedule}
    placeholder="e.g. 10:00 AM"
    placeholderTextColor="#9CA3AF"
    className="bg-[#F5F8FA] rounded-xl px-4 py-3 font-quicksand-medium text-[#4B5563]"
  />

</View>
              <View className="mb-6">
                <Text className="font-quicksand-bold text-[#4B5563] text-base mb-2">Color Theme</Text>
                <View className="flex-row gap-4">
                  {themeColors.map((color) => (
                    <Pressable
                      key={color.name}
                      onPress={() => setEditClassTheme(color.value)}
                      className={`w-12 h-12 rounded-full justify-center items-center ${editClassTheme === color.value ? 'border-4 border-[#4B5563]' : ''}`}
                      style={[
                        { backgroundColor: color.value },
                        editClassTheme === color.value && {
                          shadowColor: color.shadow,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 5,
                        }
                      ]}
                    >
                      {editClassTheme === color.value && <Feather name="check" size={20} color="white" />}
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
  onPress={() => {
    console.log("UPDATE CLICKED");
    console.log({
      name: editClassName,
      grade: editClassGrade,
      schedule: editClassSchedule,
      startDay,
      endDay,
    });

    handleSaveClassEdit();
  }}
  className={`py-4 rounded-xl items-center mb-3 ${
    editClassName.trim() && !isUpdatingClass
      ? 'bg-[#9ACBF9]'
      : 'bg-[#E5E7EB]'
  }`}
  disabled={isUpdatingClass}
>
  {isUpdatingClass ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text className="font-quicksand-bold text-white text-lg">
      Update Class
    </Text>
  )}
</Pressable>

              {/* Delete Class Button */}
              <Pressable
  onPress={() => {
    console.log("DELETE CLICKED");
    handleDeleteClass();
  }}
                className="py-4 rounded-xl items-center mb-8 border border-[#FECACA] bg-[#FEF2F2] flex-row justify-center gap-2"
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text className="font-quicksand-bold text-[#EF4444] text-lg">Delete Class</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MOVE STUDENT MODAL */}
      <Modal
        visible={isMoveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMoveModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setMoveModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[50%]' : 'h-[60%]'}`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-fredoka-one text-2xl text-[#4B5563]">
                Move {selectedStudentObj?.name}
              </Text>
              <Pressable onPress={() => setMoveModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            <Text className="font-quicksand-medium text-sm text-[#6B7280] mb-4">
              Select another class below to move this student:
            </Text>

            <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
              {availableClasses.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Ionicons name="folder-open-outline" size={40} color="#9CA3AF" />
                  <Text className="font-quicksand-medium text-[#9CA3AF] text-center mt-2">
                    No other classes available. Create another class first!
                  </Text>
                </View>
              ) : (
                availableClasses.map((item) => {
                  const isChosen = selectedTargetClassId === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedTargetClassId(item.id)}
                      className={`flex-row items-center justify-between p-4 rounded-2xl border-2 mb-3 ${isChosen ? 'bg-[#EFF6FF] border-[#3B82F6]' : 'bg-[#F9FAFB] border-[#E5E7EB]'}`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-[#E5E7EB] items-center justify-center">
                          <Ionicons name="school" size={20} color="#6B7280" />
                        </View>
                        <View>
                          <Text className={`font-quicksand-bold text-base ${isChosen ? 'text-[#1D4ED8]' : 'text-[#4B5563]'}`}>
                            {item.title}
                          </Text>
                          <Text className="font-quicksand-medium text-xs text-[#6B7280]">
                            {item.grade || 'Grade 1'} {item.schedule ? `• ${item.schedule}` : ''}
                          </Text>
                        </View>
                      </View>
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isChosen ? 'border-[#3B82F6] bg-[#3B82F6]' : 'border-[#D1D5DB]'}`}>
                        {isChosen && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            <Pressable
              onPress={handleConfirmMoveStudent}
              disabled={!selectedTargetClassId || isMovingStudent}
              className={`py-4 rounded-xl items-center ${selectedTargetClassId && !isMovingStudent ? 'bg-[#3B82F6]' : 'bg-[#E5E7EB]'}`}
            >
              {isMovingStudent ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-quicksand-bold text-white text-lg">Move to Selected Class</Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* ASSIGN ACTIVITIES MODAL */}
      <Modal
        visible={isAssignModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setAssignModalVisible(false)} />
          <Animated.View
            style={{ transform: [{ translateY: slideAnim }] }}
            className={`bg-white rounded-t-3xl p-6 ${isTablet ? 'h-[80%]' : 'h-[88%]'}`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <View>
                <Text className="font-fredoka-one text-2xl text-[#4B5563]">Assign Activities</Text>
                <Text className="font-quicksand-medium text-sm text-[#6B7280]">
                  Student: <Text className="font-quicksand-bold text-[#62A9E6]">{selectedStudentObj?.name}</Text> ({selectedActivityPaths.length} selected)
                </Text>
              </View>
              <Pressable onPress={() => setAssignModalVisible(false)} className="p-2">
                <Feather name="x" size={24} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Top-Level Activity Types */}
            <View className="flex-row gap-2 my-3 bg-[#F3F4F6] p-1.5 rounded-2xl">
              {['tracing', 'matching', 'sound'].map((type) => {
                const isSelected = activeActivityType === type;
                const label = type === 'tracing' ? 'Tracing' : type === 'matching' ? 'Matching' : 'Sound';
                return (
                  <Pressable
                    key={type}
                    onPress={() => setActiveActivityType(type)}
                    className={`flex-1 py-2.5 px-2 rounded-xl items-center justify-center border-b-[3px] ${isSelected
                      ? 'bg-white border-[#62A9E6]'
                      : 'bg-transparent border-transparent'
                      }`}
                  >
                    <Text className={`font-fredoka-regular text-sm ${isSelected ? 'text-[#62A9E6]' : 'text-[#6B7280]'}`}>
                      {label}
                      {type !== 'tracing' && ' (Soon)'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {activeActivityType === 'tracing' ? (
              <>
                {/* Tracing Sub-Category Tabs */}
                <View className="flex-row gap-2 mb-3">
                  {ALL_TRACING_CATEGORIES.map((cat) => {
                    const isActive = activeCategoryTab === cat.id;
                    const countInCategory = cat.activities.filter(a => selectedActivityPaths.includes(a.path)).length;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setActiveCategoryTab(cat.id)}
                        className={`flex-1 py-2 px-1 rounded-xl items-center justify-center border-2 border-b-[4px] ${isActive
                          ? 'bg-[#F0F9FF] border-[#62A9E6]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] border-b-[#D1D5DB]'
                          }`}
                      >
                        <Text className={`font-quicksand-bold text-xs capitalize ${isActive ? 'text-[#62A9E6]' : 'text-[#6B7280]'}`}>
                          {cat.id}
                        </Text>
                        {countInCategory > 0 && (
                          <View className="bg-[#62A9E6] rounded-full px-1.5 py-0.2 mt-0.5">
                            <Text className="text-white text-[9px] font-quicksand-bold">{countInCategory}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Select All Toggle for active category */}
                <View className="flex-row justify-between items-center mb-3 px-1">
                  <Text className="font-quicksand-bold text-[#4B5563] text-base">
                    {activeCategory.title}
                  </Text>
                  <Pressable
                    onPress={() => toggleCategorySelection(activeCategory.id)}
                    className="bg-white px-3 py-1.5 rounded-lg border-2 border-b-[4px] border-[#E5E7EB] border-b-[#D1D5DB] active:border-b-[2px] active:mt-[2px]"
                  >
                    <Text className="font-quicksand-bold text-xs text-[#4B5563]">
                      {activeCategory.activities.every(a => selectedActivityPaths.includes(a.path))
                        ? 'Deselect All'
                        : 'Select All'}
                    </Text>
                  </Pressable>
                </View>

                {/* Activity Checkbox List */}
                <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
                  <View className="flex-row flex-wrap justify-between gap-y-2">
                    {activeCategory.activities.map((item) => {
                      const isChecked = selectedActivityPaths.includes(item.path);
                      return (
                        <Pressable
                          key={item.path}
                          onPress={() => toggleActivityPath(item.path)}
                          className={`flex-row items-center justify-between p-3.5 rounded-xl border-2 border-b-[4px] w-[48%] ${isChecked
                            ? 'bg-[#F0F9FF] border-[#62A9E6]'
                            : 'bg-[#F9FAFB] border-[#E5E7EB] border-b-[#D1D5DB]'
                            }`}
                        >
                          <Text className={`font-quicksand-bold text-xs flex-1 mr-2 ${isChecked ? 'text-[#62A9E6]' : 'text-[#4B5563]'}`} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <View className={`w-5 h-5 rounded-md border-2 items-center justify-center ${isChecked ? 'border-[#62A9E6] bg-[#62A9E6]' : 'border-[#D1D5DB]'}`}>
                            {isChecked && <Ionicons name="checkmark" size={12} color="white" />}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            ) : (
              <View className="flex-1 items-center justify-center py-10 px-4">
                <View className="w-16 h-16 bg-[#F0F9FF] rounded-full items-center justify-center mb-4 border-2 border-b-[4px] border-[#62A9E6]">
                  <Ionicons name="lock-closed" size={28} color="#62A9E6" />
                </View>
                <Text className="font-fredoka-regular text-lg text-[#4B5563] text-center mb-1">
                  {activeActivityType.charAt(0).toUpperCase() + activeActivityType.slice(1)} Activities
                </Text>
                <Text className="font-quicksand-medium text-sm text-[#6B7280] text-center">
                  We are currently developing these games. Stay tuned for updates!
                </Text>
              </View>
            )}

            {/* Save Button */}
            <Pressable
              onPress={handleSaveAssignedActivities}
              disabled={isSavingActivities}
              className={`w-full flex items-center justify-center border-b-[4px] bg-[#62A9E6] border-[#5298D4] active:mt-[2px] active:border-b-[2px] ${isTablet ? 'h-[64px] rounded-2xl' : 'h-[52px] rounded-xl'}`}
            >
              {isSavingActivities ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-fredoka-regular text-white text-lg">
                  Save Assigned Activities ({selectedActivityPaths.length})
                </Text>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}