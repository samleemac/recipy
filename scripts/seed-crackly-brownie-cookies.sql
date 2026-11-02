-- Seed: Crackly Brownie Cookies
-- Adapted from Chef Josh at The Chef Out West. Idempotent upsert by slug.

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
  'crackly-brownie-cookies',
  p.id,
  'Crackly Brownie Cookies',
  'Six-ingredient brownie batter, scooped into cookies with a shiny crackled top, a fudgy middle and chewy edges. One bowl, a whisk, and about half an hour including the cool on the tray.',
  'American',
  30,
  1,
  12,
  'cookie',
  array['Veg', 'Sweet', 'Bake']::text[],
  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35',
  '{"title":"The crackle is the sugar","body":"Icing sugar has to dissolve completely into the egg whites before the cocoa goes in. That glossy base is what sets the shiny crust in the first two hot minutes. Adapted from the fudgy brownie cookies by Chef Josh at The Chef Out West. There is no flour, so they are naturally gluten-free if the chocolate chips are too."}'::jsonb,
  '{"calories":175,"carbs":36,"protein":2,"fat":3,"fibre":2,"sugar":32}'::jsonb,
  array[
    'Two baking sheets',
    'Baking paper',
    'Large mixing bowl',
    'Whisk',
    'Spoon or cookie scoop',
    'Wire rack',
    'Metal spatula'
  ]::text[],
  '[
    {"name":"Brownie cookie batter","items":[
      {"amount":360,"unit":"g","text":"icing sugar (3 cups powdered sugar)"},
      {"amount":45,"unit":"g","text":"unsweetened cocoa powder (½ cup)"},
      {"amount":0.5,"unit":"tsp","text":"fine salt"},
      {"amount":120,"unit":"g","text":"egg whites, from about 3 large eggs (½ cup)"},
      {"amount":90,"unit":"g","text":"dark chocolate chips (½ cup semisweet)"},
      {"amount":1,"unit":"tsp","text":"vanilla extract"}
    ]}
  ]'::jsonb,
  '[
    {"title":"Whisk a glossy base","time":6,"desc":"Heat the oven to 190°C (170°C fan) and line two baking sheets with baking paper. In a large bowl, whisk the egg whites and icing sugar until the mixture is thick, shiny and completely smooth, with no grains of sugar left.","tip":"This is the step that makes the crackle. Fresh whites from the shell whisk thicker than carton whites, which can make the batter spread thin.","ingredientKeys":["0-0","0-3"]},
    {"title":"Fold in the cocoa","time":2,"desc":"Add the cocoa powder, salt and vanilla. Fold gently until the batter is evenly chocolate-brown and looks more like brownie batter than cookie dough.","ingredientKeys":["0-1","0-2","0-5"]},
    {"title":"Add the chocolate chips","time":1,"desc":"Fold in the chocolate chips until they are scattered through the batter. Stop once they are even, so the batter stays glossy.","ingredientKeys":["0-4"]},
    {"title":"Scoop the cookies","time":4,"desc":"Scoop about 2 tablespoons of batter for each cookie onto the trays, leaving at least 7cm between them. They spread into wide puddles.","tip":"Use a tablespoon scoop instead if you want them smaller and a little thicker.","ingredientGroupNames":["Brownie cookie batter"]},
    {"title":"Bake in two heats","time":11,"desc":"Bake for 2 minutes at 190°C (170°C fan), then immediately turn the oven down to 180°C (160°C fan) and bake for another 8–9 minutes. The tops should be shiny and crackled, and the centres should still look soft.","tip":"Take them out while the middles look underdone. They finish setting on the hot tray, and a fully set centre will be dry once it cools.","ingredientGroupNames":["Brownie cookie batter"]},
    {"title":"Cool on the tray","time":10,"desc":"Leave the cookies on the baking sheet for at least 10 minutes, then lift them onto a wire rack with a metal spatula. They firm up as they cool.","tip":"If they stick to the paper, give them 30–40 minutes on the tray before you lift them. Keep the cooled cookies in an airtight tin for up to 4 days. They turn chewier on the second day. Do not refrigerate them.","ingredientGroupNames":["Brownie cookie batter"]}
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
