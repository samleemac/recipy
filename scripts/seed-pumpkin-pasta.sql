-- Seed: Pumpkin Pasta (changes needed)
-- First pass of a caption from @bradtheboxer. Several amounts were not given.
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
  equipment,
  ingredient_groups,
  steps,
  status,
  published_at
)
select
  'pumpkin-pasta',
  p.id,
  'Pumpkin Pasta (changes needed)',
  'Roasted pie pumpkin blended with hemp seeds and soy milk, tossed with pasta and mushrooms that have been cooked until they squeak, then finished with sage, ginger and sherry. Several amounts are still missing.',
  'Italian-inspired',
  40,
  2,
  4,
  'serving',
  array['Vegan', 'Pasta', 'Comfort']::text[],
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
  '{"title":"Changes still needed","body":"First pass of a pumpkin pasta caption from @bradtheboxer. The post gave the hemp seeds, soy milk, roast time and a splash of sherry, but not the mushroom, sage, garlic, ginger or pasta amounts, or how many it serves. Nutrition was not included. Treat the blanks as still to be filled in."}'::jsonb,
  array[
    'Baking tray',
    'Large frying pan',
    'Blender',
    'Large saucepan',
    'Colander',
    'Sharp knife',
    'Chopping board'
  ]::text[],
  '[
    {"name":"Roast pumpkin","items":[
      {"amount":1,"unit":"","text":"pie pumpkin, halved and deseeded"},
      {"amount":1,"unit":"drizzle","text":"olive oil, for the cut surfaces (amount not given)"},
      {"amount":1,"unit":"pinch","text":"fine salt, for the pumpkin"},
      {"amount":0.25,"unit":"cup","text":"hemp seeds"},
      {"amount":1.5,"unit":"cups","text":"soy milk"}
    ]},
    {"name":"Mushrooms","items":[
      {"amount":1,"unit":"","text":"batch of mushrooms (weight not given)"},
      {"amount":3,"unit":"tbsp","text":"plant-based butter (a few tablespoons)"},
      {"amount":1,"unit":"","text":"onion, diced"},
      {"amount":1,"unit":"pinch","text":"fine salt"},
      {"amount":1,"unit":"small handful","text":"fresh sage (amount not given)"},
      {"amount":1,"unit":"","text":"garlic, minced (amount not given)"},
      {"amount":1,"unit":"","text":"piece of fresh ginger, grated (amount not given)"},
      {"amount":1,"unit":"splash","text":"sherry"}
    ]},
    {"name":"Pasta","items":[
      {"amount":1,"unit":"","text":"dried pasta (amount not given)"},
      {"amount":2,"unit":"ladles","text":"starchy pasta water"}
    ]},
    {"name":"To finish","items":[
      {"amount":1,"unit":"small handful","text":"fresh parsley, chopped"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Roast the pumpkin","time":25,"desc":"Heat the oven to 200°C (180°C fan / 400°F). Cut the pie pumpkin in half, scrape out the seeds, then rub the cut faces with olive oil and salt. Roast cut side up for 25 minutes, until the flesh is soft enough to scoop.","tip":"Start the pasta and the mushrooms while the pumpkin is in the oven so the sauce is ready when the roast comes out.","ingredientKeys":["0-0","0-1","0-2"]},
    {"title":"Cook the pasta","time":12,"desc":"Bring a large saucepan of well-salted water to the boil and cook the pasta until just al dente. Before draining, scoop out a couple of ladles of the cooking water.","ingredientKeys":["2-0","2-1"]},
    {"title":"Dry-fry the mushrooms","time":6,"desc":"Put the mushrooms in a dry frying pan over a high heat. Cook, stirring now and then, until they stop releasing water and start to squeak against the pan.","ingredientKeys":["1-0"]},
    {"title":"Add butter, onion and sherry","time":5,"desc":"Turn the heat down and add the plant-based butter, diced onion and a pinch of salt. After a minute or two, add the sage, minced garlic and grated ginger and cook for another minute. Splash in the sherry and let it bubble until the alcohol has cooked off, then take the pan off the heat.","ingredientKeys":["1-1","1-2","1-3","1-4","1-5","1-6","1-7"]},
    {"title":"Blend the pumpkin sauce","time":4,"desc":"Scoop the roasted pumpkin out of its skin. Blend the flesh with the hemp seeds and soy milk until smooth.","ingredientKeys":["0-0","0-3","0-4"]},
    {"title":"Toss and serve","time":3,"desc":"Combine the pumpkin sauce with the mushrooms, cooked pasta and a ladle or two of pasta water until the noodles are coated. Scatter over the parsley and serve straight away.","ingredientKeys":["0-0","1-0","2-0","2-1","3-0"]}
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
  equipment         = excluded.equipment,
  ingredient_groups = excluded.ingredient_groups,
  steps             = excluded.steps,
  status            = excluded.status,
  published_at      = coalesce(public.recipes.published_at, excluded.published_at),
  updated_at        = now();
