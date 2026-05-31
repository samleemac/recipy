-- Fix ALL recipe photos from the original recipes-data.js
-- Run this in Supabase SQL Editor

-- First, check current state
SELECT slug, title, photo_url 
FROM public.recipes 
ORDER BY slug;

-- Update all recipe photos to match recipes-data.js
-- (Run each UPDATE separately or all at once)

UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d' WHERE slug = 'apple-cinnamon-muffins';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b' WHERE slug = 'bean-mushroom-tacos';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1606101204487-67c51b36ad53' WHERE slug = 'blueberry-oat-muffins';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe' WHERE slug = 'cauliflower-tikka-masala';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686' WHERE slug = 'cheesy-cauliflower-pasta-bake';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1519676867240-f03562e64548' WHERE slug = 'saras-easy-crepes';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1546793665-c74683f339c1' WHERE slug = 'crispy-cauliflower-bean-stew';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1546069901-ba9599a0e63c' WHERE slug = 'crispy-halloumi-salad';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' WHERE slug = 'harissa-lentils-with-halloumi';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a' WHERE slug = 'honey-roasted-root-veg';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061' WHERE slug = 'kimchi-fried-rice';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d' WHERE slug = 'lemon-herb-orzo-salad';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' WHERE slug = 'mediterranean-grain-bowl';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af' WHERE slug = 'miso-glazed-aubergine';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1528207776546-365bb710ee93' WHERE slug = 'oat-banana-pancakes';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe' WHERE slug = 'one-pan-gnocchi';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352' WHERE slug = 'peanut-noodle-stir-fry';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' WHERE slug = 'simple-margherita-pizza';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8' WHERE slug = 'spiced-carrot-soup';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd' WHERE slug = 'thai-green-curry';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe' WHERE slug = 'halloumi-potato-dal';
UPDATE public.recipes SET photo_url = 'https://images.unsplash.com/photo-1546069901-ba9599a0e63c' WHERE slug = 'tempeh-teriyaki-rice-bowl';

-- Verify the updates
SELECT slug, title, 
       CASE WHEN photo_url IS NULL OR photo_url = '' THEN 'MISSING' ELSE 'OK' END as photo_status
FROM public.recipes 
ORDER BY photo_status DESC, slug;
