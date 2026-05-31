-- Fix missing photo for Tempeh Teriyaki Rice Bowl
-- Run this in Supabase SQL Editor

UPDATE public.recipes
SET photo_url = 'https://images.unsplash.com/photo-1546069901-ba9599a0e63c'
WHERE slug = 'tempeh-teriyaki-rice-bowl'
  AND (photo_url IS NULL OR photo_url = '');

-- Verify the update
SELECT slug, title, photo_url 
FROM public.recipes 
WHERE slug = 'tempeh-teriyaki-rice-bowl';
