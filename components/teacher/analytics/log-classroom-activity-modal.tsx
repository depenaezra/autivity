import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { supabase } from '../../../src/lib/supabase';
import { recordClassroomActivitySession, RubricEvaluation } from '../../../src/services/sessions';
import { BaseModal } from '../home/base-modal';
import { RUBRIC_CRITERIA, RUBRIC_SCALE } from './evaluation-review-modal';

interface LogClassroomActivityModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialStudentId?: string;
  initialStudentName?: string;
  isTablet?: boolean;
}

interface StudentOption {
  id: string;
  name: string;
  classId: string;
  className?: string;
}

interface MasterDomainItem {
  id: string;
  name: string;
  color: string;
  subSkills: string[];
}

export function LogClassroomActivityModal({
  visible,
  onClose,
  onSuccess,
  initialStudentId,
  initialStudentName,
  isTablet: isTabletProp,
}: LogClassroomActivityModalProps) {
  const { width } = useWindowDimensions();
  const isTablet = isTabletProp ?? width >= 768;

  // Form State
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [masterDomains, setMasterDomains] = useState<MasterDomainItem[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [activityTitle, setActivityTitle] = useState('');
  const [selectedMasterDomain, setSelectedMasterDomain] = useState<string>('');
  const [selectedSubSkills, setSelectedSubSkills] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState('15');
  const [scores, setScores] = useState<RubricEvaluation>({
    looking_at_objects: 4,
    concentrating: 4,
    performing_task: 4,
    following_instructions: 4,
    completed_work: 4,
  });
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch student list & master domains on open
  useEffect(() => {
    if (visible) {
      loadFormData();
      if (initialStudentId) {
        setSelectedStudentId(initialStudentId);
      }
      setIsSubmitting(false);
    } else {
      // Reset form on close
      if (!initialStudentId) {
        setSelectedStudentId('');
      }
      setActivityTitle('');
      setSelectedMasterDomain('');
      setSelectedSubSkills([]);
      setDurationMinutes('15');
      setTeacherFeedback('');
      setScores({
        looking_at_objects: 4,
        concentrating: 4,
        performing_task: 4,
        following_instructions: 4,
        completed_work: 4,
      });
    }
  }, [visible, initialStudentId]);

  const loadFormData = async () => {
    setIsLoadingMetadata(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [studentsRes, classesRes, domainsRes] = await Promise.all([
        supabase
          .from('students')
          .select('id, name, class_id')
          .eq('teacher_id', user.id)
          .order('name', { ascending: true }),
        supabase
          .from('classes')
          .select('id, title')
          .eq('teacher_id', user.id),
        supabase
          .from('master_domains')
          .select('id, name, color, sub_skills ( name )')
          .order('name', { ascending: true }),
      ]);

      const classMap: Record<string, string> = {};
      (classesRes.data || []).forEach((c: any) => {
        classMap[c.id] = c.title;
      });

      const studentList: StudentOption[] = (studentsRes.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        classId: s.class_id,
        className: classMap[s.class_id] || 'Class',
      }));

      setStudents(studentList);

      const domainList: MasterDomainItem[] = (domainsRes.data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        color: d.color || '#62A9E6',
        subSkills: (d.sub_skills || []).map((sub: any) => sub.name).filter(Boolean),
      }));

      setMasterDomains(domainList);

      // Default select first master domain if available and none selected
      if (domainList.length > 0 && !selectedMasterDomain) {
        setSelectedMasterDomain(domainList[0].name);
      }

      // Default select first student if not pre-set
      if (!initialStudentId && studentList.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentList[0].id);
      }
    } catch (err) {
      console.error('LogClassroomActivityModal: failed to load form data', err);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleScoreChange = (criterionKey: keyof RubricEvaluation, scoreValue: number) => {
    setScores((prev) => ({
      ...prev,
      [criterionKey]: scoreValue,
    }));
  };

  const toggleSubSkill = (subSkillName: string) => {
    setSelectedSubSkills((prev) =>
      prev.includes(subSkillName)
        ? prev.filter((s) => s !== subSkillName)
        : [...prev, subSkillName]
    );
  };

  const currentDomainObj = masterDomains.find((d) => d.name === selectedMasterDomain);

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      Alert.alert('Required Field', 'Please select a learner.');
      return;
    }

    if (!activityTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a title or description for this classroom activity.');
      return;
    }

    if (!selectedMasterDomain) {
      Alert.alert('Required Field', 'Please select a Master Developmental Domain.');
      return;
    }

    if (currentDomainObj && currentDomainObj.subSkills.length > 0 && selectedSubSkills.length === 0) {
      Alert.alert('Required Field', 'Please select at least one target subskill.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Authentication Error', 'You must be logged in as a teacher.');
      return;
    }

    setIsSubmitting(true);
    try {
      let studentObj = students.find((s) => s.id === selectedStudentId);
      let classId = studentObj?.classId;

      if (!classId && selectedStudentId) {
        const { data: stRow } = await supabase
          .from('students')
          .select('class_id, name')
          .eq('id', selectedStudentId)
          .maybeSingle();
        classId = stRow?.class_id;
      }

      const durationSec = Math.max(60, (parseInt(durationMinutes, 10) || 15) * 60);

      await recordClassroomActivitySession({
        student_id: selectedStudentId,
        class_id: classId || '',
        teacher_id: user.id,
        title: activityTitle.trim(),
        master_domain: selectedMasterDomain,
        sub_skills: selectedSubSkills,
        duration_seconds: durationSec,
        rubric_evaluation: scores,
        teacher_feedback: teacherFeedback.trim(),
      });

      Alert.alert(
        'Activity Recorded! 🎉',
        `Classroom evaluation for "${activityTitle.trim()}" has been saved and published to analytics.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('LogClassroomActivityModal: save error', err);
      Alert.alert('Save Failed', err.message || 'Could not save classroom activity evaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPoints = Object.values(scores).reduce(
    (sum: number, val: any) => sum + (Number(val) || 0),
    0
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Log Classroom Activity"
      isTablet={isTablet}
      onSubmit={handleSubmit}
      submitLabel="SAVE EVALUATION"
      submitDisabled={isSubmitting}
      isSubmitting={isSubmitting}
      heightClassName={isTablet ? 'h-[75%]' : 'h-[78%]'}
    >
      {isLoadingMetadata ? (
        <View className="py-16 items-center justify-center">
          <ActivityIndicator size="large" color="#62A9E6" />
          <Text className="mt-3 font-quicksand-medium text-sm text-[#9CA3AF]">
            Loading classroom options...
          </Text>
        </View>
      ) : (
        <View className="gap-5">
          {/* 1. LEARNER SELECTION */}
          <View>
            <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase mb-2">
              1. Select Learner
            </Text>
            {initialStudentId ? (
              <View className="bg-[#F1F1F1] rounded-xl px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-[#BBE8FB] items-center justify-center">
                    <Feather name="user" size={16} color="#62A9E6" />
                  </View>
                  <Text className="font-fredoka-one text-base text-[#484A4B]">
                    {initialStudentName || 'Selected Learner'}
                  </Text>
                </View>
                <View className="bg-white px-2.5 py-1 rounded-[6px] border border-[#BBE8FB]">
                  <Text className="font-fredoka-one text-xs text-[#62A9E6] uppercase">LOCKED</Text>
                </View>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {students.map((st) => {
                  const isSelected = selectedStudentId === st.id;
                  return (
                    <Pressable
                      key={st.id}
                      onPress={() => setSelectedStudentId(st.id)}
                      className={`px-3.5 py-2.5 rounded-xl border-[2px] flex-row items-center gap-1.5 active:scale-95 transition-transform bg-white ${
                        isSelected ? 'border-[#BBE8FB]' : 'border-[#F1F1F1]'
                      }`}
                      style={{
                        shadowColor: isSelected ? '#BBE8FB' : '#F1F1F1',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }}
                    >
                      <Feather
                        name={isSelected ? 'check-circle' : 'user'}
                        size={14}
                        color={isSelected ? '#62A9E6' : '#9CA3AF'}
                      />
                      <Text
                        className="font-fredoka-one text-xs"
                        style={{ color: isSelected ? '#62A9E6' : '#6B7280' }}
                      >
                        {st.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* 2. ACTIVITY TITLE */}
          <View>
            <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase mb-2">
              2. Activity Title & Description
            </Text>
            <TextInput
              placeholder="E.g., Clay Sculpting, Paper Cutting Along Lines, Block Sorting"
              placeholderTextColor="#9CA3AF"
              value={activityTitle}
              onChangeText={setActivityTitle}
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-quicksand-medium text-[#484A4B]"
            />
          </View>

          {/* 3. MASTER DEVELOPMENTAL DOMAIN */}
          <View>
            <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase mb-2">
              3. Master Developmental Domain
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {masterDomains.map((dom) => {
                const isSelected = selectedMasterDomain === dom.name;
                return (
                  <Pressable
                    key={dom.id}
                    onPress={() => {
                      setSelectedMasterDomain(dom.name);
                      // Clear subskills that do not belong to the newly selected domain
                      const allowedSub = new Set(dom.subSkills);
                      setSelectedSubSkills((prev) => prev.filter((s) => allowedSub.has(s)));
                    }}
                    className={`px-3.5 py-2.5 rounded-xl border-[2px] flex-row items-center gap-2 active:scale-95 transition-transform bg-white ${
                      isSelected ? 'border-[#BBE8FB]' : 'border-[#F1F1F1]'
                    }`}
                    style={{
                      shadowColor: isSelected ? '#BBE8FB' : '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dom.color }}
                    />
                    <Text
                      className="font-fredoka-one text-xs"
                      style={{ color: isSelected ? '#62A9E6' : '#484A4B' }}
                    >
                      {dom.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 4. TARGET SUBSKILLS */}
          {currentDomainObj && currentDomainObj.subSkills.length > 0 && (
            <View>
              <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase mb-2">
                4. Target Subskills
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {currentDomainObj.subSkills.map((sub) => {
                  const isChecked = selectedSubSkills.includes(sub);
                  return (
                    <Pressable
                      key={sub}
                      onPress={() => toggleSubSkill(sub)}
                      className={`px-3 py-1.5 rounded-[8px] border-[2px] flex-row items-center gap-1.5 active:scale-95 transition-transform bg-white ${
                        isChecked ? 'border-[#BBE8FB]' : 'border-[#F1F1F1]'
                      }`}
                      style={{
                        shadowColor: isChecked ? '#BBE8FB' : '#F1F1F1',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }}
                    >
                      <Feather
                        name={isChecked ? 'check-square' : 'square'}
                        size={13}
                        color={isChecked ? '#62A9E6' : '#9CA3AF'}
                      />
                      <Text
                        className="font-quicksand-bold text-xs"
                        style={{ color: isChecked ? '#62A9E6' : '#4B5563' }}
                      >
                        {sub}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* 5. APPROXIMATE DURATION */}
          <View>
            <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase mb-2">
              5. Approximate Duration
            </Text>
            <View className="flex-row items-center gap-2">
              {['10', '15', '20', '30'].map((mins) => {
                const isSelected = durationMinutes === mins;
                return (
                  <Pressable
                    key={mins}
                    onPress={() => setDurationMinutes(mins)}
                    className={`px-4 py-2 rounded-xl border-[2px] items-center justify-center active:scale-95 transition-transform bg-white ${
                      isSelected ? 'border-[#BBE8FB]' : 'border-[#F1F1F1]'
                    }`}
                    style={{
                      shadowColor: isSelected ? '#BBE8FB' : '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <Text
                      className="font-fredoka-one text-xs"
                      style={{ color: isSelected ? '#62A9E6' : '#6B7280' }}
                    >
                      {mins} mins
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 6. RUBRIC EVALUATION */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase">
                6. Rubric Evaluation
              </Text>
              <View className="bg-[#F0FDF4] border border-[#CBFAC4] px-2.5 py-0.5 rounded-full">
                <Text className="font-fredoka-one text-xs text-[#179D33]">
                  TOTAL: {totalPoints} / 20
                </Text>
              </View>
            </View>

            <View className="gap-3">
              {RUBRIC_CRITERIA.map((criterion) => {
                const currentScore = scores[criterion.key as keyof RubricEvaluation];
                const scaleInfo = RUBRIC_SCALE[currentScore] || RUBRIC_SCALE[0];

                return (
                  <View
                    key={criterion.key}
                    className="bg-white border-[2px] border-[#F1F1F1] rounded-xl p-3"
                    style={{
                      shadowColor: '#F1F1F1',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-fredoka-one text-sm text-[#484A4B]">
                        {criterion.title}
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-[6px] border"
                        style={{
                          backgroundColor: scaleInfo.bgColor,
                          borderColor: scaleInfo.borderColor,
                        }}
                      >
                        <Text
                          className="font-fredoka-one text-[10px] uppercase"
                          style={{ color: scaleInfo.color }}
                        >
                          {currentScore} • {scaleInfo.label}
                        </Text>
                      </View>
                    </View>

                    {/* 0-4 Selector Buttons */}
                    <View className="flex-row items-center justify-between gap-1.5">
                      {[0, 1, 2, 3, 4].map((point) => {
                        const isSelected = currentScore === point;
                        const pointScale = RUBRIC_SCALE[point];
                        return (
                          <Pressable
                            key={point}
                            onPress={() =>
                              handleScoreChange(criterion.key as keyof RubricEvaluation, point)
                            }
                            className="flex-1 py-2 rounded-lg border-[2px] items-center justify-center active:scale-95 transition-transform"
                            style={{
                              backgroundColor: isSelected ? pointScale.bgColor : '#F9FAFB',
                              borderColor: isSelected ? pointScale.borderColor : '#E5E7EB',
                            }}
                          >
                            <Text
                              className={`font-fredoka-one text-sm ${
                                isSelected ? '' : 'text-[#6B7280]'
                              }`}
                              style={isSelected ? { color: pointScale.color } : {}}
                            >
                              {point}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 7. TEACHER REMARKS & NOTES */}
          <View>
            <Text className="font-fredoka-one text-xs text-[#9EA0A0] uppercase mb-2">
              7. Teacher Remarks & Notes
            </Text>
            <TextInput
              placeholder="Add observation remarks on pupil focus, motor coordination, or tips for parent practice..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={teacherFeedback}
              onChangeText={setTeacherFeedback}
              className="w-full min-h-[85px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 text-sm font-quicksand-medium text-[#484A4B]"
            />
          </View>
        </View>
      )}
    </BaseModal>
  );
}

export default LogClassroomActivityModal;
