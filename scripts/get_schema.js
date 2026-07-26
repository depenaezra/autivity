const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://gvigzpdogneimcftgdmt.supabase.co';
const supabaseAnonKey = 'sb_publishable_2VCENx-Jd9xKhLmS38W-rQ_vRl3eLR_';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testColumn(col) {
  const { data, error } = await supabase.from('classes').select(col).limit(1);
  if (error && error.code === '42703') {
    console.log(`Column '${col}' DOES NOT exist.`);
  } else if (error) {
    console.log(`Column '${col}' exists or failed with different error:`, error.message, error.code);
  } else {
    console.log(`Column '${col}' EXISTS.`);
  }
}

async function main() {
  const columns = ['is_archived', 'is_achived', 'archived'];
  for (const col of columns) {
    await testColumn(col);
  }
}

main();
