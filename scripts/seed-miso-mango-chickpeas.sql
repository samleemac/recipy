-- Seed: Miso Mango Chickpeas with Quinoa Rocket Salad
-- Idempotent upsert by slug. Run in Supabase -> SQL Editor if
-- npm run migrate is unavailable.

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
  'miso-mango-chickpeas',
  p.id,
  'Miso Mango Chickpeas',
  'Chickpeas coated in a thick mango–miso sauce, piled over quinoa and rocket with feta, avocado and chilli. Sweet, savoury and sharp in one bowl — ready in about 40 minutes once the quinoa is cooked.',
  'Fusion',
  40,
  1,
  2,
  'bowl',
  array['Veg', 'Protein', 'Light', 'Quick']::text[],
  'https://images.unsplash.com/photo-1623428187425-873f16e10554',
  '{"title":"Let the sauce cling","body":"Mango and white miso make a thick, glossy coating rather than a thin dressing. Blending with only a splash of water keeps it spoonable so every chickpea picks up flavour during the short rest."}'::jsonb,
  '{"calories":700,"carbs":60,"protein":37,"fat":28,"fibre":18,"sugar":14}'::jsonb,
  array[
    'Saucepan',
    'High-speed blender',
    'Mixing bowl',
    'Sharp knife',
    'Chopping board'
  ]::text[],
  '[
    {"name":"Miso mango chickpeas","items":[
      {"amount":1,"unit":"x 400g can","text":"chickpeas, drained and rinsed"},
      {"amount":0.5,"unit":"","text":"cucumber, diced"},
      {"amount":0.5,"unit":"","text":"red chilli, finely sliced (reserve a little for garnish)"}
    ]},
    {"name":"Mango miso sauce","items":[
      {"amount":1,"unit":"","text":"ripe mango, flesh scooped out"},
      {"amount":1,"unit":"tbsp","text":"white miso paste"},
      {"amount":0.5,"unit":"","text":"lime, juiced"},
      {"amount":1,"unit":"tbsp","text":"olive oil"},
      {"amount":1,"unit":"tsp","text":"maple syrup or honey (optional)"},
      {"amount":1,"unit":"small clove","text":"garlic, peeled"},
      {"amount":5,"unit":"g","text":"fresh ginger, peeled (optional)"},
      {"amount":2,"unit":"tbsp","text":"cold water, as needed to blend"},
      {"amount":0.25,"unit":"tsp","text":"fine salt, plus more to taste"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"}
    ]},
    {"name":"Quinoa rocket salad","items":[
      {"amount":100,"unit":"g","text":"cooked quinoa, cooled slightly"},
      {"amount":60,"unit":"g","text":"rocket (arugula), about 2 large handfuls"},
      {"amount":100,"unit":"g","text":"feta, crumbled"},
      {"amount":1,"unit":"","text":"ripe avocado, sliced"},
      {"amount":0.5,"unit":"","text":"lime, juiced"},
      {"amount":1,"unit":"tbsp","text":"olive oil"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"}
    ]},
    {"name":"Garnish","items":[
      {"amount":0.5,"unit":"tsp","text":"sumac"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"},
      {"amount":0,"unit":"","text":"extra chilli slices"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Cook the quinoa","time":15,"desc":"Cook the quinoa according to the packet instructions. Drain if needed and leave to cool slightly while you make the sauce.","tip":"Fluff with a fork as it cools so the grains stay separate under the chickpeas.","ingredientKeys":["2-0"]},
    {"title":"Blend the mango miso sauce","time":5,"desc":"Add the mango flesh, white miso, lime juice, olive oil, optional maple or honey, garlic, optional ginger, salt and pepper to a blender. Blend until completely smooth, adding water a splash at a time until the sauce is thick and creamy enough to coat chickpeas.","tip":"Stop while it is still spoonable — if it runs like a dressing, you have added too much water.","ingredientGroupNames":["Mango miso sauce"]},
    {"title":"Coat the chickpeas","time":3,"desc":"In a mixing bowl, combine the drained chickpeas, diced cucumber and most of the sliced chilli. Spoon over most of the mango miso sauce and fold gently until every chickpea is coated.","ingredientGroupNames":["Miso mango chickpeas","Mango miso sauce"]},
    {"title":"Rest for flavour","time":15,"desc":"Leave the coated chickpeas to sit for 10–15 minutes so the sauce can soak in. Keep any remaining sauce for spooning over the bowls.","tip":"This short rest is worth it — the cucumber stays crisp and the chickpeas pick up the mango and miso.","ingredientKeys":["0-0","0-1"]},
    {"title":"Build the salad base","time":3,"desc":"Divide the rocket and slightly cooled quinoa between two bowls. Scatter over the crumbled feta.","ingredientKeys":["2-0","2-1","2-2"]},
    {"title":"Top and finish","time":4,"desc":"Spoon the creamy mango chickpeas over each bowl. Add avocado slices and the reserved chilli. Finish with sumac, cracked black pepper, a squeeze of lime and a drizzle of olive oil. Serve straight away.","ingredientKeys":["0-0","0-1","0-2","2-3","2-4","2-5","2-6","3-0","3-1","3-2"]}
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
