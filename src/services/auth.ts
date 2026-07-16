import { supabase } from '../lib/supabase';

// Log in an existing user
export const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Register a new user [MODIFIED: Now accepts 4 arguments]
export const register = async (email: string, password: string, firstName: string, lastName: string, goals: string[]) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                goals: goals, // [ADDED] Attach the goals to the secure metadata
            }
        }
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Log out the current user
export const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
};