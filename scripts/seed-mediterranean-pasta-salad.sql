-- Seed: Mediterranean Pasta Salad with Creamy Tofu Dressing
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
  'mediterranean-pasta-salad-creamy-tofu-dressing',
  p.id,
  'Mediterranean Pasta Salad with Creamy Tofu Dressing',
  'A properly satisfying pasta salad loaded with smoky crisp chickpeas, creamy butter beans, juicy tomatoes, olives and softened kale. Silken tofu makes the lemony tahini dressing rich and velvety while keeping every serving high in plant protein.',
  'Mediterranean',
  45,
  1,
  4,
  'serving',
  array['Vegan', 'Veg', 'Protein', 'Pasta']::text[],
  'https://images.unsplash.com/photo-1708649360696-ce780660a9c2',
  '{"title":"Why silken tofu?","body":"Silken tofu blends into an exceptionally smooth dressing without dairy. Alongside chickpeas, butter beans and nutritional yeast, it helps this salad deliver roughly 31g of plant protein and 17g of fibre per serving."}'::jsonb,
  '{"calories":610,"carbs":70,"protein":31,"fat":23,"fibre":17,"sugar":8}'::jsonb,
  array[
    'Large baking tray',
    'Large saucepan',
    'Colander',
    'Large mixing bowl',
    'High-speed blender',
    'Sharp knife',
    'Chopping board'
  ]::text[],
  '[
    {"name":"Pasta","items":[
      {"amount":300,"unit":"g","text":"dried penne pasta"}
    ]},
    {"name":"Crispy chickpeas","items":[
      {"amount":1,"unit":"x 400g can","text":"chickpeas, drained, rinsed and patted dry"},
      {"amount":1,"unit":"tbsp","text":"olive oil"},
      {"amount":1,"unit":"tsp","text":"smoked paprika"},
      {"amount":0.5,"unit":"tsp","text":"garlic powder"},
      {"amount":0.5,"unit":"tsp","text":"dried oregano"},
      {"amount":0.5,"unit":"tsp","text":"fine salt"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"}
    ]},
    {"name":"Salad","items":[
      {"amount":1,"unit":"x 400g can","text":"butter beans or cannellini beans, drained and rinsed"},
      {"amount":100,"unit":"g","text":"kale, tough stems removed and leaves chopped"},
      {"amount":0.5,"unit":"","text":"cucumber, diced"},
      {"amount":0.5,"unit":"","text":"red onion, finely sliced"},
      {"amount":150,"unit":"g","text":"cherry tomatoes, halved"},
      {"amount":75,"unit":"g","text":"Kalamata olives, halved"},
      {"amount":15,"unit":"g","text":"fresh parsley, chopped"},
      {"amount":1,"unit":"tsp","text":"olive oil, for massaging the kale"},
      {"amount":1,"unit":"tsp","text":"lemon juice, for massaging the kale"}
    ]},
    {"name":"Creamy tofu dressing","items":[
      {"amount":250,"unit":"g","text":"silken tofu"},
      {"amount":1,"unit":"","text":"lemon, juiced"},
      {"amount":2,"unit":"tbsp","text":"olive oil"},
      {"amount":1,"unit":"tbsp","text":"tahini"},
      {"amount":1,"unit":"tbsp","text":"nutritional yeast"},
      {"amount":1,"unit":"tsp","text":"Dijon mustard"},
      {"amount":1,"unit":"clove","text":"garlic, peeled"},
      {"amount":0.5,"unit":"tsp","text":"dried oregano"},
      {"amount":0.5,"unit":"tsp","text":"smoked paprika"},
      {"amount":0.5,"unit":"tsp","text":"fine salt, plus more to taste"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"},
      {"amount":3,"unit":"tbsp","text":"cold water (use 2–4 tbsp as needed)"}
    ]},
    {"name":"To finish","items":[
      {"amount":0.25,"unit":"tsp","text":"smoked paprika"},
      {"amount":5,"unit":"g","text":"fresh parsley, roughly chopped"},
      {"amount":1,"unit":"","text":"lemon, cut into wedges"},
      {"amount":0.25,"unit":"tsp","text":"freshly ground black pepper"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Season the chickpeas","time":5,"desc":"Heat the oven to 200°C (180°C fan). Spread the thoroughly dried chickpeas on a large baking tray, add the olive oil, smoked paprika, garlic powder, oregano, salt and pepper, then toss until evenly coated.","tip":"Dry chickpeas crisp rather than steam. A clean tea towel makes quick work of the surface moisture.","ingredientGroupNames":["Crispy chickpeas"]},
    {"title":"Roast until crisp","time":30,"desc":"Roast the chickpeas for 25–30 minutes, shaking the tray halfway through, until golden and crisp at the edges. Let them sit on the tray while you assemble the salad.","tip":"Cook the pasta and make the dressing while the chickpeas roast; the recipe takes about 45 minutes overall.","ingredientGroupNames":["Crispy chickpeas"]},
    {"title":"Cook the penne","time":12,"desc":"Bring a large saucepan of well-salted water to the boil. Cook the penne until al dente, following the packet timing, then drain thoroughly and leave it to cool for a few minutes.","tip":"Do not rinse the pasta: a little surface starch helps the tofu dressing cling.","ingredientGroupNames":["Pasta"]},
    {"title":"Soften the kale","time":3,"desc":"Put the chopped kale in a large mixing bowl. Add the olive oil and lemon juice, then massage with clean hands for 2–3 minutes until the leaves darken, soften and lose their raw edge.","ingredientKeys":["2-1","2-7","2-8"]},
    {"title":"Prepare the salad","time":5,"desc":"Add the butter beans, diced cucumber, sliced red onion, halved cherry tomatoes, olives and chopped parsley to the softened kale.","ingredientKeys":["2-0","2-2","2-3","2-4","2-5","2-6"]},
    {"title":"Blend the tofu dressing","time":5,"desc":"Add the silken tofu, lemon juice, olive oil, tahini, nutritional yeast, Dijon, garlic, oregano, smoked paprika, salt and pepper to a blender. Blend until completely smooth, adding the water a tablespoon at a time until the dressing is creamy but pourable. Taste and adjust the seasoning.","ingredientGroupNames":["Creamy tofu dressing"]},
    {"title":"Toss the pasta salad","time":3,"desc":"Add the slightly cooled penne to the vegetables. Pour over most of the creamy tofu dressing and toss thoroughly until the pasta, beans and vegetables are evenly coated. Add more dressing if needed.","ingredientKeys":["0-0","2-0","2-1","2-2","2-3","2-4","2-5","2-6"],"ingredientGroupNames":["Creamy tofu dressing"]},
    {"title":"Finish and serve","time":2,"desc":"Spoon the salad onto a platter or into bowls and pile the crispy chickpeas on top. Finish with smoked paprika, parsley, lemon wedges and plenty of black pepper. Serve warm, at room temperature or chilled.","ingredientGroupNames":["Crispy chickpeas","To finish"]}
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
