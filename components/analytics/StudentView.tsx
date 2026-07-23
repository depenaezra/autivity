import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ClassInfo, MasterDomain, Milestone, SessionRecord, StudentInfo } from '../../app/(tabs)/analytics';

interface StudentViewProps {
  currentStudent: StudentInfo | null | undefined;
  studentSessions: SessionRecord[];
  studentMilestones: Milestone[];
  currentClass: ClassInfo;
  isTablet: boolean;
  masterDomains: MasterDomain[];
  onBack: () => void;
  onAddMilestone: () => void;
  onToggleMilestone: (milestoneId: string, currentStatus: string) => Promise<void> | void;
  onDeleteMilestone: (milestoneId: string) => Promise<void> | void;
  onValidateSession: (session: SessionRecord, classId: string) => void;
}

export default function StudentView({
  currentStudent,
  studentSessions,
  studentMilestones,
  currentClass,
  isTablet,
  masterDomains,
  onBack,
  onAddMilestone,
  onToggleMilestone,
  onDeleteMilestone,
  onValidateSession,
}: StudentViewProps) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<'all' | 'unvalidated' | 'validated'>('all');

  if (!currentStudent) return null;

  const filteredSessions = studentSessions.filter((session) => {
    if (sessionFilter === 'unvalidated') return session.status === 'pending';
    if (sessionFilter === 'validated') return session.status === 'validated';
    return true;
  });

  // calculates progress for each main domain based on completed sessions
  const dynamicSkillsProgress = masterDomains.map((domain) => {
    // find completed sessions with matching subskill in the main domain
    const relevantSessions = studentSessions.filter(
      (s) =>
        (s.status === 'validated' || s.status === 'pending') &&
        Array.isArray(s.skill_domain) &&
        s.skill_domain.some((tag) =>
          domain.subSkills.some((sub) => sub.trim().toLowerCase() === tag.trim().toLowerCase())
        )
    );

    let progress = 0;
    if (relevantSessions.length > 0) {
      const scores = relevantSessions.map((s) => parseInt(s.score.replace('%', '')) || 0);
      progress = Math.round(scores.reduce((a, b) => a + b, 0) / relevantSessions.length);
    }

    return {
      ...domain,
      sessionCount: relevantSessions.length,
      progress,
      relevantSessions,
    };
  });

  const dynamicSkills = dynamicSkillsProgress;

  return (
    <View className="w-full">
      {/* back btn */}
      <View className={isTablet ? 'px-12 mt-4' : 'px-6 mt-3'}>
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center bg-[#EBF5FF] self-start px-4 py-2 rounded-full border border-[#A3CFF1] mb-4"
        >
          <Feather name="arrow-left" size={isTablet ? 18 : 16} color="#62A9E6" />
          <Text className={`font-quicksand-bold text-[#62A9E6] ml-1.5 ${isTablet ? 'text-base' : 'text-xs'}`}>
            Back to {currentClass.name}
          </Text>
        </TouchableOpacity>

        {/* student header card */}
        <View className="bg-white p-5 rounded-2xl border-[2px] border-[#A3CFF1] shadow-sm mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-16 h-16 rounded-full bg-[#EBF5FF] items-center justify-center border-[2px] border-[#62A9E6]">
                <Feather name="user" size={isTablet ? 36 : 30} color="#62A9E6" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-2xl'}`}>
                    {currentStudent.name}
                  </Text>
                  {currentStudent.pendingCount > 0 && (
                    <View className="bg-[#F87171] px-2.5 py-0.5 rounded-full">
                      <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                        {currentStudent.pendingCount} Pending Reviews
                      </Text>
                    </View>
                  )}
                </View>
                <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-sm'}`}>
                  Class: {currentClass.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: currentStudent.statusColor }} />
                  <Text className={`font-quicksand-bold text-[#4B5563] uppercase ${isTablet ? 'text-sm' : 'text-xs'}`}>
                    {currentStudent.behavior}
                  </Text>
                </View>
              </View>
            </View>

            <View className="items-end ml-2">
              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-4xl' : 'text-3xl'}`}>
                {currentStudent.overallProgress}%
              </Text>
              <Text className={`font-quicksand-semibold text-[#9CA3AF] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                DEVELOPMENT INDEX
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* skill development reports */}
      <View className={isTablet ? 'px-12 mb-6' : 'px-6 mb-6'}>
        <Text className={`font-fredoka-one text-[#4B5563] mb-1 ${isTablet ? 'text-2xl' : 'text-lg'}`}>
          Skill Development Reports
        </Text>
        <Text className={`font-quicksand-medium text-[#6B7280] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
          Progress calculated automatically from validated game sessions.
        </Text>

        <View className="bg-white rounded-2xl border border-[#E5E7EB] p-5 gap-5 shadow-sm">
          {dynamicSkills.map((skill, idx) => {
            const isExpanded = expandedDomain === skill.name;
            return (
              <View key={idx} className="w-full">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setExpandedDomain(isExpanded ? null : skill.name)}
                  className="w-full"
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                      {skill.name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                        {skill.progress}%
                      </Text>
                      <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={isTablet ? 18 : 16} color="#6B7280" />
                    </View>
                  </View>
                  <Text className={`font-quicksand-medium text-[#9CA3AF] mb-2 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                    {skill.description}
                  </Text>
                  <View className="w-full h-2.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <View className="h-full rounded-full" style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View
                    className="mt-3 ml-2 pl-3.5 py-3 pr-3 rounded-r-xl border-l-[4px] gap-3 bg-[#F8FAFC]"
                    style={{ borderColor: skill.color }}
                  >
                    {skill.subSkills.map((subskill, subIdx) => {
                      const subSessions = (skill.relevantSessions || []).filter(
                        (s) =>
                          Array.isArray(s.skill_domain) &&
                          (s.skill_domain.includes(subskill) ||
                            s.skill_domain.some((tag) => tag.trim().toLowerCase() === subskill.trim().toLowerCase()))
                      );
                      const sessionCount = subSessions.length;
                      let subTotalScore = 0;
                      if (sessionCount > 0) {
                        const scores = subSessions.map((s) => parseInt(s.score.replace('%', '')) || 0);
                        subTotalScore = scores.reduce((a, b) => a + b, 0);
                      }
                      const subMasteryPercentage = sessionCount > 0 ? Math.round(subTotalScore / sessionCount) : 0;

                      return (
                        <View key={subIdx} className="w-full">
                          <View className="flex-row justify-between items-center mb-1">
                            <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                              {subskill}
                            </Text>
                            <View className="flex-row items-center gap-1.5">
                              <Text className={`font-quicksand-medium text-[#9CA3AF] ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                                ({sessionCount} {sessionCount === 1 ? 'session' : 'sessions'})
                              </Text>
                              <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                                {subMasteryPercentage}%
                              </Text>
                            </View>
                          </View>
                          <View className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <View
                              className="h-full rounded-full"
                              style={{ width: `${subMasteryPercentage}%`, backgroundColor: skill.color }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* development tracking + milestones */}
      <View className={isTablet ? 'px-12 mb-6' : 'px-6 mb-6'}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
            Milestone Tracking
          </Text>

          <TouchableOpacity onPress={onAddMilestone} className="flex-row items-center gap-1">
            <Text className={`font-quicksand-medium text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
              Add Milestone
            </Text>
            <Feather name="plus-circle" size={20} color="#62A9E6" />
          </TouchableOpacity>
        </View>

        {studentMilestones.length === 0 ? (
          <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
            <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
              No milestones set for this learner yet.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {studentMilestones.map((milestone) => (
              <View
                key={milestone.id}
                className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex-row items-start justify-between shadow-sm"
              >
                <View className="flex-row items-start gap-3 flex-1 mr-2">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center mt-0.5 ${
                      milestone.status === 'Achieved'
                        ? 'bg-[#DCFCE7]'
                        : milestone.status === 'In Progress'
                        ? 'bg-[#FEF9C3]'
                        : 'bg-[#F3F4F6]'
                    }`}
                  >
                    <Ionicons
                      name={milestone.status === 'Achieved' ? 'checkmark' : milestone.status === 'In Progress' ? 'refresh' : 'flag-outline'}
                      size={isTablet ? 16 : 14}
                      color={milestone.status === 'Achieved' ? '#16A34A' : milestone.status === 'In Progress' ? '#CA8A04' : '#6B7280'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-base' : 'text-sm'}`}>
                      {milestone.title}
                    </Text>
                    <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                      {milestone.date}
                    </Text>
                  </View>
                </View>

                {/* milestone status button + delete button */}
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onToggleMilestone(milestone.id, milestone.status)}
                    className={`px-3 py-1.5 rounded-full ${
                      milestone.status === 'Achieved'
                        ? 'bg-[#DCFCE7]'
                        : milestone.status === 'In Progress'
                        ? 'bg-[#FEF9C3]'
                        : 'bg-[#F3F4F6]'
                    }`}
                  >
                    <Text
                      className={`font-quicksand-bold uppercase ${isTablet ? 'text-xs' : 'text-[10px]'} ${
                        milestone.status === 'Achieved'
                          ? 'text-[#16A34A]'
                          : milestone.status === 'In Progress'
                          ? 'text-[#CA8A04]'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      {milestone.status}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onDeleteMilestone(milestone.id)}
                    className="p-1.5 rounded-full bg-[#FEF2F2] border border-[#FEE2E2]"
                  >
                    <Feather name="trash-2" size={isTablet ? 16 : 14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* session records linked with progress validation */}
      <View className={isTablet ? 'px-12 mb-4' : 'px-6 mb-4'}>
        <View className="flex-row justify-between items-center mb-2 flex-wrap gap-2">
          <View>
            <Text className={`font-fredoka-one text-[#4B5563] ${isTablet ? 'text-2xl' : 'text-lg'}`}>
              Completed Sessions
            </Text>
            <Text className={`font-quicksand-medium text-[#6B7280] ${isTablet ? 'text-base' : 'text-xs'}`}>
              {filteredSessions.length} of {studentSessions.length} Records
            </Text>
          </View>

          {/* Filter Pills */}
          <View className="flex-row bg-[#E5E7EB] p-1 rounded-full">
            {(['all', 'unvalidated', 'validated'] as const).map((filterOption) => {
              const isActive = sessionFilter === filterOption;
              const count =
                filterOption === 'all'
                  ? studentSessions.length
                  : filterOption === 'unvalidated'
                  ? studentSessions.filter((s) => s.status === 'pending').length
                  : studentSessions.filter((s) => s.status === 'validated').length;

              return (
                <TouchableOpacity
                  key={filterOption}
                  activeOpacity={0.7}
                  onPress={() => setSessionFilter(filterOption)}
                  className={`px-3 py-1 rounded-full flex-row items-center gap-1.5 ${
                    isActive ? 'bg-[#62A9E6]' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`font-quicksand-bold capitalize ${
                      isActive ? 'text-white' : 'text-[#6B7280]'
                    } ${isTablet ? 'text-sm' : 'text-xs'}`}
                  >
                    {filterOption === 'unvalidated' ? 'Unvalidated' : filterOption === 'validated' ? 'Validated' : 'All'}
                  </Text>
                  <View
                    className={`px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/30' : 'bg-[#D1D5DB]'
                    }`}
                  >
                    <Text
                      className={`font-quicksand-bold text-[10px] ${
                        isActive ? 'text-white' : 'text-[#4B5563]'
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <Text className={`font-quicksand-medium text-[#EA580C] mb-3 ${isTablet ? 'text-base' : 'text-sm'}`}>
          Validate pending sessions below to publish updates directly to the Parent Portal.
        </Text>

        <View className="gap-3">
          {filteredSessions.map((session) => (
            <View
              key={session.id}
              className={`bg-white rounded-2xl border-[1.5px] p-4 shadow-sm ${
                session.status === 'pending' ? 'border-[#FDBA74] bg-[#FFFBF5]' : 'border-[#E5E7EB]'
              }`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className={`font-quicksand-bold text-[#4B5563] ${isTablet ? 'text-lg' : 'text-base'}`}>
                      Session: {session.activityName}
                    </Text>
                  </View>
                  <Text className={`font-quicksand-semibold text-[#6B7280] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                    Category: {session.category} • Duration: {session.duration}
                  </Text>
                  <Text className={`font-quicksand-medium text-[#9CA3AF] mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}>
                    {session.date}
                  </Text>
                </View>

                <View className="items-end">
                  <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-xl' : 'text-lg'}`}>
                    {session.score}
                  </Text>
                  <Text className={`font-quicksand-medium text-[#9CA3AF] uppercase ${isTablet ? 'text-xs' : 'text-[10px]'}`}>
                    Session Score
                  </Text>
                </View>
              </View>

              {/* validation status */}
              <View className="border-t border-[#F3F4F6] pt-3 mt-1 flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <View className={`w-2 h-2 rounded-full ${session.status === 'validated' ? 'bg-[#10B981]' : 'bg-[#EA580C]'}`} />
                  <Text
                    className={`font-quicksand-bold uppercase ${
                      session.status === 'validated' ? 'text-[#10B981]' : 'text-[#EA580C]'
                    } ${isTablet ? 'text-sm' : 'text-xs'}`}
                  >
                    {session.status === 'validated' ? 'Validated & Synced' : 'Pending Teacher Review'}
                  </Text>
                </View>

                {session.status === 'pending' ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onValidateSession(session, currentClass.id)}
                    className="bg-[#EA580C] px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
                  >
                    <Feather name="check" size={13} color="white" />
                    <Text className={`font-quicksand-bold text-white ${isTablet ? 'text-sm' : 'text-xs'}`}>
                      Validate Progress
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <View className="bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#D1FAE5]">
                      <Text className={`font-quicksand-semibold text-[#047857] ${isTablet ? 'text-xs' : 'text-[11px]'}`}>
                        Visible to Parent
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => onValidateSession(session, currentClass.id)}
                      className="bg-[#EBF5FF] border border-[#A3CFF1] px-3 py-1 rounded-full flex-row items-center gap-1 shadow-sm"
                    >
                      <Feather name="eye" size={13} color="#62A9E6" />
                      <Text className={`font-quicksand-bold text-[#62A9E6] ${isTablet ? 'text-sm' : 'text-xs'}`}>
                        View Feedback
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}

          {filteredSessions.length === 0 && (
            <View className="bg-white p-6 rounded-xl border border-[#E5E7EB] items-center justify-center">
              <Text className="font-quicksand-medium text-sm text-[#9CA3AF]">
                {sessionFilter === 'unvalidated'
                  ? 'No unvalidated sessions for this learner.'
                  : sessionFilter === 'validated'
                  ? 'No validated sessions for this learner.'
                  : 'No recorded sessions for this learner yet.'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
