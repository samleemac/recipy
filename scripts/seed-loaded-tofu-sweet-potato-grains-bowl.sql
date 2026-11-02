-- Seed: Loaded Tofu and Sweet Potato Grains Bowl (changes needed)
-- Inspired by a Monday-night bowl from @alfiecooks. Amounts are a first pass.
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
  'loaded-tofu-sweet-potato-grains-bowl',
  p.id,
  'Loaded Tofu and Sweet Potato Grains Bowl (changes needed)',
  'A loaded weeknight bowl of quinoa, roasted sweet potato, salted red cabbage and tofu seared in hot oil with salt, pepper and MSG. Toasted nuts and seeds go through the grains, then tahini and a dollop of mayonnaise go on at the end.',
  'Weeknight',
  40,
  2,
  2,
  'bowl',
  array['Vegan', 'Veg', 'Protein']::text[],
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  '{"title":"Changes still needed","body":"Inspired by a Monday-night grains bowl from @alfiecooks. The method is the one in the post: hot-oil tofu with salt, pepper and MSG, roasted sweet potato, a plain cabbage slaw, and a grain salad with toasted nuts and seeds, finished with tahini and a spoon of mayonnaise. Amounts were not given, so these are a first pass for two bowls."}'::jsonb,
  array[
    'Baking tray',
    'Large frying pan',
    'Saucepan',
    'Sieve',
    'Mixing bowl',
    'Sharp knife',
    'Chopping board'
  ]::text[],
  '[
    {"name":"Roast sweet potato","items":[
      {"amount":500,"unit":"g","text":"sweet potatoes, scrubbed and cut into bite-sized chunks"},
      {"amount":1,"unit":"tbsp","text":"olive oil"},
      {"amount":0.5,"unit":"tsp","text":"fine salt"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"}
    ]},
    {"name":"Pan-seared tofu","items":[
      {"amount":280,"unit":"g","text":"firm tofu, drained, patted dry and cut into thick slabs"},
      {"amount":1,"unit":"tbsp","text":"neutral oil, for a hot pan"},
      {"amount":0.5,"unit":"tsp","text":"fine salt"},
      {"amount":0.5,"unit":"tsp","text":"freshly ground black pepper"},
      {"amount":0.25,"unit":"tsp","text":"MSG"}
    ]},
    {"name":"Cabbage slaw","items":[
      {"amount":150,"unit":"g","text":"red cabbage, very finely shredded"},
      {"amount":1,"unit":"tsp","text":"olive oil"},
      {"amount":0.25,"unit":"tsp","text":"fine salt"}
    ]},
    {"name":"Grain salad","items":[
      {"amount":120,"unit":"g","text":"dried quinoa, rinsed"},
      {"amount":30,"unit":"g","text":"mixed nuts, roughly chopped"},
      {"amount":2,"unit":"tbsp","text":"mixed seeds, such as pumpkin and sunflower"},
      {"amount":1,"unit":"small handful","text":"soft herbs, chopped (type not specified)"}
    ]},
    {"name":"To finish","items":[
      {"amount":2,"unit":"tbsp","text":"tahini"},
      {"amount":2,"unit":"tbsp","text":"cold water, plus more if the tahini is stiff"},
      {"amount":1,"unit":"pinch","text":"fine salt"},
      {"amount":2,"unit":"tbsp","text":"mayonnaise, plant-based"},
      {"amount":1,"unit":"small handful","text":"sprouted seeds or cress (optional)"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Roast the sweet potato","time":30,"desc":"Heat the oven to 200°C (180°C fan). Toss the sweet potato with the olive oil, salt and pepper on a baking tray. Roast for about 30 minutes, turning once, until the edges are browned and the centres are soft.","tip":"Cook the quinoa, toast the nuts and make the slaw while the tray is in the oven.","ingredientKeys":["0-0","0-1","0-2","0-3"]},
    {"title":"Cook the quinoa","time":15,"desc":"Put the rinsed quinoa in a saucepan with 300ml water and a pinch of salt. Bring to the boil, then cover and simmer for 12–15 minutes, until the water is absorbed and the grains are tender. Take off the heat and leave covered for a few minutes, then fluff with a fork.","ingredientKeys":["3-0"]},
    {"title":"Toast the nuts and seeds","time":4,"desc":"Put the chopped nuts and mixed seeds in a dry frying pan over a medium heat. Shake the pan until they smell toasted and turn a shade darker, then tip them onto a plate.","tip":"They keep cooking on the plate, so take them off while they are still pale gold.","ingredientKeys":["3-1","3-2"]},
    {"title":"Make the cabbage slaw","time":4,"desc":"Put the shredded red cabbage in a bowl with the olive oil and salt. Scrunch it with your hands for a minute so the cabbage softens and turns glossy.","ingredientGroupNames":["Cabbage slaw"]},
    {"title":"Fold the grain salad","time":3,"desc":"Fold the toasted nuts, seeds and chopped herbs through the warm quinoa. Taste and add a pinch more salt if it needs it.","ingredientKeys":["3-0","3-1","3-2","3-3"]},
    {"title":"Sear the tofu","time":8,"desc":"Heat the neutral oil in a frying pan until it shimmers. Season both sides of the tofu slabs with the salt, pepper and MSG, then lay them in the hot oil. Leave them alone until the underside is deep gold and releases easily, then turn once and colour the other side.","tip":"A hot pan and dry tofu are the whole method. If you move the slabs too soon they steam instead of sear.","ingredientGroupNames":["Pan-seared tofu"]},
    {"title":"Loosen the tahini","time":2,"desc":"Stir the tahini with the cold water and a pinch of salt until it turns smooth and pours in a ribbon. Add another splash of water if it seizes.","ingredientKeys":["4-0","4-1","4-2"]},
    {"title":"Build the bowls","time":4,"desc":"Divide the grain salad between two bowls. Add the roasted sweet potato, cabbage slaw and seared tofu in separate piles. Drizzle with tahini, add a dollop of mayonnaise to each bowl, and scatter over the sprouted seeds if you are using them.","ingredientKeys":["0-0","1-0","2-0","3-0","3-1","3-2","3-3","4-0","4-3","4-4"]}
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
