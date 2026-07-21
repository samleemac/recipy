-- Seed: Miso Watermelon Poke Bowls (idempotent upsert by slug)
-- Adapted with attribution from Liz Douglas / Glow Diaries:
-- https://glow-diaries.com/watermelon-poke-bowl/
-- Run in Supabase -> SQL Editor if npm run migrate is unavailable.

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
  'miso-watermelon-poke-bowls',
  p.id,
  'Miso Watermelon Poke Bowls',
  'Juicy watermelon turns savoury and almost meaty after a miso–sesame marinade and a spell in a hot pan. Pile it over warm rice with edamame, crisp vegetables, avocado, pickled ginger and spicy sesame mayo.',
  'Hawaiian-inspired',
  90,
  2,
  4,
  'bowl',
  array['Vegan', 'Veg', 'Light', 'Meal Prep']::text[],
  'https://images.unsplash.com/photo-1719317007092-7b2931aa36b1',
  '{"title":"The secret is a dry pan","body":"Watermelon is not nutritionally equivalent to fish, but its porous flesh readily absorbs a soy–miso marinade. Cooking until every drop of released liquid has evaporated concentrates the savoury flavour and gives the cubes a firmer bite. Adapted from Liz Douglas’s Watermelon Poke Bowl at Glow Diaries."}'::jsonb,
  '{"calories":615,"carbs":74,"protein":12,"fat":31,"fibre":10,"sugar":13}'::jsonb,
  array[
    'Large mixing bowl',
    'Whisk',
    'Colander or sieve',
    'Large non-stick frying pan',
    'Saucepan',
    'Small bowl',
    'Sharp knife',
    'Bowl of iced water'
  ]::text[],
  '[
    {"name":"Miso-marinated watermelon","items":[
      {"amount":600,"unit":"g","text":"seedless watermelon, cut into 2.5–4cm cubes"},
      {"amount":3,"unit":"tbsp","text":"soy sauce or tamari"},
      {"amount":2,"unit":"tbsp","text":"rice vinegar"},
      {"amount":1,"unit":"tbsp","text":"white or sweet miso paste"},
      {"amount":2,"unit":"tsp","text":"toasted sesame oil"}
    ]},
    {"name":"Spicy sesame mayo","items":[
      {"amount":78,"unit":"g","text":"vegan mayonnaise"},
      {"amount":1,"unit":"tbsp","text":"soy sauce or tamari"},
      {"amount":1,"unit":"tbsp","text":"sriracha, or less to taste"},
      {"amount":1,"unit":"tbsp","text":"water, as needed to loosen"}
    ]},
    {"name":"Bowls","items":[
      {"amount":525,"unit":"g","text":"cooked short-grain rice, kept warm"},
      {"amount":150,"unit":"g","text":"shelled edamame, cooked"},
      {"amount":125,"unit":"g","text":"carrot, peeled and cut into matchsticks"},
      {"amount":2,"unit":"tbsp","text":"rice vinegar, for blanching"},
      {"amount":115,"unit":"g","text":"radishes, very thinly sliced"},
      {"amount":240,"unit":"g","text":"avocado, sliced"},
      {"amount":75,"unit":"g","text":"pickled ginger"}
    ]},
    {"name":"To finish","items":[
      {"amount":1,"unit":"sheet","text":"nori, finely shredded"},
      {"amount":2,"unit":"tsp","text":"toasted sesame seeds or furikake"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Cut the watermelon","time":5,"desc":"Cut the seedless watermelon into generous 2.5–4cm cubes. Keep the pieces fairly large so they hold their shape as they marinate and cook.","ingredientKeys":["0-0"]},
    {"title":"Whisk the marinade","time":3,"desc":"In a large bowl, whisk the soy sauce, rice vinegar, white miso and toasted sesame oil until the miso is completely smooth.","ingredientKeys":["0-1","0-2","0-3","0-4"]},
    {"title":"Marinate","time":60,"desc":"Add the watermelon and turn gently until every cube is coated. Leave for at least 1 hour, turning the pieces a few times as the watermelon releases juice into the marinade.","tip":"Do not rush this stage: the cubes need time to take on the savoury miso and sesame flavour.","ingredientGroupNames":["Miso-marinated watermelon"]},
    {"title":"Cook until the pan is dry","time":12,"desc":"Drain the watermelon well, then place it in a large non-stick frying pan over medium heat. Cook gently for 8–12 minutes, turning rather than stirring hard, until the released liquid has completely evaporated. Take off the heat and leave to cool slightly.","tip":"The final dry-pan minute is what firms the fruit. Stop once the pan is dry so the cubes do not collapse.","ingredientKeys":["0-0"]},
    {"title":"Mix the spicy mayo","time":3,"desc":"Stir together the vegan mayonnaise, soy sauce and sriracha. Add water a teaspoon at a time until the sauce drizzles easily.","ingredientGroupNames":["Spicy sesame mayo"]},
    {"title":"Warm the rice and edamame","time":5,"desc":"Cook or reheat the short-grain rice and edamame according to their packet instructions. Keep both warm while you prepare the vegetables.","ingredientKeys":["2-0","2-1"]},
    {"title":"Quick-blanch the carrot","time":3,"desc":"Bring a saucepan of water to the boil and prepare a bowl of iced water. Add the rice vinegar and carrot matchsticks to the boiling water for 30 seconds, then drain and plunge them into the iced water. Drain again thoroughly.","ingredientKeys":["2-2","2-3"]},
    {"title":"Prepare the cold toppings","time":5,"desc":"Thinly slice the radishes and avocado, and drain the pickled ginger. Keep the toppings separate so their colours and textures stay distinct.","ingredientKeys":["2-4","2-5","2-6"]},
    {"title":"Build the bowls","time":4,"desc":"Divide the warm rice among four bowls. Arrange the edamame, blanched carrot, radishes, avocado, pickled ginger and miso watermelon in separate sections over the rice.","ingredientKeys":["0-0","2-0","2-1","2-2","2-4","2-5","2-6"]},
    {"title":"Sauce and finish","time":2,"desc":"Drizzle each bowl with spicy sesame mayo, then scatter over shredded nori and toasted sesame seeds or furikake. Serve straight away while the rice is warm and the vegetables are crisp.","ingredientGroupNames":["Spicy sesame mayo","To finish"]}
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
