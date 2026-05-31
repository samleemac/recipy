-- Assign all existing recipes to The Mackinley Kitchen account
-- User ID: 6fd3a768-1f79-4299-b866-2981c04be2db
-- Run this in Supabase SQL Editor

UPDATE public.recipes
SET author_id = '6fd3a768-1f79-4299-b866-2981c04be2db'
WHERE author_id IS NULL 
   OR author_id != '6fd3a768-1f79-4299-b866-2981c04be2db';

-- Verify the update
SELECT id, slug, title, author_id 
FROM public.recipes 
ORDER BY id;
