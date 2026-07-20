import { supabase } from "../lib/supabase";

// Fetch all students for a specific class
export const getClassStudents = async (classId: string) => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((student) => ({
    ...student,
    assigned_activities: student.assigned_activities || [],
  }));
};

// Add student
export const addStudent = async (classId: string, name: string) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not logged in");
  }

  const { data, error } = await supabase
    .from("students")
    .insert([
      {
        class_id: classId,
        teacher_id: user.id,
        name,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Delete student
export const deleteStudent = async (studentId: string) => {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);

  if (error) throw new Error(error.message);

  return true;
};

// Move student
export const moveStudentClass = async (
  studentId: string,
  newClassId: string
) => {
  const { data, error } = await supabase
    .from("students")
    .update({ class_id: newClassId })
    .eq("id", studentId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Fetch one student (includes avatar)
export const getStudentById = async (studentId: string) => {
    const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();

    console.log("Student Data:", data);
    console.log("Student Error:", error);

    if (error) throw new Error(error.message);

    return data;
};

// Fetch activities only
export const getStudentActivities = async (studentId: string) => {
  const { data, error } = await supabase
    .from("students")
    .select("assigned_activities")
    .eq("id", studentId)
    .single();

  if (error) throw new Error(error.message);

  return data?.assigned_activities ?? [];
};

// Update activities
export const updateStudentActivities = async (
  studentId: string,
  assignedActivities: string[]
) => {
  const { data, error } = await supabase
    .from("students")
    .update({
      assigned_activities: assignedActivities,
    })
    .eq("id", studentId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
};

// Count students
export const getStudentCount = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return 0;

  const { count, error } = await supabase
    .from("students")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("teacher_id", user.id);

  if (error) throw new Error(error.message);

  return count ?? 0;
};