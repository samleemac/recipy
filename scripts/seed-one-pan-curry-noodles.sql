-- Seed: One-Pan Curry Noodles (changes needed)
-- First pass of Carleigh Bodrug’s PlantYou one-pan curry noodles.
-- Idempotent upsert by slug.

do $$
begin
  if not exists (
    select 1 from public.profiles where username = 'mackinley-kitchen'
  ) then
    raise exception 'Profile @mackinley-kitchen does not exist';
  end if;
end $$;

insert into public.recipes (
  slug,
  author_id,
  title,
  intro,
  cuisine,
  time,
  difficulty,
  base_servings,
  serving_noun,
  tags,
  photo_url,
  fact,
  macros,
  equipment,
  ingredient_groups,
  steps,
  status,
  published_at
)
select
  'one-pan-curry-noodles',
  p.id,
  'One-Pan Curry Noodles (changes needed)',
  'Ramen, broccoli, pepper, onion, edamame and cashews simmer in one pan with coconut milk and a quick curry broth. About 20 minutes, one pot — and still marked as needing changes.',
  'Fusion',
  20,
  1,
  4,
  'bowl',
  array['Vegan', 'Quick', 'Noodles', 'Comfort']::text[],
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624',
  '{"title":"Changes still needed","body":"This is a first pass of Carleigh Bodrug’s one-pan curry noodles from PlantYou, dropped in so it can be cooked and rewritten. Amounts, photo and method still need a proper pass before it is treated as finished."}'::jsonb,
  '{"calories":389,"carbs":26,"protein":13,"fat":29,"fibre":5,"sugar":9}'::jsonb,
  array[
    'Large deep pan with a lid',
    'Sharp knife',
    'Chopping board'
  ]::text[],
  '[
    {"name":"Noodles and vegetables","items":[
      {"amount":2,"unit":"packs","text":"ramen noodles, left in squares (or 170g other noodles)"},
      {"amount":1,"unit":"","text":"red pepper, sliced"},
      {"amount":1,"unit":"","text":"yellow onion, sliced"},
      {"amount":1,"unit":"cup","text":"edamame, thawed"},
      {"amount":1,"unit":"cup","text":"broccoli florets, chopped"},
      {"amount":1,"unit":"cup","text":"cashews"}
    ]},
    {"name":"Curry broth","items":[
      {"amount":1,"unit":"tsp","text":"curry powder"},
      {"amount":1,"unit":"tsp","text":"ground cumin"},
      {"amount":1,"unit":"tsp","text":"paprika"},
      {"amount":1,"unit":"cup","text":"vegetable stock"},
      {"amount":1,"unit":"cup","text":"coconut milk"},
      {"amount":1,"unit":"tbsp","text":"soy sauce"},
      {"amount":1,"unit":"tbsp","text":"maple syrup"}
    ]},
    {"name":"To finish","items":[
      {"amount":1,"unit":"small handful","text":"fresh coriander (cilantro), leaves picked"},
      {"amount":1,"unit":"","text":"lime, cut into wedges"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Slice the vegetables","time":5,"desc":"Slice the red pepper and yellow onion. Chop the broccoli into small florets so it softens in the same few minutes as the noodles.","ingredientKeys":["0-1","0-2","0-4"]},
    {"title":"Load the pan","time":2,"desc":"Put the dry ramen squares, pepper, onion, thawed edamame, broccoli, cashews, curry powder, cumin and paprika into a large deep pan. There is no need to heat the pan first — everything starts together.","ingredientGroupNames":["Noodles and vegetables"],"ingredientKeys":["1-0","1-1","1-2"]},
    {"title":"Add the curry broth","time":3,"desc":"Pour in the vegetable stock, coconut milk, soy sauce and maple syrup. Cover and bring to a gentle simmer over medium heat.","tip":"Keep the heat at a low simmer so the coconut milk does not split and the noodles have time to drink the broth.","ingredientKeys":["1-3","1-4","1-5","1-6"]},
    {"title":"Stir and finish cooking","time":5,"desc":"After 2–3 minutes, lift the lid and stir so the softening noodles break apart and the spices mix through. Cover again and simmer for another 3–5 minutes, until the noodles are tender and the vegetables have softened.","ingredientGroupNames":["Noodles and vegetables","Curry broth"]},
    {"title":"Taste and serve","time":2,"desc":"Taste and adjust the seasoning. Divide between bowls and finish with fresh coriander and a squeeze of lime. Eat straight away — the noodles keep drinking the broth as they sit.","ingredientKeys":["0-0","2-0","2-1"]}
  ]'::jsonb,
  'published',
  now()
from public.profiles p
where p.username = 'mackinley-kitchen'
on conflict (slug) do update set
  author_id         = excluded.author_id,
  title             = excluded.title,
  intro             = excluded.intro,
  cuisine           = excluded.cuisine,
  time              = excluded.time,
  difficulty        = excluded.difficulty,
  base_servings     = excluded.base_servings,
  serving_noun      = excluded.serving_noun,
  tags              = excluded.tags,
  photo_url         = excluded.photo_url,
  fact              = excluded.fact,
  macros            = excluded.macros,
  equipment         = excluded.equipment,
  ingredient_groups = excluded.ingredient_groups,
  steps             = excluded.steps,
  status            = excluded.status,
  published_at      = coalesce(public.recipes.published_at, excluded.published_at),
  updated_at        = now();
