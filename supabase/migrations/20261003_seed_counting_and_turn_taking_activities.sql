-- ============================================================================
-- Migration: Seed Counting Activities into public.activities table
-- Note: Turn-Taking (difficulty_level: 78, 79, 80) is ALREADY present in the DB.
-- Counting activities continue the 2-digit categorical numbering sequence at 81, 82, 83.
-- ============================================================================

-- 1. Standard 3-Tier Counting Activities (Matching Sequencing 75-77 and Turn-Taking 78-80)
INSERT INTO public.activities (
  id,
  title,
  category,
  sub_category,
  skill_domain,
  path,
  content_data,
  difficulty_level,
  item_count,
  is_hidden
)
VALUES
  (
    'c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c01',
    'Fruit & Veggie Counting',
    'Counting',
    'Fruit & Veggie Counting',
    ARRAY['Fine Motor Skills', 'Visual-Motor Integration', 'Number Recognition', 'Cognitive Skills']::text[],
    'activity/counting/level-1',
    '{"type": "counting", "level": 1, "target_count": 2, "instruction": "Drag the items into the basket to count them!"}'::jsonb,
    81,
    2,
    false
  ),
  (
    'c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c02',
    'Fruit & Veggie Counting',
    'Counting',
    'Fruit & Veggie Counting',
    ARRAY['Fine Motor Skills', 'Visual-Motor Integration', 'Number Recognition', 'Cognitive Skills']::text[],
    'activity/counting/level-2',
    '{"type": "counting", "level": 2, "target_count": 3, "instruction": "Drag the items into the basket to count them!"}'::jsonb,
    82,
    3,
    false
  ),
  (
    'c1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c03',
    'Fruit & Veggie Counting',
    'Counting',
    'Fruit & Veggie Counting',
    ARRAY['Fine Motor Skills', 'Visual-Motor Integration', 'Number Recognition', 'Cognitive Skills']::text[],
    'activity/counting/level-3',
    '{"type": "counting", "level": 3, "target_count": 4, "instruction": "Drag the items into the basket to count them!"}'::jsonb,
    83,
    4,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  skill_domain = EXCLUDED.skill_domain,
  path = EXCLUDED.path,
  content_data = EXCLUDED.content_data,
  difficulty_level = EXCLUDED.difficulty_level,
  item_count = EXCLUDED.item_count,
  is_hidden = EXCLUDED.is_hidden;
