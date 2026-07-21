import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/src/legacy/index';

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

// Fetch all activities that belong to the assigned subcategories
// subcategories = ['lines', 'Matching Fruits', etc.] — matches sub_category column in DB
export const getActivitiesBySubcategories = async (subcategories: string[]) => {
    if (!subcategories || subcategories.length === 0) return [];

    const expandedSubcategories = new Set<string>();
    subcategories.forEach((s) => {
        const lower = s.toLowerCase();
        if (lower.includes('color') || lower.includes('red') || lower.includes('blue') || lower.includes('green')) {
            expandedSubcategories.add('Color Pop');
            return;
        }
        if (lower.includes('free')) {
            expandedSubcategories.add('Free Pop');
            return;
        }
        if (lower.includes('fruit') || lower.includes('matching') || lower.includes('drag')) {
            expandedSubcategories.add('Matching Fruits');
            expandedSubcategories.add('Drag-Drop');
            return;
        }
        expandedSubcategories.add(s);
    });

    const orFilter = Array.from(expandedSubcategories)
        .map((s) => `sub_category.eq."${s}",path.eq."${s}",category.eq."${s}"`)
        .join(",");

    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .or(orFilter);

    if (error) {
        console.error('Error fetching activities by subcategory:', error);
        return [];
    }
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

// Helper to decode base64 string to ArrayBuffer in React Native
const decodeBase64 = (base64: string): ArrayBuffer => {
    const cleanBase64 = base64.replace(/\s/g, '');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) {
        lookup[chars.charCodeAt(i)] = i;
    }

    let bufferLength = cleanBase64.length * 0.75;
    if (cleanBase64.endsWith('==')) {
        bufferLength -= 2;
    } else if (cleanBase64.endsWith('=')) {
        bufferLength -= 1;
    }

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const bytes = new Uint8Array(arrayBuffer);

    let p = 0;
    for (let i = 0; i < cleanBase64.length; i += 4) {
        const encoded1 = lookup[cleanBase64.charCodeAt(i)];
        const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)];
        const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)];
        const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        if (p < bufferLength) {
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        }
        if (p < bufferLength) {
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
    }

    return arrayBuffer;
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

    // 1. Read the local file as base64 string
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Convert base64 to ArrayBuffer
    const arrayBuffer = decodeBase64(base64);

    // 3. Create a unique file path so files with the same name don't overwrite each other
    const uniqueFilePath = `${user.id}/${Date.now()}_${fileName}`;

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(uniqueFilePath, arrayBuffer, {
            contentType: mimeType,
            upsert: true,
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