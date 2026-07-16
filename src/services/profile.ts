import { supabase } from '../lib/supabase';

export const getUserProfile = async () => {
    // 1. Get the current logged-in user's secure ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error('User not logged in');
    }

    // 2. Fetch their matching profile from the public.profiles table
    const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, goals, university')
        .eq('id', user.id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};