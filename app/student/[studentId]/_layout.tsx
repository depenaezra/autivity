import { Stack } from 'expo-router';

export default function StudentIdLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* This automatically pulls in the (student-tabs) folder */}
            <Stack.Screen name="(student-tabs)" />
            <Stack.Screen 
                name="lesson" 
                options={{ 
                    animation: 'slide_from_bottom',
                    presentation: 'card'
                }} 
            />
        </Stack>
    );
}