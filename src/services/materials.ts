import { supabase } from '../lib/supabase';

// Fetch all materials for the logged-in teacher
export const getMaterials = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    const { data, error } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false }); // Newest first

    if (error) throw new Error(error.message);
    return data;
};

// Fetch specific activities matching the given path strings from Supabase activities table
export const getActivitiesByPaths = async (paths: string[]) => {
    if (!paths || paths.length === 0) return [];
    // Ensure we match regardless of optional activity/tracing prefix
    const expandedPaths = Array.from(new Set([
        ...paths,
        ...paths.map(p => p.startsWith('activity/tracing/') ? p.replace(/^activity\/tracing\//, '') : `activity/tracing/${p}`)
    ]));

    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .in('path', expandedPaths);

    if (error) throw new Error(error.message);
    return data || [];
};

// Fetch default/random activities directly from Supabase activities table when no assigned paths exist
export const getDefaultActivities = async (limit: number = 5) => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
};

// Upload file to Storage AND save metadata to Database
export const uploadMaterial = async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    metadata: { title: string; type: string; category: string; size: string; description: string; assignedClasses: string }
) => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('User not logged in');

    // 1. Convert the local file URI to a Blob (Binary Large Object) for uploading
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // 2. Create a unique file path so files with the same name don't overwrite each other
    const uniqueFilePath = `${user.id}/${Date.now()}_${fileName}`;

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(uniqueFilePath, blob, {
            contentType: mimeType,
        });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    // 4. Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
        .from('materials')
        .getPublicUrl(uniqueFilePath);

    // 5. Save all the details into our database table
    const { data, error: dbError } = await supabase
        .from('lesson_materials')
        .insert([{
            teacher_id: user.id,
            title: metadata.title,
            type: metadata.type,
            category: metadata.category,
            size: metadata.size,
            description: metadata.description,
            assigned_classes: metadata.assignedClasses,
            file_url: publicUrlData.publicUrl,
            file_path: uniqueFilePath,
        }])
        .select()
        .single();

    if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);
    return data;
};

// Delete material from Database AND Storage
export const deleteMaterial = async (id: string, filePath: string) => {
    // 1. Delete the physical file from the bucket
    await supabase.storage.from('materials').remove([filePath]);

    // 2. Delete the row from the database
    const { error } = await supabase.from('lesson_materials').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

export const getMaterialCount = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return 0;

    const { count, error } = await supabase
        .from('lesson_materials')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);
    if (error) throw new Error(error.message);
    return count || 0;
};