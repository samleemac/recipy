-- Seed profile for The Mackinley Kitchen (system kitchen account)
-- User ID: 6fd3a768-1f79-4299-b866-2981c04be2db
-- Run this in Supabase SQL Editor

INSERT INTO public.profiles (id, username, display_name, bio, role)
VALUES (
  '6fd3a768-1f79-4299-b866-2981c04be2db',
  'mackinleykitchen',
  'The Mackinley Kitchen',
  'Sam & Sara cook together in their tiny home kitchen, testing recipes until the neighbors complain about the smell. Equal parts comfort and curiosity.',
  'user'
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio;
