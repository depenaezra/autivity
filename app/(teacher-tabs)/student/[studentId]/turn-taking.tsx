import { useLocalSearchParams } from 'expo-router';
import TurnTakingActivity from '@/activities/turn-taking';

export default function TurnTakingScreen() {
  const params = useLocalSearchParams<{
    studentId: string;
    classId?: string;
  }>();

  return (
    <TurnTakingActivity
      assignedStudentId={params.studentId}
      classId={params.classId}
    />
  );
}