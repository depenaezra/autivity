const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gvigzpdogneimcftgdmt.supabase.co';
const supabaseAnonKey = 'sb_publishable_2VCENx-Jd9xKhLmS38W-rQ_vRl3eLR_';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const email = `test_teacher_${Date.now()}@example.com`;
  const password = 'Password123';
  const firstName = 'Test';
  const lastName = 'Teacher';
  const goals = ['Cognitive', 'Motor Skills'];
  const role = 'teacher';
  const institution = 'Test University';
  const prcNumber = '1234567';

  console.log("Registering dummy teacher user:", email);
  
  const formatPostgresArray = (arr) => {
    if (!arr || arr.length === 0) return '{}';
    return `{${arr.map(x => `"${x.replace(/"/g, '\\"')}"`).join(',')}}`;
  };

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        goals: formatPostgresArray(goals),
        user_role: role,
        role: role,
        university: institution,
        prc_number: prcNumber,
      }
    }
  });

  if (signUpError) {
    console.error("Sign up error:", signUpError.message);
    return;
  }

  const userId = signUpData.user.id;
  console.log("Sign up successful! User ID:", userId);
  console.log("User Metadata:", signUpData.user.user_metadata);

  // Save the details to profiles table
  console.log("Upserting profile details...");
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      goals: goals,
      role,
      university: institution,
      prc_number: prcNumber,
      is_verified: false,
    });

  if (upsertError) {
    console.error("Upsert error:", upsertError.message);
  } else {
    console.log("Upsert successful!");
  }

  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("Fetching matching profile from profiles table...");
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError.message);
  } else {
    console.log("Fetched Profile Row:", profile);
  }

  // Clean up by signing out
  await supabase.auth.signOut();
}

main();
