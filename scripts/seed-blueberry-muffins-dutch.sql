-- ============================================================
-- Recipy — Limited Edition: Dutch Blueberry Muffins
--
-- 1. Marks the English Blueberry Muffins as a limited edition and
--    assigns it a variant_group.
-- 2. Inserts a published Dutch language variant (is_primary=false) that
--    shares the same variant_group, so it stays hidden from listings but
--    is reachable from the recipe page's language toggle.
--
-- Run AFTER limited-edition-migration.sql, in the Supabase SQL editor.
-- Idempotent: re-running updates the existing rows.
-- ============================================================

-- 1. Promote the English original to a limited edition + variant group.
update public.recipes
set is_limited_edition = true,
    variant_group      = 'berried-treasure-blueberry-muffins',
    language           = 'en',
    is_primary         = true
where slug = 'berried-treasure-blueberry-muffins';

-- 2. Insert / refresh the Dutch variant. author_id is copied from the
--    English row so the byline matches.
insert into public.recipes (
  slug, author_id, title, intro, cuisine, time, difficulty,
  base_servings, serving_noun, tags, photo_url, fact, macros, equipment,
  ingredient_groups, steps, status, published_at,
  language, is_limited_edition, variant_group, is_primary
)
select
  'berried-treasure-blueberry-muffins-nl',
  en.author_id,
  'Verborgen Schat - Bosbessenmuffins',
  'Zachte, met gember gekruide muffins boordevol jammy bosbessen. Vegan, lactosevrij en klaar in een half uur - en Sara''s geheim is de kaneel-gembersuiker die je er warm overheen strooit.',
  'Brits',
  30,
  1,
  9,
  'muffin',
  array['Ontbijt','Vegan','Licht'],
  en.photo_url,
  '{"title":"Wist je dat?","body":"Bosbessen bevatten een van de hoogste concentraties antioxidanten van al het fruit, wat helpt cellen te beschermen tegen schade en het verval van het geheugen vertraagt. Je lichaam wordt niet somber van bosbessen."}'::jsonb,
  '{"calories":152,"carbs":23,"protein":2.2,"fat":5.5,"fibre":0.5,"sugar":7.6}'::jsonb,
  array['Muffinvorm voor 9 stuks','Papieren vormpjes','Mengkommen','Garde','Spatel'],
  '[
    {
      "name": "Muffinbeslag",
      "items": [
        { "amount": 180, "unit": "g",  "text": "bloem" },
        { "amount": 50,  "unit": "g",  "text": "fijne kristalsuiker" },
        { "amount": 0.5, "unit": "tl", "text": "fijn zout" },
        { "amount": 2,   "unit": "tl", "text": "bakpoeder" },
        { "amount": 1,   "unit": "tl", "text": "gemberpoeder" },
        { "amount": 1,   "unit": "tl", "text": "kaneelpoeder" },
        { "amount": 195, "unit": "ml", "text": "amandelmelk" },
        { "amount": 50,  "unit": "ml", "text": "olijfolie" },
        { "amount": 1,   "unit": "el", "text": "citroensap" },
        { "amount": 2,   "unit": "tl", "text": "vanille-extract" },
        { "amount": 120, "unit": "g",  "text": "diepvriesbosbessen" }
      ]
    },
    {
      "name": "Sara''s kruidensuiker (optioneel)",
      "items": [
        { "amount": 1,   "unit": "tl", "text": "fijne kristalsuiker" },
        { "amount": 0.5, "unit": "tl", "text": "gemberpoeder" },
        { "amount": 0.5, "unit": "tl", "text": "kaneelpoeder" }
      ]
    }
  ]'::jsonb,
  '[
    {
      "title": "Verwarm voor & klop de droge ingredienten",
      "time": 5,
      "desc": "Verwarm de oven voor op 200C en bekleed een muffinvorm voor 9 stuks. Klop in een grote kom de bloem, suiker, zout, bakpoeder, gember en kaneel door elkaar tot alles gelijkmatig gemengd is."
    },
    {
      "title": "Meng de natte ingredienten",
      "time": 5,
      "desc": "Klop in een andere kom de amandelmelk, olijfolie, citroensap en vanille. Giet dit bij de droge kom en spatel alles voorzichtig door elkaar - stop zodra het net samenkomt.",
      "tip": "Het citroensap + amandelmelk werkt als een vegan karnemelk - dat geeft de muffins hun rijzing."
    },
    {
      "title": "Spatel de bosbessen erdoor",
      "time": 2,
      "desc": "Voeg de diepvriesbosbessen rechtstreeks aan het beslag toe (ontdooien hoeft niet) en spatel ze er 2-3 keer doorheen. Paarse strepen zijn juist goed - dan heb je ze niet geplet."
    },
    {
      "title": "Bak tot ze gerezen zijn",
      "time": 15,
      "desc": "Schep het beslag helemaal tot bovenaan in de muffinvormpjes. Bak ongeveer 15 minuten of tot de bovenkanten lichtgoud zijn en een sateprikker in het midden er schoon uitkomt (een streepje bosbes mag - alleen geen beslag).",
      "ingredientKeys": ["0-0","0-1","0-2","0-3","0-4","0-5","0-6","0-7","0-8","0-9","0-10"]
    },
    {
      "title": "Sara''s kruidensuiker (optioneel)",
      "time": 3,
      "desc": "Meng de suiker, gember en kaneel voor de topping. Strooi dit royaal over de muffins terwijl ze nog warm zijn zodat het aan de bovenkant blijft plakken.",
      "ingredientKeys": ["1-0","1-1","1-2"]
    }
  ]'::jsonb,
  'published',
  now(),
  'nl',
  true,
  'berried-treasure-blueberry-muffins',
  false
from public.recipes en
where en.slug = 'berried-treasure-blueberry-muffins'
on conflict (slug) do update set
  title              = excluded.title,
  intro              = excluded.intro,
  cuisine            = excluded.cuisine,
  tags               = excluded.tags,
  fact               = excluded.fact,
  macros             = excluded.macros,
  equipment          = excluded.equipment,
  ingredient_groups  = excluded.ingredient_groups,
  steps              = excluded.steps,
  photo_url          = excluded.photo_url,
  status             = excluded.status,
  language           = excluded.language,
  is_limited_edition = excluded.is_limited_edition,
  variant_group      = excluded.variant_group,
  is_primary         = excluded.is_primary;

-- Verify:
-- select slug, language, is_primary, is_limited_edition, variant_group
-- from public.recipes where variant_group = 'berried-treasure-blueberry-muffins';
