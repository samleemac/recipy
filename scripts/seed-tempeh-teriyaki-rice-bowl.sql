-- Seed: Tempeh Teriyaki Rice Bowl (idempotent upsert by slug)
-- Run in Supabase → SQL Editor if npm run migrate is unavailable.

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
  'tempeh-teriyaki-rice-bowl',
  p.id,
  'Tempeh Teriyaki Rice Bowl',
  'Nutty, crumbled tempeh meets a quick teriyaki-style sauce in this one-pan rice bowl. Brown rice, broccoli, edamame and peas make it filling; spring onion, chilli and sesame seeds finish it bright.',
  'Japanese',
  40,
  2,
  2,
  'serving',
  array['Veg', 'Protein', 'Quick']::text[],
  'https://images.unsplash.com/photo-1546069901-ba9599a0e63c',
  '{"title":"Did you know?","body":"Tempeh is fermented whole soybeans pressed into a firm block — higher in protein and fibre than tofu, with a nutty depth that crisps beautifully in a hot pan."}'::jsonb,
  '{"calories":520,"carbs":58,"protein":22,"fat":22,"fibre":9,"sugar":12}'::jsonb,
  array['Saucepan', 'Small bowl', 'Non-stick frying pan', 'Wok or large frying pan']::text[],
  '[
    {"name":"Main","items":[
      {"amount":300,"unit":"g","text":"brown rice"},
      {"amount":0.5,"unit":"","text":"vegetable stock cube"},
      {"amount":300,"unit":"g","text":"block of tempeh"},
      {"amount":2,"unit":"tbsp","text":"sesame oil"},
      {"amount":1,"unit":"tbsp","text":"tamari"},
      {"amount":1,"unit":"bunch","text":"spring onions, white and green parts finely chopped"},
      {"amount":1,"unit":"","text":"thumb-sized piece of fresh ginger, peeled and minced"},
      {"amount":4,"unit":"cloves","text":"garlic, minced"},
      {"amount":0.5,"unit":"","text":"mild red chilli, finely chopped (½–1, to taste), plus more to serve"},
      {"amount":150,"unit":"g","text":"Tenderstem broccoli, stems roughly chopped into 2cm (¾ in) pieces"},
      {"amount":80,"unit":"g","text":"frozen edamame beans"},
      {"amount":80,"unit":"g","text":"frozen peas"},
      {"amount":0,"unit":"","text":"sesame seeds, to serve"}
    ]},
    {"name":"Quick teriyaki-style sauce","items":[
      {"amount":1,"unit":"tbsp","text":"sesame oil"},
      {"amount":2.5,"unit":"tbsp","text":"tamari"},
      {"amount":1,"unit":"tbsp","text":"maple or agave syrup"},
      {"amount":1,"unit":"tbsp","text":"mirin (rice wine)"},
      {"amount":1,"unit":"tsp","text":"toasted sesame oil"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Cook the rice","time":25,"desc":"Cook the brown rice according to the packet instructions, with the vegetable stock cube if you like for extra flavour.","tip":"Rinse the rice first for fluffier grains. Start this first — it can sit covered while you stir-fry."},
    {"title":"Mix the teriyaki sauce","time":2,"desc":"In a small bowl, mix together all the quick teriyaki sauce ingredients. Set aside."},
    {"title":"Crisp the tempeh","time":8,"desc":"Over a small bowl, crumble the tempeh into small chunks with your hands. Heat 1 tablespoon of the sesame oil in a non-stick frying pan on a medium–high heat and, once hot, add the tempeh. Fry for 5 minutes until browning. Add the tamari and mix well. Taste and add a little more tamari if you think it needs more salt.","tip":"Crumbling over a bowl catches any crumbs — you want small, even pieces so every bite gets crispy edges."},
    {"title":"Stir-fry the bowl","time":10,"desc":"In a wok or frying pan, add the remaining sesame oil and fry the spring onion whites, ginger, garlic and chilli for 3–4 minutes until fragrant. Add the broccoli and stir-fry for 3–4 minutes until it turns bright green. Add the cooked rice, edamame and peas (straight from frozen is fine — they will thaw in the pan), then tip in the sauce. Mix well, then add the cooked tempeh and heat through."},
    {"title":"Serve","time":2,"desc":"Divide into bowls and serve topped with extra chilli, the spring onion greens and sesame seeds."}
  ]'::jsonb,
  'published',
  now()
from public.profiles p
where p.username = 'mackinley-kitchen'
on conflict (slug) do update set
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
