-- Add 5 domain & content mastery achievements for adaptive learning completion
INSERT INTO public.achievements (id, title, description, icon, color, bg_color, border_color)
VALUES
  ('shape_specialist', 'Shape Specialist', 'Mastered tracing all 4 basic geometric shapes!', 'shapes', '#8B5CF6', '#F5F3FF', '#DDD6FE'),
  ('alphabet_adventurer', 'Alphabet Adventurer', 'Successfully traced 10 letters of the alphabet!', 'text', '#3B82F6', '#EFF6FF', '#93C5FD'),
  ('tracing_trailblazer', 'Tracing Trailblazer', 'Completed 5 fine-motor tracing sessions!', 'brush', '#EC4899', '#FDF2F8', '#FBCFE8'),
  ('puzzle_prodigy', 'Puzzle Prodigy', 'Solved 5 cognitive matching and logic puzzles!', 'extension-puzzle', '#F59E0B', '#FFFBEB', '#FDE68A'),
  ('bubble_champion', 'Bubble Champion', 'Popped your way through 5 visual-motor bubble activities!', 'disc', '#06B6D4', '#ECFEFF', '#A5F3FC')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  bg_color = EXCLUDED.bg_color,
  border_color = EXCLUDED.border_color;
