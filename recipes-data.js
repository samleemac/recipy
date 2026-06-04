/* Recipy - full recipe dataset. 23 recipes with ingredients, steps, macros.
   Cook mode: each step should include ingredientKeys and/or ingredientGroupNames.
   See docs/RECIPE_AUTHORING.md and run: npm run audit:cookmode */
window.RECIPES = [
  /* ============================================================ 0. Apple Cinnamon Muffins ============================================================ */
  {
    id: 0,
    slug: "apple-cinnamon-muffins",
    title: "Apple Cinnamon Muffins",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "British",
    time: 30,
    difficulty: 1,
    baseServings: 6,
    servingNoun: "muffin",
    tags: ["Breakfast","Veg","Light"],
    photo: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d",
    fact: {"title":"Did you know?","body":"Apples are loaded with quercetin, an antioxidant linked to anti-inflammatory, anti-viral and even anti-depressant effects. An apple a day really might keep the doctor away."},
    intro: "Cinnamon-warmed muffins with juicy apple chunks and a buttery sugar-crackle top. Equal parts breakfast bribery and afternoon pick-me-up.",
    macros: {"calories":165,"carbs":25,"protein":2,"fat":6,"fibre":1,"sugar":11},
    equipment: ["6-hole muffin tray","Paper liners","Mixing bowls","Whisk","Pastry brush","Toothpick"],
    ingredientGroups: [
      {
        "name": "Muffin batter",
        "items": [
          {
            "amount": 90,
            "unit": "g",
            "text": "plain flour"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "baking powder"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "fine salt"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "ground cinnamon"
          },
          {
            "amount": 180,
            "unit": "ml",
            "text": "almond milk"
          },
          {
            "amount": 40,
            "unit": "ml",
            "text": "olive oil"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "maple syrup"
          },
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "lemon juice"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "vanilla extract"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "Granny Smith apple, diced small"
          }
        ]
      },
      {
        "name": "Cinnamon-sugar top",
        "items": [
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "butter, melted"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "caster sugar"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "ground cinnamon"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & whisk the dry",
        "time": 5,
        "desc": "Preheat the oven to 200C and line a 6-hole muffin tray. In a large bowl, whisk together the plain flour, baking powder, salt and 1 tsp ground cinnamon until evenly mixed."
      },
      {
        "title": "Mix the wet ingredients",
        "time": 5,
        "desc": "In a second bowl, whisk the almond milk, olive oil, lemon juice, maple syrup and vanilla until well combined. Pour into the dry bowl and stir just until you have a thick batter - a few streaks of flour are fine.",
        "tip": "Overmixing makes the muffins tough. Stop the moment everything is incorporated.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9"
        ]
      },
      {
        "title": "Fold in the apple",
        "time": 2,
        "desc": "Dice the Granny Smith apple into small bite-sized pieces (skin on is great). Fold through the batter with a spatula in 2-3 strokes.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9"
        ]
      },
      {
        "title": "Bake until golden",
        "time": 15,
        "desc": "Spoon the batter all the way to the top of each muffin liner. Bake on the middle shelf for ~15 minutes, or until the tops are lightly golden and a toothpick comes out clean.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9"
        ]
      },
      {
        "title": "Butter, dunk, devour",
        "time": 5,
        "desc": "Mix the topping sugar with 1 tsp ground cinnamon. Brush each warm muffin top with melted butter, then dip the tops straight into the cinnamon-sugar to coat. Cool slightly before tasting.",
        "tip": "Best eaten warm with a hot cup of coffee or tea.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      }
    ]
  },
  /* ============================================================ 1. Bean & Mushroom Tacos ============================================================ */
  {
    id: 1,
    slug: "bean-mushroom-tacos",
    title: "Bean & Mushroom Tacos",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Mexican",
    time: 25,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Protein","Quick"],
    photo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47",
    fact: {"title":"Did you know?","body":"Baby gem lettuce gives you almost no calories but a hit of folate, vitamin K and crunch. The perfect taco-sturdy leaf - sturdy enough to hold the filling, light enough to keep things fresh."},
    intro: "Smoky cajun mushrooms, crushed kidney beans and salty feta, stacked into warm tortillas with a chipotle-mayo drizzle. Weeknight tacos that punch way above their weight.",
    macros: {"calories":470,"carbs":49,"protein":18,"fat":22,"fibre":11,"sugar":6},
    equipment: ["Frying pan","Baking tray","Mixing bowl","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Filling",
        "items": [
          {
            "amount": 150,
            "unit": "g",
            "text": "chestnut mushrooms, thinly sliced"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "red kidney beans, drained"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, thinly sliced"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "tomato puree"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "Cajun seasoning"
          },
          {
            "amount": 75,
            "unit": "ml",
            "text": "vegetable stock"
          }
        ]
      },
      {
        "name": "Drizzle & build",
        "items": [
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "mayonnaise"
          },
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "chipotle paste"
          },
          {
            "amount": 4,
            "unit": "",
            "text": "tortilla wraps"
          },
          {
            "amount": 100,
            "unit": "g",
            "text": "Greek-style salad cheese (or feta), crumbled"
          },
          {
            "amount": 1,
            "unit": "cob",
            "text": "baby gem lettuce, shredded"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep your mise-en-place",
        "time": 5,
        "desc": "Boil the kettle. Thinly slice the mushrooms and garlic. Make up the vegetable stock. Drain and rinse the kidney beans. Crush half of the beans with the back of a fork - keep the other half whole for texture."
      },
      {
        "title": "Fry the smoky filling",
        "time": 8,
        "desc": "Heat a glug of oil in a frying pan. Add the mushrooms and cook until they have softened and started to colour (~5 min). Stir in the garlic, tomato puree, both whole and crushed beans and Cajun seasoning. Pour in the vegetable stock, simmer 5 minutes and season to taste.",
        "tip": "Don't crowd the pan - mushrooms steam instead of brown. Spread them in one layer and leave them be.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5"
        ]
      },
      {
        "title": "Whip the chipotle mayo",
        "time": 3,
        "desc": "Mix the mayonnaise and chipotle paste in a small bowl with a splash of water - you want it loose enough to drizzle from a spoon.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5"
        ]
      },
      {
        "title": "Warm the tortillas",
        "time": 2,
        "desc": "Place tortillas on a baking tray and warm in the oven for 1-2 minutes - just enough to make them flexible without crisping.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5"
        ]
      },
      {
        "title": "Build & devour",
        "time": 2,
        "desc": "Lettuce first, a generous spoon of beans and mushrooms, crumbled feta, and a final drizzle of chipotle mayo. Eat with both hands.",
        "tip": "A squeeze of lime juice over the top brightens everything up.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4"
        ]
      }
    ]
  },
  /* ============================================================ 2. Berried Treasure - Blueberry Muffins ============================================================ */
  {
    id: 2,
    slug: "berried-treasure-blueberry-muffins",
    title: "Berried Treasure - Blueberry Muffins",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "British",
    time: 30,
    difficulty: 1,
    baseServings: 9,
    servingNoun: "muffin",
    language: "en",
    isLimitedEdition: true,
    variantGroup: "berried-treasure-blueberry-muffins",
    isPrimary: true,
    tags: ["Breakfast","Vegan","Light"],
    photo: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
    fact: {"title":"Did you know?","body":"Blueberries have one of the highest concentrations of antioxidants of any fruit, helping protect cells from damage and slowing the deterioration of memory. Your body won't be feeling blue for blueberries."},
    intro: "Soft, ginger-spiced muffins exploding with bursts of jammy blueberry. Vegan, dairy-free and ready in half an hour - and Sara's secret is the cinnamon-ginger sugar dusted on while warm.",
    macros: {"calories":152,"carbs":23,"protein":2.2,"fat":5.5,"fibre":0.5,"sugar":7.6},
    equipment: ["9-hole muffin tray","Paper liners","Mixing bowls","Whisk","Spatula"],
    ingredientGroups: [
      {
        "name": "Muffin batter",
        "items": [
          {
            "amount": 180,
            "unit": "g",
            "text": "plain flour"
          },
          {
            "amount": 50,
            "unit": "g",
            "text": "caster sugar"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "fine salt"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "baking powder"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "ground ginger"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "ground cinnamon"
          },
          {
            "amount": 195,
            "unit": "ml",
            "text": "almond milk"
          },
          {
            "amount": 50,
            "unit": "ml",
            "text": "olive oil"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "lemon juice"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "vanilla extract"
          },
          {
            "amount": 120,
            "unit": "g",
            "text": "frozen blueberries"
          }
        ]
      },
      {
        "name": "Sara's spiced sugar (optional)",
        "items": [
          {
            "amount": 1,
            "unit": "tsp",
            "text": "caster sugar"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "ground ginger"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "ground cinnamon"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & whisk the dry",
        "time": 5,
        "desc": "Preheat the oven to 200C and line a 9-hole muffin tray. In a large bowl, whisk the flour, sugar, salt, baking powder, ginger and cinnamon together until evenly mixed."
      },
      {
        "title": "Mix the wet ingredients",
        "time": 5,
        "desc": "In another bowl, whisk the almond milk, olive oil, lemon juice and vanilla. Pour into the dry bowl and gently fold together with a spatula - stop as soon as it just comes together.",
        "tip": "The lemon juice + almond milk acts as a vegan buttermilk - it's what gives the muffins lift."
      },
      {
        "title": "Fold in the blueberries",
        "time": 2,
        "desc": "Add the frozen blueberries straight to the batter (no need to defrost) and fold through 2-3 times. Streaks of purple are good - it means you haven't crushed them."
      },
      {
        "title": "Bake until risen",
        "time": 15,
        "desc": "Spoon the batter all the way to the top of the muffin liners. Bake for ~15 minutes or until the tops are lightly golden and a toothpick inserted into the middle comes out clean (a streak of blueberry is fine - just no batter).",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9",
          "0-10"
        ]
      },
      {
        "title": "Sara's spiced sugar (optional)",
        "time": 3,
        "desc": "Mix the topping sugar, ginger and cinnamon together. Sprinkle generously over the muffins while they're still warm so it sticks to the tops.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      }
    ]
  },
  /* ============================================================ 3. Cauli ft. Pea Tikka Masala ============================================================ */
  {
    id: 3,
    slug: "cauli-pea-tikka-masala",
    title: "Cauli ft. Pea Tikka Masala",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Indian",
    time: 35,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Curry","Spicy"],
    photo: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    fact: {"title":"Did you know?","body":"Almonds are the ultimate overachievers - technically not nuts but the seeds of the almond fruit, and one of the best plant-based sources of protein and fibre on the planet."},
    intro: "Roast cauliflower meets a creamy, tikka-spiced tomato sauce, sweet peas and toasted flaked almonds. A weeknight curry that tastes like you put in way more effort than you actually did.",
    macros: {"calories":685,"carbs":92,"protein":18,"fat":26,"fibre":11,"sugar":14},
    equipment: ["Baking tray","Saucepan (rice)","Frying pan","Grater"],
    ingredientGroups: [
      {
        "name": "Roast & rice",
        "items": [
          {
            "amount": 400,
            "unit": "g",
            "text": "cauliflower, cut into bite-size florets"
          },
          {
            "amount": 150,
            "unit": "g",
            "text": "jasmine rice"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "ground cumin (1 for cauli, 1 for sauce)"
          },
          {
            "amount": 15,
            "unit": "g",
            "text": "flaked almonds"
          }
        ]
      },
      {
        "name": "Tikka sauce",
        "items": [
          {
            "amount": 2,
            "unit": "cloves",
            "text": "garlic, grated"
          },
          {
            "amount": 4,
            "unit": "tbsp",
            "text": "tikka masala paste"
          },
          {
            "amount": 300,
            "unit": "g",
            "text": "tomato passata"
          },
          {
            "amount": 200,
            "unit": "g",
            "text": "frozen peas"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "red chilli jam"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "butter"
          },
          {
            "amount": 150,
            "unit": "ml",
            "text": "single cream (or oat cream)"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Roast the cauli",
        "time": 12,
        "desc": "Boil the kettle and preheat the oven to 220C. Spread the cauliflower on a baking tray, season with salt, pepper and a glug of oil. Sprinkle 1 tsp cumin over the top, toss, and roast for 12 minutes.",
        "ingredientKeys": [
          "0-0",
          "0-2"
        ]
      },
      {
        "title": "Rice & toast almonds",
        "time": 12,
        "desc": "Cook the rice according to package instructions. Heat a dry frying pan and add the flaked almonds, stirring constantly until lightly toasted (~3 mins). Tip into a small bowl for later.",
        "tip": "Toasted almonds are non-negotiable - they bring nuttiness and crunch to the finished dish.",
        "ingredientKeys": [
          "0-1",
          "0-3"
        ]
      },
      {
        "title": "Build the sauce",
        "time": 4,
        "desc": "Heat the now-empty frying pan with a glug of oil. Add the grated garlic, tikka paste and remaining 1 tsp cumin. Stir-fry for 30 seconds until fragrant. Pour in the passata, vegetable stock paste and cream. Simmer for 4 minutes until thickened.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7"
        ]
      },
      {
        "title": "Bring it together",
        "time": 5,
        "desc": "Stir the peas, chilli jam and butter into the sauce. Tip in the roasted cauliflower and gently fold so every floret is coated. Taste and season.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7"
        ]
      },
      {
        "title": "Plate & shower",
        "time": 2,
        "desc": "Fluff the rice and divide between bowls. Spoon the curry on top and finish with a generous shower of toasted almonds.",
        "tip": "A squeeze of lime juice into the rice gives it extra OOMPH.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7"
        ]
      }
    ]
  },
  /* ============================================================ 4. Cheesy Cauli-Blues ============================================================ */
  {
    id: 4,
    slug: "cheesy-cauli-blues",
    title: "Cheesy Cauli-Blues",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "Italian-American",
    time: 45,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Comfort","Pasta"],
    photo: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6",
    fact: {"title":"Did you know?","body":"Mac & cheese has been enjoyed for centuries - the earliest known recipe was written down in a 13th-century Italian cookbook called Liber de Coquina. This is our cauliflower-loaded take on the all-time classic."},
    intro: "Roasted cauliflower, blue-cheese-laced macaroni and a silky cheddar sauce baked under a crunchy breadcrumb top. A bowl of dinner-time happiness.",
    macros: {"calories":850,"carbs":73,"protein":20.5,"fat":48,"fibre":4.5,"sugar":7},
    equipment: ["Ovenproof dish","Saucepan (pasta)","Saucepan (sauce)","Mixing bowls","Grater"],
    ingredientGroups: [
      {
        "name": "Pasta & cauli",
        "items": [
          {
            "amount": 200,
            "unit": "g",
            "text": "macaroni (or pasta of your choice)"
          },
          {
            "amount": 300,
            "unit": "g",
            "text": "cauliflower, cut into florets"
          },
          {
            "amount": 4,
            "unit": "tbsp",
            "text": "olive oil (split for sauce, crust and roast)"
          }
        ]
      },
      {
        "name": "Crunchy top",
        "items": [
          {
            "amount": 60,
            "unit": "g",
            "text": "mature cheddar, grated"
          },
          {
            "amount": 30,
            "unit": "g",
            "text": "blue cheese, crumbled"
          },
          {
            "amount": 25,
            "unit": "g",
            "text": "panko breadcrumbs"
          }
        ]
      },
      {
        "name": "Cheese sauce",
        "items": [
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "plain flour"
          },
          {
            "amount": 250,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock cube"
          },
          {
            "amount": 150,
            "unit": "g",
            "text": "Oatly cream (or single cream)"
          },
          {
            "amount": 100,
            "unit": "g",
            "text": "baby spinach"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep the crunchy top",
        "time": 5,
        "desc": "Boil the kettle and preheat the oven to 220C. In a small bowl, mix the cheddar, blue cheese, breadcrumbs, 2 tbsp olive oil and a pinch of salt and pepper. Set aside.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      },
      {
        "title": "Cook the pasta & roast cauli",
        "time": 18,
        "desc": "Cook the pasta according to package instructions, then drain. Meanwhile tip the cauliflower into an ovenproof dish, drizzle with oil, season and roast until the edges are golden (~15-18 min).",
        "ingredientKeys": [
          "0-0",
          "0-1"
        ]
      },
      {
        "title": "Make the cheese sauce",
        "time": 8,
        "desc": "Heat 2 tbsp oil in a saucepan. Whisk in the flour to form a paste. Slowly add the water and crumble in the stock cube, whisking until smooth and thickened (~2 min). Stir in the cream off the heat, then return to a low heat and add the cheddar set aside (a small handful) until melted. Wilt in the spinach. Season to taste.",
        "tip": "Sam's top tip: a small drizzle of sriracha into the sauce gives it a sneaky kick.",
        "ingredientKeys": [
          "2-0",
          "2-1",
          "2-2",
          "2-3",
          "2-4"
        ]
      },
      {
        "title": "Combine in the dish",
        "time": 4,
        "desc": "Tip the drained pasta into the dish with the roasted cauli. Pour over the cheese sauce and stir to coat. Scatter the breadcrumb-cheese mix evenly over the top.",
        "ingredientKeys": [
          "0-2"
        ]
      },
      {
        "title": "Bake the crust",
        "time": 5,
        "desc": "Slide the dish back in the oven for 5 minutes, until the crumb is golden and crisp. Serve straight from the dish - it's that kind of meal.",
        "tip": "Serve with a sriracha drizzle and a sharp green salad to cut the richness.",
        "ingredientKeys": [
          "0-2"
        ]
      }
    ]
  },
  /* ============================================================ 5. Sara's Easy Crepes ============================================================ */
  {
    id: 5,
    slug: "crepes",
    title: "Sara's Easy Crepes",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "French",
    time: 15,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Breakfast","Veg","Light","Quick"],
    photo: "https://images.unsplash.com/photo-1519676867240-f03562e64548",
    fact: {"title":"Did you know?","body":"Crepes were born in Brittany, France, around the 13th century - originally made from buckwheat because it was the only flour the rocky local soil would grow."},
    intro: "Three ingredients, no eggs, ready in fifteen minutes. Roll them with maple syrup and lemon, stuff them with banana and chocolate, or fold them with sauteed mushrooms - endlessly hackable.",
    macros: {"calories":228,"carbs":46,"protein":6,"fat":1.5,"fibre":2,"sugar":4},
    equipment: ["Mixing bowl","Whisk","Frying pan (non-stick)","Spatula"],
    ingredientGroups: [
      {
        "name": "Crepe batter",
        "items": [
          {
            "amount": 120,
            "unit": "g",
            "text": "plain flour (or GF blend)"
          },
          {
            "amount": 200,
            "unit": "ml",
            "text": "almond milk"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "fine salt"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "caster sugar"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "butter (for the pan)"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Mix the batter",
        "time": 3,
        "desc": "In a bowl, whisk together the flour, sugar and salt. Slowly add the almond milk while whisking, until you have a smooth, pourable batter the consistency of single cream.",
        "tip": "Lumps? Pour the batter through a sieve into a measuring jug - you'll thank yourself later."
      },
      {
        "title": "Heat your pan",
        "time": 2,
        "desc": "Place a non-stick frying pan over medium heat and add a tiny smear of butter, swirling to coat the base."
      },
      {
        "title": "Pour & swirl",
        "time": 3,
        "desc": "Pour in roughly 1/3 of the batter and immediately tilt the pan to coat the surface in a thin layer. The crepe is ready to flip when the edges lift cleanly and it slides freely on the pan (~1 min).",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-4"
        ]
      },
      {
        "title": "Flip & finish",
        "time": 1,
        "desc": "Flip the crepe with a spatula or, if you're feeling brave, a quick wrist flick. Cook the other side for 30 seconds until golden. Slide onto a plate.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-4"
        ]
      },
      {
        "title": "Repeat & top",
        "time": 6,
        "desc": "Repeat with the rest of the batter (~3 crepes total). Stack with a square of greaseproof between each one to keep them warm. Top however you like - lemon and sugar, maple syrup, fresh berries and yoghurt, or the savoury way with mushrooms and spinach.",
        "tip": "Make it yours: try 1 tsp cinnamon + light brown sugar in the batter, or fold in a sliced banana before pouring.",
        "ingredientKeys": [
          "0-3"
        ]
      }
    ]
  },
  /* ============================================================ 6. Crisp Nuggets and Spicy Stew ============================================================ */
  {
    id: 6,
    slug: "crisp-nuggets-and-spicy-stew",
    title: "Crisp Nuggets and Spicy Stew",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "American Diner",
    time: 45,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Comfort","Protein","Spicy"],
    photo: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb",
    fact: {"title":"Did you know?","body":"Cauliflower is the best vegetable source of choline - a nutrient renowned for brain and memory development. Eat these nuggets and you won't forget a thing."},
    intro: "Crunchy, Cajun-spiced cauliflower nuggets crowning a deeply smoky bean-and-tomato stew. The kind of dish that converts cauliflower haters into raving fans.",
    macros: {"calories":590,"carbs":75,"protein":22,"fat":22,"fibre":14,"sugar":8},
    equipment: ["Baking tray","Saucepan","Mixing bowls"],
    ingredientGroups: [
      {
        "name": "Crispy nuggets",
        "items": [
          {
            "amount": 1,
            "unit": "",
            "text": "cauliflower, cut into bite-size florets"
          },
          {
            "amount": 3,
            "unit": "tbsp",
            "text": "mayonnaise"
          },
          {
            "amount": 100,
            "unit": "g",
            "text": "panko breadcrumbs"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "Cajun seasoning (for the crust)"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "olive oil"
          }
        ]
      },
      {
        "name": "Smoky bean stew",
        "items": [
          {
            "amount": 1,
            "unit": "",
            "text": "onion, diced"
          },
          {
            "amount": 2,
            "unit": "",
            "text": "Portobello mushrooms, quartered"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, diced"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "Cajun seasoning (for stew)"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "chilli powder"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "chopped tomatoes"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "butter beans, drained"
          },
          {
            "amount": 75,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & coat the cauli",
        "time": 5,
        "desc": "Preheat the oven to 220C. Toss the cauliflower florets in a bowl with the mayonnaise, salt and pepper until every piece is coated. In a second bowl, mix the breadcrumbs, 1 tbsp Cajun seasoning and olive oil. Tip the breadcrumb mix over the cauliflower and toss again to coat."
      },
      {
        "title": "Roast until golden",
        "time": 28,
        "desc": "Spread the cauliflower into a single layer on a baking tray (no overlapping or they'll steam). Roast for 25-30 minutes until deeply golden and crisp.",
        "tip": "Flip the nuggets halfway through for the most even crust."
      },
      {
        "title": "Build the stew base",
        "time": 7,
        "desc": "While the cauli roasts, dice the onion, garlic and quarter the mushrooms. Heat a saucepan with a glug of oil and fry the onion until golden (~4 min). Add the mushrooms, garlic and 1 tsp Cajun seasoning and cook for another minute.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3"
        ]
      },
      {
        "title": "Simmer the beans",
        "time": 10,
        "desc": "Tip in the chopped tomatoes, vegetable stock paste and water. Bring to a simmer and let it bubble for 5 minutes. Add 2/3 of the butter beans whole, mash the remaining 1/3 with a fork and stir those in too. Simmer 5 more minutes until thickened.",
        "ingredientKeys": [
          "1-5",
          "1-6",
          "1-7",
          "1-8"
        ]
      },
      {
        "title": "Plate the towers",
        "time": 2,
        "desc": "Stir the chilli powder through the stew and remove from heat. Ladle into bowls and crown with a generous heap of crispy nuggets.",
        "tip": "A blob of cool yoghurt or sour cream cuts the spice if it's too punchy.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "1-4"
        ]
      }
    ]
  },
  /* ============================================================ 7. Dal to my Pie (Slow Cooker) ============================================================ */
  {
    id: 7,
    slug: "dal-to-my-pie-slow-cooker",
    title: "Dal to my Pie (Slow Cooker)",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Indian",
    time: 195,
    difficulty: 1,
    baseServings: 4,
    servingNoun: "serving",
    tags: ["Veg","Curry","Comfort"],
    photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
    fact: {"title":"Did you know?","body":"Baby potatoes pack more vitamin C and potassium per gram than the bigger spuds - they're tiny vitamin pills you can fry, roast or simmer."},
    intro: "A set-and-forget slow cooker dal: baby potatoes, lentils, carrots and Baharat-spiced coconut milk, crowned with golden fried halloumi. Walk away for three hours, walk back to dinner.",
    macros: {"calories":510,"carbs":50,"protein":22,"fat":25,"fibre":9,"sugar":8},
    equipment: ["Slow cooker","Frying pan","Sharp knife","Mixing bowl"],
    ingredientGroups: [
      {
        "name": "Slow cooker",
        "items": [
          {
            "amount": 350,
            "unit": "g",
            "text": "baby potatoes, halved"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "onion, diced"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "carrot, cut into bite-size chunks"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, diced"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "green lentils, drained"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "tomato puree"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "light coconut milk"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          },
          {
            "amount": 100,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 3,
            "unit": "tsp",
            "text": "Baharat seasoning"
          }
        ]
      },
      {
        "name": "To finish",
        "items": [
          {
            "amount": 250,
            "unit": "g",
            "text": "halloumi (or paneer), diced into 2cm cubes"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "olive oil"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat the slow cooker",
        "time": 3,
        "desc": "Switch on your slow cooker (high or low setting depending on how long you have). Dice the onion, garlic and halloumi. Cut the potatoes and carrot into bite-size chunks. Drain and rinse the lentils.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "1-0"
        ]
      },
      {
        "title": "Load it up",
        "time": 5,
        "desc": "Tip everything except the halloumi into the slow cooker - potatoes, onion, carrot, garlic, lentils, tomato puree, coconut milk, stock paste, water and Baharat. Season generously with salt and pepper and stir well.",
        "ingredientKeys": [
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9"
        ]
      },
      {
        "title": "Slow cook",
        "time": 180,
        "desc": "Pop the lid on and walk away. Around 3 hours on high or 5 hours on low. Give it a stir if you pass through the kitchen.",
        "tip": "If it looks too thin towards the end, leave the lid off for the final 20 minutes to reduce.",
        "ingredientKeys": [
          "0-5",
          "0-6",
          "0-7",
          "0-8",
          "0-9"
        ]
      },
      {
        "title": "Fry the halloumi",
        "time": 5,
        "desc": "Heat olive oil in a frying pan over medium-high. Add the halloumi cubes and fry until golden on every side, turning every minute or so (~5 min total).",
        "ingredientKeys": [
          "1-1"
        ]
      },
      {
        "title": "Plate up & serve",
        "time": 2,
        "desc": "Give the dal a final stir and ladle into bowls. Crown with golden halloumi and a fresh grind of black pepper.",
        "tip": "Serve with naan or basmati rice for a heartier meal.",
        "ingredientKeys": [
          "1-1"
        ]
      }
    ]
  },
  /* ============================================================ 8. Harissa Halloumi Hug ============================================================ */
  {
    id: 8,
    slug: "harissa-halloumi-hug",
    title: "Harissa Halloumi Hug",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "North African",
    time: 35,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Mediterranean","Protein"],
    photo: "https://images.unsplash.com/photo-1543353071-873f17a7a088",
    fact: {"title":"Did you know?","body":"Harissa is a fiery North African chilli paste that may help boost metabolism, reduce inflammation, support heart health and fire up your immune system. Spice up your life."},
    intro: "Smoky harissa lentils, jammy tomatoes, salty pan-fried halloumi and crispy ciabatta croutons. A hug-in-a-bowl that comes together in 30 minutes.",
    macros: {"calories":455,"carbs":65.5,"protein":15,"fat":13,"fibre":10,"sugar":6},
    equipment: ["Baking tray","Frying pan (deep)","Frying pan (halloumi)","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Roast",
        "items": [
          {
            "amount": 125,
            "unit": "g",
            "text": "baby plum tomatoes, halved"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "ciabatta loaf, torn into 2cm chunks"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "olive oil"
          }
        ]
      },
      {
        "name": "Harissa lentils",
        "items": [
          {
            "amount": 1,
            "unit": "",
            "text": "red onion, halved and thinly sliced"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, diced"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "green lentils, drained"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "harissa paste"
          },
          {
            "amount": 100,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock cube"
          },
          {
            "amount": 100,
            "unit": "g",
            "text": "baby spinach"
          }
        ]
      },
      {
        "name": "To finish",
        "items": [
          {
            "amount": 250,
            "unit": "g",
            "text": "halloumi, cut into 2cm squares"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & prep",
        "time": 5,
        "desc": "Preheat the oven to 200C. Halve the tomatoes, tear the ciabatta into chunks, slice the onion, dice the garlic, drain and rinse the lentils, and cube the halloumi.",
        "ingredientKeys": [
          "2-0"
        ]
      },
      {
        "title": "Bake & soften",
        "time": 10,
        "desc": "Place tomatoes and ciabatta on a tray, drizzle with oil and a pinch of salt and pepper. Bake until the bread is golden (~8-10 min). Meanwhile, heat oil in a deep frying pan and soften the red onion (~7-8 min).",
        "ingredientKeys": [
          "2-0"
        ]
      },
      {
        "title": "Build the lentil base",
        "time": 5,
        "desc": "Add the garlic to the onion and cook for 1 minute. Pour in the water and crumble in the stock. Bring to the boil, reduce to a simmer (~2 min). Stir in the lentils and harissa paste, return to the boil and cook 2 minutes.",
        "ingredientKeys": [
          "2-0"
        ]
      },
      {
        "title": "Wilt the spinach",
        "time": 3,
        "desc": "Add the spinach in handfuls, stirring until just wilted (~2 min). Take off the heat and stir in the roasted tomatoes - the residual heat will keep them juicy without breaking down.",
        "tip": "If the lentils look dry, add a splash more water - you want it saucy, not stewy.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2"
        ]
      },
      {
        "title": "Fry the halloumi & plate",
        "time": 7,
        "desc": "Heat oil in a fresh frying pan. Add the halloumi cubes and fry until golden on all sides (~3 min per side). Spoon the harissa lentils into bowls, top with the halloumi and scatter the toasted ciabatta over the top.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6"
        ]
      }
    ]
  },
  /* ============================================================ 9. Honey Harissa Root Veg Tray Bake ============================================================ */
  {
    id: 9,
    slug: "honey-harissa-root-veg-tray-bake",
    title: "Honey Harissa Root Veg Tray Bake",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "Mediterranean",
    time: 35,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Mediterranean","Comfort"],
    photo: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f",
    fact: {"title":"Did you know?","body":"Parsnips are the silent superhero of the veg patch - they pack vitamin C to fight off colds and fibre to keep digestion humming. Sweeter than carrots, denser than potatoes, criminally underrated."},
    intro: "Roasted carrots and parsnip glazed in honey-harissa, served over fluffy bulgur wheat with cranberries, vegan feta and toasted almonds. Cosy, sweet-and-spicy, ready in half an hour.",
    macros: {"calories":591,"carbs":79,"protein":11,"fat":25,"fibre":5,"sugar":20},
    equipment: ["Baking tray","Saucepan","Mixing bowl","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Roasted root veg",
        "items": [
          {
            "amount": 2,
            "unit": "",
            "text": "carrots, cut into 1cm batons"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "parsnip, cut into 1cm batons"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "red onion, cut into wedges"
          },
          {
            "amount": 30,
            "unit": "g",
            "text": "harissa paste"
          },
          {
            "amount": 15,
            "unit": "g",
            "text": "honey (use maple to make it vegan)"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "olive oil"
          }
        ]
      },
      {
        "name": "Bulgur base",
        "items": [
          {
            "amount": 120,
            "unit": "g",
            "text": "bulgur wheat"
          },
          {
            "amount": 30,
            "unit": "g",
            "text": "dried cranberries"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "butter (or olive oil)"
          }
        ]
      },
      {
        "name": "To finish",
        "items": [
          {
            "amount": 75,
            "unit": "g",
            "text": "vegan feta (or feta), crumbled"
          },
          {
            "amount": 15,
            "unit": "g",
            "text": "almond flakes"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & make the glaze",
        "time": 5,
        "desc": "Preheat the oven to 200C and boil the kettle. In a small bowl, whisk together the harissa paste, honey, olive oil, salt and pepper - this is your glaze.",
        "ingredientKeys": [
          "0-3",
          "0-4",
          "0-5",
          "1-3"
        ]
      },
      {
        "title": "Tray the veg",
        "time": 10,
        "desc": "Tip the carrots, parsnip and red onion onto a baking tray. Drizzle with a little extra oil, season and toss. Spread into a single layer and roast for ~10 minutes.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2"
        ]
      },
      {
        "title": "Bulgur it up",
        "time": 14,
        "desc": "Pour boiled water into a saucepan with the stock paste and stir. Add the bulgur wheat and cranberries, bring to the boil and simmer for 1 minute. Remove from the heat, lid on, and leave to absorb (12-15 min).",
        "tip": "If you forget to set a timer, just check the bulgur looks fluffy and the water is gone.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      },
      {
        "title": "Glaze and roast on",
        "time": 12,
        "desc": "Turn the veg in the oven, return for another 7 minutes. Drizzle the honey-harissa glaze evenly over the top, then return for a final 5 minutes - the edges should be sticky and caramelised.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      },
      {
        "title": "Bring it together",
        "time": 3,
        "desc": "Stir the butter through the bulgur and fluff with a fork. Divide between bowls, pile the roasted veg on top, drizzle any pan glaze over, then crumble the feta and scatter the almond flakes.",
        "ingredientKeys": [
          "2-0",
          "2-1"
        ]
      }
    ]
  },
  /* ============================================================ 10. Peanut Laksa Soup ============================================================ */
  {
    id: 10,
    slug: "laksa-soup",
    title: "Peanut Laksa Soup",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Malaysian",
    time: 30,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Vegan","Asian","Spicy"],
    photo: "https://images.unsplash.com/photo-1547928576-b822bc410bdf",
    fact: {"title":"Did you know?","body":"Laksa is the result of centuries of cultural mixing in Malaysia and Singapore - fragrant Chinese noodles meeting Malay coconut and chilli. Every region has its own version, and this peanut-rich one is our spin."},
    intro: "Slurpy noodles in a rich, peanutty coconut broth with quick-fried mushrooms and pepper, finished with crushed peanuts and lime. The kind of dinner that fixes a bad day.",
    macros: {"calories":620,"carbs":70,"protein":22,"fat":28,"fibre":7,"sugar":6},
    equipment: ["Saucepan (noodles)","Saucepan (broth)","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Noodles & veg",
        "items": [
          {
            "amount": 3,
            "unit": "nests",
            "text": "egg-free noodles"
          },
          {
            "amount": 150,
            "unit": "g",
            "text": "closed cup mushrooms, sliced"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "bell pepper, sliced"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "ginger and lemongrass paste"
          }
        ]
      },
      {
        "name": "Broth",
        "items": [
          {
            "amount": 1,
            "unit": "tin",
            "text": "light coconut milk"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          },
          {
            "amount": 3,
            "unit": "tbsp",
            "text": "smooth peanut butter"
          },
          {
            "amount": 25,
            "unit": "ml",
            "text": "soy sauce"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "lime juice"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "chilli flakes (or to taste)"
          }
        ]
      },
      {
        "name": "To finish",
        "items": [
          {
            "amount": 2,
            "unit": "",
            "text": "spring onions, sliced"
          },
          {
            "amount": 25,
            "unit": "g",
            "text": "salted peanuts, crushed"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Cook & cool the noodles",
        "time": 5,
        "desc": "Boil the kettle. Cook the noodle nests according to package instructions, drain, then run under cold water to stop the cooking. Tip into a bowl and set aside.",
        "ingredientKeys": [
          "0-0"
        ]
      },
      {
        "title": "Fry the veg base",
        "time": 5,
        "desc": "Heat a saucepan with a splash of oil. Add the mushrooms and pepper and cook until softened (~3 min). Stir in the ginger-lemongrass paste and chilli flakes and cook 1 minute - it should smell like a kitchen in Penang.",
        "ingredientKeys": [
          "0-1",
          "0-2",
          "0-3"
        ]
      },
      {
        "title": "Build the broth",
        "time": 6,
        "desc": "Pour in the coconut milk and stir in the stock paste. Bring to a gentle boil, reduce the heat and stir in the peanut butter until smooth. Simmer for 4 minutes - it will thicken slightly.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      },
      {
        "title": "Reheat the noodles",
        "time": 3,
        "desc": "Tip the cooked noodles into the broth and warm through. Stir in the soy sauce and lime juice, then taste - more soy for salt, more lime for brightness, more chilli for heat.",
        "tip": "The peanut butter base happily takes a tablespoon of brown sugar if you like things sweeter.",
        "ingredientKeys": [
          "1-3",
          "1-4",
          "1-5"
        ]
      },
      {
        "title": "Serve & shower",
        "time": 2,
        "desc": "Ladle into bowls and finish with a generous shower of crushed peanuts and sliced spring onions. Slurp loudly.",
        "ingredientKeys": [
          "2-0",
          "2-1"
        ]
      }
    ]
  },
  /* ============================================================ 11. Linguine Love Affair ============================================================ */
  {
    id: 11,
    slug: "linguine-love-affair",
    title: "Linguine Love Affair",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "Italian",
    time: 25,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Pasta","Italian","Quick"],
    photo: "https://images.unsplash.com/photo-1551183053-bf91a1d81141",
    fact: {"title":"Did you know?","body":"Peas are tiny nutritional powerhouses - high in fibre, protein, vitamins, minerals, and even contain anti-inflammatory compounds. They've been saving the day, one pod at a time."},
    intro: "Silky linguine in a sweet onion-marmalade cream with sweet peas, finished with crunchy almond breadcrumbs and salty pecorino. Date-night food, ready in 25 minutes.",
    macros: {"calories":665,"carbs":106.5,"protein":24,"fat":15.5,"fibre":9.5,"sugar":17},
    equipment: ["Saucepan (pasta)","Frying pan (deep)","Mixing bowl","Grater"],
    ingredientGroups: [
      {
        "name": "Pasta",
        "items": [
          {
            "amount": 180,
            "unit": "g",
            "text": "linguine"
          }
        ]
      },
      {
        "name": "Crunchy topping",
        "items": [
          {
            "amount": 15,
            "unit": "g",
            "text": "almonds, roughly chopped"
          },
          {
            "amount": 20,
            "unit": "g",
            "text": "panko breadcrumbs"
          }
        ]
      },
      {
        "name": "Sauce",
        "items": [
          {
            "amount": 2,
            "unit": "cloves",
            "text": "garlic, grated"
          },
          {
            "amount": 40,
            "unit": "g",
            "text": "onion marmalade"
          },
          {
            "amount": 100,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          },
          {
            "amount": 200,
            "unit": "g",
            "text": "frozen peas"
          },
          {
            "amount": 100,
            "unit": "ml",
            "text": "single cream"
          },
          {
            "amount": 20,
            "unit": "g",
            "text": "Italian-style hard cheese (pecorino), grated"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Get ready to roll",
        "time": 3,
        "desc": "Boil the kettle. Roughly chop the almonds. Grate the garlic. Make up the stock by mixing the stock paste with 100ml hot water.",
        "ingredientKeys": [
          "1-0"
        ]
      },
      {
        "title": "Cook pasta + toast crumbs",
        "time": 9,
        "desc": "Cook the linguine according to package instructions. Meanwhile, heat oil in a frying pan, add the breadcrumbs and almonds and toast for ~3 minutes until golden. Tip onto a plate for later.",
        "tip": "Salt the pasta water like the sea - it's the only chance the pasta has to be seasoned from the inside.",
        "ingredientKeys": [
          "0-0",
          "1-1"
        ]
      },
      {
        "title": "Build the sauce",
        "time": 8,
        "desc": "Return the (now empty) frying pan to a medium heat with a glug of oil. Add the onion marmalade and garlic and stir for 1 minute. Pour in the stock and bring to the boil, reducing for ~4 minutes.",
        "ingredientKeys": [
          "2-0",
          "2-1",
          "2-2",
          "2-3"
        ]
      },
      {
        "title": "Finish with peas & cream",
        "time": 3,
        "desc": "Stir in the peas, cream and a generous grind of pepper. Cook for 2 minutes until just thickened. Drain the linguine and tip straight into the sauce. Add the hard cheese and toss to coat.",
        "ingredientKeys": [
          "2-4",
          "2-5",
          "2-6"
        ]
      },
      {
        "title": "Plate & shower the crumbs",
        "time": 2,
        "desc": "Twirl the pasta into bowls and shower with the toasted almond breadcrumbs - the crunch is the whole point.",
        "tip": "A squeeze of lemon and torn basil takes this even further if you have them.",
        "ingredientKeys": [
          "2-4",
          "2-5",
          "2-6"
        ]
      }
    ]
  },
  /* ============================================================ 12. Mushroom Massaman Curry ============================================================ */
  {
    id: 12,
    slug: "massaman-style-curry",
    title: "Mushroom Massaman Curry",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "Thai",
    time: 30,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Vegan","Curry","Asian","Spicy"],
    photo: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd",
    fact: {"title":"Did you know?","body":"Cashews are an amazing source of copper - a mineral most of us don't think about, but one that's vital for bone health and energy production. So go nuts for cashews."},
    intro: "Two kinds of mushrooms in a creamy peanut-coconut Massaman curry, served over fluffy lime-spiked basmati. Deep, sweet, savoury and ready in half an hour.",
    macros: {"calories":690,"carbs":78,"protein":17,"fat":32,"fibre":6,"sugar":8},
    equipment: ["Saucepan (rice)","Frying pan (deep)","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Rice & nuts",
        "items": [
          {
            "amount": 150,
            "unit": "g",
            "text": "basmati rice"
          },
          {
            "amount": 30,
            "unit": "g",
            "text": "cashew nuts"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "lime, halved"
          }
        ]
      },
      {
        "name": "Curry",
        "items": [
          {
            "amount": 150,
            "unit": "g",
            "text": "closed cup mushrooms, thinly sliced"
          },
          {
            "amount": 2,
            "unit": "",
            "text": "Portobello mushrooms, cut into chunks"
          },
          {
            "amount": 2,
            "unit": "cloves",
            "text": "garlic, sliced"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "Massaman curry paste"
          },
          {
            "amount": 250,
            "unit": "ml",
            "text": "coconut milk"
          },
          {
            "amount": 150,
            "unit": "ml",
            "text": "vegetable stock"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "smooth peanut butter"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep & toast cashews",
        "time": 5,
        "desc": "Boil the kettle and prep the stock. Slice the closed cup mushrooms and garlic, chunk up the Portobellos, halve the lime. Heat a dry frying pan over medium and toast the cashews for 1-2 minutes, shaking constantly. Tip into a bowl.",
        "ingredientKeys": [
          "0-1",
          "0-2"
        ]
      },
      {
        "title": "Cook the rice",
        "time": 12,
        "desc": "Cook the basmati according to package instructions. Squeeze the juice of half a lime into the cooking water for an extra fragrant lift.",
        "ingredientKeys": [
          "0-0"
        ]
      },
      {
        "title": "Brown the mushrooms",
        "time": 4,
        "desc": "Return the frying pan to medium-high heat with a drizzle of oil. Add both kinds of mushrooms and cook until golden brown (~3-4 min), without crowding. Stir in the garlic for the last minute.",
        "ingredientKeys": [
          "0-0"
        ]
      },
      {
        "title": "Build the curry",
        "time": 9,
        "desc": "Stir in the Massaman paste and cook for 1 minute. Pour in the coconut milk and vegetable stock, then whisk in the peanut butter until smooth. Reduce to a low simmer and cook until the sauce has reduced by half (~7-9 min).",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6"
        ]
      },
      {
        "title": "Plate & finish",
        "time": 2,
        "desc": "Take the pan off the heat and squeeze in the juice of the remaining lime half. Spoon the rice into bowls, ladle the curry over and shower with the toasted cashews.",
        "tip": "A handful of fresh coriander or Thai basil at the end is glorious if you have any.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6"
        ]
      }
    ]
  },
  /* ============================================================ 13. Mushroom Stroganoff ============================================================ */
  {
    id: 13,
    slug: "mushroom-stroganoff",
    title: "Mushroom Stroganoff",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "Russian",
    time: 35,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Pasta","Comfort"],
    photo: "https://images.unsplash.com/photo-1565895405127-481853366cf8",
    fact: {"title":"Did you know?","body":"Mushrooms are the only plant source of vitamin D when grown in sunlight - and they're packed with selenium and B vitamins to boost the immune system. Fungi for the win."},
    intro: "Buttery mixed mushrooms, a slug of whisky, mustard and coconut cream simmered with golden onions and tossed through fusilli. A weeknight stroganoff with proper soul.",
    macros: {"calories":600,"carbs":86.5,"protein":16,"fat":13.5,"fibre":5.5,"sugar":7.5},
    equipment: ["Saucepan (pasta)","Frying pan (deep)","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Pasta",
        "items": [
          {
            "amount": 200,
            "unit": "g",
            "text": "fusilli pasta"
          }
        ]
      },
      {
        "name": "Mushrooms & sauce",
        "items": [
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "olive oil"
          },
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "butter"
          },
          {
            "amount": 350,
            "unit": "g",
            "text": "mixed-variety mushrooms, sliced"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "red onion, diced"
          },
          {
            "amount": 2,
            "unit": "cloves",
            "text": "garlic, sliced"
          },
          {
            "amount": 50,
            "unit": "ml",
            "text": "whisky (or dry sherry)"
          },
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "plain flour"
          },
          {
            "amount": 75,
            "unit": "ml",
            "text": "vegetable stock"
          },
          {
            "amount": 200,
            "unit": "ml",
            "text": "coconut milk (or single cream)"
          },
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "Dijon mustard"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep & boil",
        "time": 5,
        "desc": "Boil the kettle. Slice the mushrooms and garlic, dice the onion and prepare the vegetable stock with hot water."
      },
      {
        "title": "Cook pasta + golden mushrooms",
        "time": 10,
        "desc": "Cook the pasta according to package instructions. Heat the oil and butter in a frying pan, add the mushrooms with a pinch of salt and pepper, and fry until golden (~6-7 min). Lift the mushrooms onto a plate and set aside.",
        "tip": "Don't move them too much - mushrooms need contact time with the pan to brown rather than steam.",
        "ingredientKeys": [
          "0-0"
        ]
      },
      {
        "title": "Soften the onions, deglaze",
        "time": 8,
        "desc": "Reduce the heat slightly. Fry the onion in the same pan until tender and slightly golden (~7 min). Add the garlic for 30 seconds. Pour in the whisky and let it bubble until the liquid has reduced by half - it'll smell incredible.",
        "ingredientKeys": [
          "0-0"
        ]
      },
      {
        "title": "Make the sauce",
        "time": 12,
        "desc": "Stir in the flour and mix until you have a paste. Pour in the stock while stirring and bring to the boil. Return the mushrooms, then add the coconut milk and Dijon mustard. Simmer over low heat for ~10 minutes.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7",
          "1-8",
          "1-9"
        ]
      },
      {
        "title": "Toss with pasta",
        "time": 2,
        "desc": "Take the pan off the heat. Drain the pasta and tip straight into the sauce. Toss to coat, taste for salt and pepper, and serve.",
        "tip": "A handful of chopped flat-leaf parsley at the end keeps things looking fresh.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7",
          "1-8",
          "1-9"
        ]
      }
    ]
  },
  /* ============================================================ 14. Oat & Banana Pancakes ============================================================ */
  {
    id: 14,
    slug: "oat-banana-pancakes",
    title: "Oat & Banana Pancakes",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "American",
    time: 20,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Breakfast","Vegan","Light","Quick"],
    photo: "https://images.unsplash.com/photo-1528207776546-365bb710ee93",
    fact: {"title":"Did you know?","body":"Oats are one of the few grains containing beta-glucan, a soluble fibre proven to lower cholesterol and stabilise blood sugar. Fluffy stack, calm energy."},
    intro: "Three-bowl, no-egg, no-dairy pancakes powered by oats and ripe banana. Soft on the inside, crisp at the edges, with pops of frozen raspberry that go jammy in the pan.",
    macros: {"calories":333,"carbs":61.5,"protein":7,"fat":4.5,"fibre":6,"sugar":10},
    equipment: ["Blender (or mashing fork)","Mixing bowl","Frying pan (non-stick)","Spatula"],
    ingredientGroups: [
      {
        "name": "Pancake batter",
        "items": [
          {
            "amount": 135,
            "unit": "g",
            "text": "rolled oats (GF if needed)"
          },
          {
            "amount": 140,
            "unit": "ml",
            "text": "almond milk"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "ripe banana"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "fine salt"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "baking powder"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "maple syrup"
          },
          {
            "amount": 30,
            "unit": "g",
            "text": "frozen raspberries"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Blitz the batter",
        "time": 4,
        "desc": "Tip the oats, almond milk, banana, salt, baking powder and maple syrup into a blender. Blitz until completely smooth - the batter should be thick but pourable. No blender? Mash the banana, then whisk everything together vigorously.",
        "tip": "Let the batter rest for 5 minutes - the oats absorb the liquid and the texture goes from gluey to plush.",
        "ingredientKeys": ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5"]
      },
      {
        "title": "Heat the pan",
        "time": 2,
        "desc": "Place a non-stick frying pan over medium heat. A drop of water should sizzle and disappear - that's your cue. Lightly grease with a little oil.",
        "ingredientKeys": ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5"]
      },
      {
        "title": "Pour & stud with raspberries",
        "time": 4,
        "desc": "Spoon a generous tablespoon of batter into the pan to make rounds about 8cm wide. Push 3-4 frozen raspberries gently into each pancake while the top is still wet.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6"
        ]
      },
      {
        "title": "Flip when bubbled",
        "time": 6,
        "desc": "Cook for ~2 minutes until bubbles set on the surface and the edges look dry. Flip carefully and cook another 60-90 seconds until golden. Transfer to a warm plate while you cook the rest.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6"
        ]
      },
      {
        "title": "Stack & top",
        "time": 4,
        "desc": "Stack into towers and top however you like - extra maple syrup, fresh berries, yoghurt, peanut butter, a dusting of cinnamon. Eat immediately.",
        "tip": "These freeze brilliantly - layer with greaseproof and reheat from frozen in the toaster.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "0-5",
          "0-6"
        ]
      }
    ]
  },
  /* ============================================================ 15. Refried Bean & Halloumi Tacos ============================================================ */
  {
    id: 15,
    slug: "refried-bean-halloumi-tacos",
    title: "Refried Bean & Halloumi Tacos",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Mexican",
    time: 25,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Mexican","Protein"],
    photo: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b",
    fact: {"title":"Did you know?","body":"Black beans are the secret agents of nutrition: ordinary-looking but packing a stealthy punch of protein, fibre and antioxidants. Always ready to make your meal un-bean-lievably healthy."},
    intro: "Smoky chipotle black beans, golden halloumi cubes and crisp lettuce piled into warm corn tortillas, with a quick chipotle-mayo to finish. 25-minute taco night.",
    macros: {"calories":741,"carbs":90,"protein":17,"fat":33,"fibre":15,"sugar":4},
    equipment: ["Saucepan","Frying pan","Mixing bowl","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Refried beans",
        "items": [
          {
            "amount": 1,
            "unit": "tin",
            "text": "black beans, drained"
          },
          {
            "amount": 3,
            "unit": "cloves",
            "text": "garlic, diced"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "tomato puree"
          },
          {
            "amount": 100,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "chipotle paste (split: 1 for beans, 1 for mayo)"
          }
        ]
      },
      {
        "name": "Halloumi & build",
        "items": [
          {
            "amount": 250,
            "unit": "g",
            "text": "halloumi, cut into bite-size chunks"
          },
          {
            "amount": 4,
            "unit": "",
            "text": "corn tortillas"
          },
          {
            "amount": 1,
            "unit": "head",
            "text": "baby gem lettuce, shredded"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "mayonnaise"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "lime juice"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & prep",
        "time": 5,
        "desc": "Preheat the oven to 180C. Chop the lettuce and halloumi. Drain the black beans, then mash about half of them with the back of a fork - keep some whole for texture. Peel and dice the garlic.",
        "ingredientKeys": [
          "0-0",
          "0-1"
        ]
      },
      {
        "title": "Cook the beans",
        "time": 5,
        "desc": "Heat a glug of oil in a saucepan. Add the garlic and tomato puree and cook for 1 minute. Add the half-mashed beans and water, stir well and let it bubble for 4 minutes.",
        "ingredientKeys": [
          "0-2",
          "0-3"
        ]
      },
      {
        "title": "Spice & fry",
        "time": 5,
        "desc": "Stir 1 tsp chipotle paste into the beans and cook another 3 minutes. Meanwhile heat a frying pan with oil and fry the halloumi until golden on every side. Pop the corn tortillas in the oven for 2 minutes to warm through.",
        "tip": "If the beans look thick, splash in more water - you want them spreadable, not stodgy.",
        "ingredientKeys": [
          "0-4"
        ]
      },
      {
        "title": "Whip the chipotle mayo",
        "time": 2,
        "desc": "In a small bowl, mix the mayonnaise with the remaining 1 tsp chipotle paste. Loosen with a teaspoon of water if needed.",
        "ingredientKeys": [
          "0-4"
        ]
      },
      {
        "title": "Build & lime",
        "time": 3,
        "desc": "Take everything off the heat and pull the tortillas out of the oven. Schmear each tortilla with beans, top with halloumi, scatter on the lettuce, drizzle with chipotle mayo. Squeeze lime over everything before eating.",
        "tip": "A pinch of fresh coriander and a few rings of pickled red onion are a great upgrade.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4"
        ]
      }
    ]
  },
  /* ============================================================ 16. Roasted Aubergine Greek Salad ============================================================ */
  {
    id: 16,
    slug: "roasted-salad",
    title: "Roasted Aubergine Greek Salad",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "Greek",
    time: 30,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Mediterranean","Light"],
    photo: "https://images.unsplash.com/photo-1544025162-d76694265947",
    fact: {"title":"Did you know?","body":"Aubergine is technically a berry - and one of the few purple foods that holds onto its colour after cooking thanks to nasunin, a powerful antioxidant. Undercover fruit, plate-stealer."},
    intro: "Sticky roast aubergine, jammy tomatoes, lentils dressed in balsamic, ciabatta crouton crunch, salty feta and a dollop of cool yoghurt. A loaded warm salad that tastes like a Greek summer.",
    macros: {"calories":522,"carbs":64,"protein":18,"fat":19,"fibre":17,"sugar":17},
    equipment: ["Baking tray","Frying pan","Mixing bowl","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Roast",
        "items": [
          {
            "amount": 1,
            "unit": "",
            "text": "aubergine, cut into bite-size chunks"
          },
          {
            "amount": 125,
            "unit": "g",
            "text": "baby plum tomatoes, halved"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "ciabatta roll, torn into chunks"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "olive oil"
          }
        ]
      },
      {
        "name": "Lentils",
        "items": [
          {
            "amount": 1,
            "unit": "tin",
            "text": "green lentils, drained"
          },
          {
            "amount": 3,
            "unit": "cloves",
            "text": "garlic, diced"
          },
          {
            "amount": 4,
            "unit": "",
            "text": "sundried tomatoes, diced"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "balsamic vinegar"
          }
        ]
      },
      {
        "name": "To serve",
        "items": [
          {
            "amount": 50,
            "unit": "g",
            "text": "feta, crumbled"
          },
          {
            "amount": 100,
            "unit": "g",
            "text": "baby leaf salad"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "Greek-style yoghurt"
          },
          {
            "amount": 10,
            "unit": "g",
            "text": "flaked almonds"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & prep",
        "time": 5,
        "desc": "Preheat the oven to 220C. Chop the aubergine, halve the tomatoes, tear the ciabatta into chunks, dice the garlic and sundried tomatoes. Drain the lentils.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2"
        ]
      },
      {
        "title": "Roast aubergine + tomatoes",
        "time": 10,
        "desc": "Spread the aubergine and tomatoes on a baking tray (leaving room for the bread later). Drizzle with oil and season generously. Roast for ~10 minutes.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-3"
        ]
      },
      {
        "title": "Toast almonds & garlic-lentils",
        "time": 6,
        "desc": "Heat a frying pan and add the flaked almonds, stirring constantly until golden (~3 min). Tip into a bowl. Add a glug of oil to the pan, the garlic and lentils, and cook 2-3 minutes to warm through.",
        "ingredientKeys": [
          "2-3"
        ]
      },
      {
        "title": "Add ciabatta + dress lentils",
        "time": 6,
        "desc": "Add the ciabatta to the oven for the remaining 6 minutes until crisp and golden. Meanwhile, in a big bowl whisk balsamic vinegar, sundried tomatoes and 1 tbsp olive oil. Tip in the lentils and stir to coat.",
        "ingredientKeys": [
          "1-3"
        ]
      },
      {
        "title": "Bring it together",
        "time": 3,
        "desc": "Add the roasted aubergine and tomatoes to the bowl, toss with the baby leaf salad, then divide between bowls. Top with crispy ciabatta, toasted almonds, crumbled feta and a generous dollop of yoghurt.",
        "tip": "A pinch of dried oregano over the top is a Greek-salad shortcut to authenticity.",
        "ingredientKeys": [
          "0-2",
          "2-0",
          "2-1",
          "2-2"
        ]
      }
    ]
  },
  /* ============================================================ 17. Smokin' Hot Bean Stew ============================================================ */
  {
    id: 17,
    slug: "smokin-hot-bean-stew",
    title: "Smokin' Hot Bean Stew",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "Mexican",
    time: 35,
    difficulty: 1,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Mexican","Spicy"],
    photo: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec",
    fact: {"title":"Did you know?","body":"Chipotle paste is made from smoke-dried jalapenos - so a little spoonful gives you smokiness without firing up the BBQ. The chilli grown-up of the cupboard."},
    intro: "Roasted bell peppers and a tin of mixed beans simmered in chipotle, smoked paprika and chopped tomatoes - plus crispy oven tortilla chips for shovelling. Fast, fiery, freezer-friendly.",
    macros: {"calories":540,"carbs":78,"protein":18,"fat":13,"fibre":14,"sugar":14},
    equipment: ["Baking tray (peppers)","Baking tray (tortillas)","Saucepan","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Roast & crisp",
        "items": [
          {
            "amount": 2,
            "unit": "",
            "text": "bell peppers, sliced"
          },
          {
            "amount": 3,
            "unit": "",
            "text": "tortilla wraps, cut into triangles"
          }
        ]
      },
      {
        "name": "Stew",
        "items": [
          {
            "amount": 1,
            "unit": "",
            "text": "red onion, thinly sliced"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, sliced"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "mixed beans, drained"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "chopped tomatoes"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "tomato puree"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "chipotle paste"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "smoked paprika"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "lime juice"
          }
        ]
      },
      {
        "name": "To serve",
        "items": [
          {
            "amount": 50,
            "unit": "g",
            "text": "Greek-style salad cheese (feta), crumbled"
          },
          {
            "amount": 2,
            "unit": "",
            "text": "spring onions, sliced"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & prep",
        "time": 5,
        "desc": "Preheat the oven to 200C. Slice the red onion, garlic, spring onions and bell peppers. Drain the mixed beans. Cut the tortilla wraps into triangles.",
        "ingredientKeys": [
          "2-1"
        ]
      },
      {
        "title": "Roast the peppers",
        "time": 17,
        "desc": "Spread the peppers on a baking tray, drizzle with oil, season and roast for ~15-18 minutes until they're soft and the edges are charred.",
        "ingredientKeys": [
          "2-1"
        ]
      },
      {
        "title": "Build the stew",
        "time": 14,
        "desc": "Heat a saucepan with a glug of oil. Add the red onion and cook until soft (~4 min). Add the garlic, chipotle paste, tomato puree and smoked paprika and stir for 30 seconds. Pour in the chopped tomatoes, mixed beans and vegetable stock paste, reduce the heat and simmer for ~10 minutes.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7"
        ]
      },
      {
        "title": "Crisp the tortillas",
        "time": 5,
        "desc": "Spread the tortilla triangles on a separate tray, season with salt and bake in the oven until crispy and golden (~5 min).",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7"
        ]
      },
      {
        "title": "Bring it together",
        "time": 3,
        "desc": "Stir the roasted peppers and lime juice into the stew. Taste for seasoning. Ladle into bowls, top with crumbled feta and spring onions, and dunk the tortilla crisps in and out as you eat.",
        "tip": "A spoonful of yoghurt or sour cream cools the chipotle heat - keep it nearby.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "1-8",
          "2-0"
        ]
      }
    ]
  },
  /* ============================================================ 18. Spicy Tofu Rice Bowl ============================================================ */
  {
    id: 18,
    slug: "spicy-tofu-rice-bowl",
    title: "Spicy Tofu Rice Bowl",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Korean-style",
    time: 30,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Vegan","Asian","Protein","Spicy"],
    photo: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    fact: {"title":"Did you know?","body":"Tenderstem broccoli is a happy accident - a hybrid of broccoli and Chinese kale invented in California in the 1990s. Sweeter, milder and much faster to cook than the standard florets."},
    intro: "Crispy tofu in a sticky bulgogi-style sauce, garlicky tenderstem, quick-pickled carrot ribbons and sesame jasmine rice. Bright, spicy and ridiculously satisfying.",
    macros: {"calories":555,"carbs":70,"protein":28,"fat":17,"fibre":8,"sugar":8},
    equipment: ["Saucepan (rice)","Frying pan (deep)","Mixing bowl","Vegetable peeler"],
    ingredientGroups: [
      {
        "name": "Rice & pickle",
        "items": [
          {
            "amount": 150,
            "unit": "g",
            "text": "jasmine rice"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "carrot, peeled into ribbons"
          },
          {
            "amount": 15,
            "unit": "ml",
            "text": "rice vinegar"
          },
          {
            "amount": 0.5,
            "unit": "tsp",
            "text": "caster sugar"
          }
        ]
      },
      {
        "name": "Greens",
        "items": [
          {
            "amount": 80,
            "unit": "g",
            "text": "tenderstem broccoli, thick stems halved"
          },
          {
            "amount": 2,
            "unit": "cloves",
            "text": "garlic, sliced"
          }
        ]
      },
      {
        "name": "Crispy tofu & sauce",
        "items": [
          {
            "amount": 280,
            "unit": "g",
            "text": "firm tofu, cubed and patted dry"
          },
          {
            "amount": 0.5,
            "unit": "tbsp",
            "text": "chilli paste (gochujang or sriracha)"
          },
          {
            "amount": 15,
            "unit": "ml",
            "text": "soy sauce (split: 7ml for rice, the rest for sauce)"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "maple syrup (or brown sugar)"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "rice vinegar (extra)"
          },
          {
            "amount": 2,
            "unit": "tsp",
            "text": "sesame seeds"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "sesame oil (optional)"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep & quick pickle",
        "time": 5,
        "desc": "Boil the kettle. Slice the garlic and halve any thick tenderstem stems. Peel the carrot into ribbons. Pop ribbons into a bowl with the rice vinegar, sugar and a pinch of salt - they pickle while you cook the rest.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "2-4"
        ]
      },
      {
        "title": "Cook the rice",
        "time": 12,
        "desc": "Cook the jasmine rice according to package instructions and keep warm in the pan with a lid on.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "2-4"
        ]
      },
      {
        "title": "Fry the greens",
        "time": 5,
        "desc": "Heat oil in a frying pan, add the tenderstem broccoli and fry for 2 minutes. Stir in the garlic, then add a splash of water and cover for another 2 minutes until tender. Season, lift onto a plate.",
        "ingredientKeys": [
          "1-0",
          "1-1"
        ]
      },
      {
        "title": "Crisp the tofu",
        "time": 9,
        "desc": "Place the pan back on heat with a generous drizzle of oil. Add the cubed tofu and fry, turning every minute or two, until crispy on every side (~7-9 min). Don't crowd it - it needs space to colour.",
        "tip": "Patting the tofu dry with kitchen paper before it hits the pan is the difference between crisp and soggy.",
        "ingredientKeys": [
          "2-0"
        ]
      },
      {
        "title": "Sauce, sesame & plate",
        "time": 4,
        "desc": "Once golden, pour in the chilli paste, 8ml of the soy sauce, maple syrup and rice vinegar. Toss to coat the tofu and let the sauce reduce for 1 minute. Stir 7ml soy sauce through the rice. Bowl up rice, then pile on tofu, broccoli and pickled carrots. Shower with sesame seeds and a drizzle of sesame oil.",
        "ingredientKeys": [
          "2-1",
          "2-2",
          "2-3",
          "2-5",
          "2-6"
        ]
      }
    ]
  },
  /* ============================================================ 19. Rice & Shine - Sundried Tomato Risotto ============================================================ */
  {
    id: 19,
    slug: "sundried-tomato-risotto",
    title: "Rice & Shine - Sundried Tomato Risotto",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "Italian",
    time: 40,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Italian","Comfort"],
    photo: "https://images.unsplash.com/photo-1476124369491-e7addf5db371",
    fact: {"title":"Did you know?","body":"Sun-dried tomatoes have one of the highest concentrations of lycopene of any food - a powerful antioxidant linked to skin and heart protection. Eat them, and they protect you from becoming a sundried tomato yourself."},
    intro: "Slow-stirred risotto laced with sundried tomatoes, crowned with charred asparagus, tenderstem and burst tomatoes. The dinner you make when you want to feel like you're at a tiny Italian bistro at home.",
    macros: {"calories":481,"carbs":86.5,"protein":13,"fat":8.5,"fibre":7,"sugar":5.5},
    equipment: ["Baking tray","Saucepan (stock)","Frying pan (deep)","Sharp knife"],
    ingredientGroups: [
      {
        "name": "Risotto base",
        "items": [
          {
            "amount": 175,
            "unit": "g",
            "text": "risotto rice"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "brown onion, finely diced"
          },
          {
            "amount": 3,
            "unit": "cloves",
            "text": "garlic, finely diced"
          },
          {
            "amount": 5,
            "unit": "",
            "text": "sundried tomatoes, chopped"
          },
          {
            "amount": 750,
            "unit": "ml",
            "text": "boiling water"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          }
        ]
      },
      {
        "name": "Roasted greens",
        "items": [
          {
            "amount": 200,
            "unit": "g",
            "text": "asparagus tips, trimmed and halved"
          },
          {
            "amount": 200,
            "unit": "g",
            "text": "tenderstem broccoli, halved"
          },
          {
            "amount": 100,
            "unit": "g",
            "text": "baby plum tomatoes, halved"
          }
        ]
      },
      {
        "name": "To finish",
        "items": [
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "butter"
          },
          {
            "amount": 20,
            "unit": "g",
            "text": "Italian-style hard cheese (pecorino), grated"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "balsamic vinegar"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep & boil",
        "time": 5,
        "desc": "Boil the kettle and preheat the oven to 220C. Dice the onion and garlic. Trim the asparagus, halve the tenderstem broccoli and tomatoes. Place all the greens on a baking tray. In a saucepan, mix the boiling water with the stock paste and keep on a low simmer.",
        "ingredientKeys": [
          "0-1",
          "0-2",
          "0-4",
          "0-5"
        ]
      },
      {
        "title": "Soften aromatics & toast rice",
        "time": 5,
        "desc": "Heat a glug of oil in a deep frying pan over medium heat. Cook the onion until softened (~3-4 min). Add the garlic and sundried tomatoes for 1 minute. Tip in the risotto rice and stir for 1-2 minutes until the grains are glossy and slightly translucent at the edges.",
        "ingredientKeys": [
          "0-0",
          "0-3"
        ]
      },
      {
        "title": "Stock + stir",
        "time": 20,
        "desc": "Ladle in 100ml of stock at a time, stirring occasionally and waiting for the rice to absorb the liquid before adding more. Continue for around 18-20 minutes until the rice is al dente.",
        "tip": "Don't stir constantly - just every minute or two, so the starch releases for that creamy texture without the rice gluing together.",
        "ingredientKeys": [
          "0-0",
          "0-3"
        ]
      },
      {
        "title": "Roast the greens",
        "time": 10,
        "desc": "While the risotto cooks, drizzle the asparagus, broccoli and tomatoes with oil, season and roast for ~10 minutes until tender and slightly charred.",
        "ingredientKeys": [
          "0-0",
          "0-3"
        ]
      },
      {
        "title": "Mantecare & plate",
        "time": 3,
        "desc": "Take the risotto off the heat. Stir through the butter and 2/3 of the cheese - this is the mantecare step that makes it silky. Spoon into bowls, top with the roasted greens, drizzle with balsamic and shower with the rest of the cheese.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "2-0",
          "2-1",
          "2-2"
        ]
      }
    ]
  },
  /* ============================================================ 20. Welsh Shepherd's Pie ============================================================ */
  {
    id: 20,
    slug: "welsh-shepherds-pie",
    title: "Welsh Shepherd's Pie",
    author: "Sam Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Comfort & Curry",
    cuisine: "British",
    time: 60,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Comfort","British"],
    photo: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb",
    fact: {"title":"Did you know?","body":"Dijon mustard came from the city of Dijon, France, in 1856 - made with brown mustard seeds instead of the milder yellow ones. A teaspoon adds a sharpness that makes a creamy mash sing."},
    intro: "A vegetarian shepherd's pie with green lentils, mushrooms and red wine, hidden under a generous mash and a layer of mustard-cheddar cream. Pure pub-on-a-cold-Sunday energy.",
    macros: {"calories":720,"carbs":75,"protein":25,"fat":30,"fibre":14,"sugar":10},
    equipment: ["Saucepan (potatoes)","Frying pan (deep)","Ovenproof dish","Potato masher","Grater"],
    ingredientGroups: [
      {
        "name": "Mash",
        "items": [
          {
            "amount": 450,
            "unit": "g",
            "text": "baby potatoes, chopped"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "butter"
          }
        ]
      },
      {
        "name": "Lentil filling",
        "items": [
          {
            "amount": 150,
            "unit": "g",
            "text": "mushrooms, sliced"
          },
          {
            "amount": 2,
            "unit": "cloves",
            "text": "garlic, sliced"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "green lentils, drained"
          },
          {
            "amount": 5,
            "unit": "",
            "text": "sundried tomatoes, chopped"
          },
          {
            "amount": 250,
            "unit": "ml",
            "text": "tomato passata"
          },
          {
            "amount": 5,
            "unit": "tbsp",
            "text": "red wine"
          },
          {
            "amount": 75,
            "unit": "ml",
            "text": "vegetable stock"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "soy sauce"
          }
        ]
      },
      {
        "name": "Mustard-cheddar topping",
        "items": [
          {
            "amount": 60,
            "unit": "g",
            "text": "cheddar, grated"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "Dijon mustard"
          },
          {
            "amount": 150,
            "unit": "ml",
            "text": "single cream (or coconut cream)"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Prep & boil",
        "time": 5,
        "desc": "Boil the kettle and preheat the oven to 220C. Chop the potatoes into small chunks. Slice the garlic and mushrooms. Drain and rinse the lentils."
      },
      {
        "title": "Cook potatoes + brown mushrooms",
        "time": 14,
        "desc": "Add the potatoes to a saucepan of boiling water and cook until tender (~12-15 min). Meanwhile heat oil in a frying pan, add the mushrooms with a pinch of salt and pepper, and fry until brown (~5 min)."
      },
      {
        "title": "Build the lentil filling",
        "time": 12,
        "desc": "Add the soy sauce to the mushrooms and stir for 1 minute. Add the garlic and sundried tomatoes, then pour in the tomato passata, red wine, vegetable stock and lentils. Bring to the boil, then simmer until thickened (~9 min). Taste and season.",
        "ingredientKeys": [
          "1-0",
          "1-1",
          "1-2",
          "1-3",
          "1-4",
          "1-5",
          "1-6",
          "1-7"
        ]
      },
      {
        "title": "Mash & mix the topping",
        "time": 5,
        "desc": "Drain the cooked potatoes and mash with the butter, salt and pepper. In a small bowl, mix the cheddar, mustard and cream with salt and pepper - this gets spread over the top.",
        "tip": "A splash of milk or olive oil makes the mash extra silky if you have it.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "2-0",
          "2-1",
          "2-2"
        ]
      },
      {
        "title": "Assemble & bake",
        "time": 18,
        "desc": "Tip the lentil filling into an ovenproof dish. Top with a layer of mash and spread the mustard-cheddar mix over the top. Bake for 15-18 minutes until the top is golden brown. Rest 3 minutes before serving.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "2-0",
          "2-1",
          "2-2"
        ]
      }
    ]
  },
  /* ============================================================ 21. You Are the Dal to my Pie ============================================================ */
  {
    id: 21,
    slug: "you-are-the-dal-to-my-pie",
    title: "You Are the Dal to my Pie",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Indian",
    time: 50,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Curry","Comfort"],
    photo: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
    fact: {"title":"Did you know?","body":"Lentils have been cultivated for over 9,000 years - they were one of the very first crops humans domesticated. They're a complete plant protein when paired with rice or grains, and they've been doing it longer than us."},
    intro: "A hands-on, oven-baked dal-pie hybrid: golden halloumi, soft baby potatoes, lentils and carrots in a creamy Baharat coconut sauce, baked until bubbling. Faster than the slow cooker version, just as comforting.",
    macros: {"calories":620,"carbs":56,"protein":24,"fat":30,"fibre":11,"sugar":9},
    equipment: ["Frying pan (deep)","Ovenproof dish","Sharp knife","Mixing bowl"],
    ingredientGroups: [
      {
        "name": "Pie filling",
        "items": [
          {
            "amount": 350,
            "unit": "g",
            "text": "baby potatoes, halved"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "onion, diced"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "carrot, cut into bite-size chunks"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, diced"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "green lentils, drained"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "tomato puree"
          },
          {
            "amount": 3,
            "unit": "tsp",
            "text": "Baharat seasoning"
          },
          {
            "amount": 1,
            "unit": "tin",
            "text": "light coconut milk"
          },
          {
            "amount": 100,
            "unit": "ml",
            "text": "water"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "vegetable stock paste"
          }
        ]
      },
      {
        "name": "To finish",
        "items": [
          {
            "amount": 250,
            "unit": "g",
            "text": "halloumi (or paneer), diced"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Preheat & prep",
        "time": 5,
        "desc": "Preheat the oven to 220C. Dice the onion, halloumi and garlic. Cut the potatoes and carrot into bite-size chunks. Drain and rinse the lentils. Heat a glug of oil in a deep frying pan.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "1-0"
        ]
      },
      {
        "title": "Fry the halloumi",
        "time": 6,
        "desc": "Once the oil is hot, add the halloumi and a pinch of salt and pepper. Fry until golden on all sides (~5 min), turning regularly to avoid burning. Lift onto a plate.",
        "ingredientKeys": [
          "0-0",
          "0-1",
          "0-2",
          "0-3",
          "0-4",
          "1-0"
        ]
      },
      {
        "title": "Build the curry base",
        "time": 9,
        "desc": "Return the pan to a medium heat with more oil. Fry the onion and carrot until soft (~5 min). Add the garlic, tomato puree and Baharat seasoning and stir for 1 minute. Return the halloumi to the pan.",
        "ingredientKeys": [
          "0-5",
          "0-6"
        ]
      },
      {
        "title": "Simmer the dal",
        "time": 9,
        "desc": "Pour in the coconut milk, water, stock paste, potatoes and lentils. Bring to the boil, then reduce to a simmer and cook until thickened (~7 min). Taste and season - add a splash more water if it looks dry.",
        "tip": "If you like it thicker, mash a few of the potato chunks with the back of a spoon - they'll stew the sauce naturally.",
        "ingredientKeys": [
          "0-7",
          "0-8",
          "0-9"
        ]
      },
      {
        "title": "Bake & rest",
        "time": 18,
        "desc": "Tip the mixture into an ovenproof dish, season again if needed, and bake until the potatoes are tender all the way through and the top is bubbling and golden (~15-20 min). Let it rest 3 minutes before serving with naan or rice.",
        "ingredientKeys": [
          "0-7",
          "0-8",
          "0-9"
        ]
      }
    ]
  },
  /* ============================================================ 22. Tempeh Teriyaki Rice Bowl ============================================================ */
  {
    id: 22,
    slug: "tempeh-teriyaki-rice-bowl",
    title: "Tempeh Teriyaki Rice Bowl",
    author: "Sam & Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "The Mackinley Kitchen",
    cuisine: "Japanese",
    time: 40,
    difficulty: 2,
    baseServings: 2,
    servingNoun: "serving",
    tags: ["Veg","Protein","Quick"],
    photo: "https://images.unsplash.com/photo-1546069901-ba9599a0e63c",
    fact: {"title":"Did you know?","body":"Tempeh is fermented whole soybeans pressed into a firm block — higher in protein and fibre than tofu, with a nutty depth that crisps beautifully in a hot pan."},
    intro: "Nutty, crumbled tempeh meets a quick teriyaki-style sauce in this one-pan rice bowl. Brown rice, broccoli, edamame and peas make it filling; spring onion, chilli and sesame seeds finish it bright.",
    macros: {"calories":520,"carbs":58,"protein":22,"fat":22,"fibre":9,"sugar":12},
    equipment: ["Saucepan","Small bowl","Non-stick frying pan","Wok or large frying pan"],
    ingredientGroups: [
      {
        "name": "Main",
        "items": [
          {
            "amount": 300,
            "unit": "g",
            "text": "brown rice"
          },
          {
            "amount": 0.5,
            "unit": "",
            "text": "vegetable stock cube"
          },
          {
            "amount": 300,
            "unit": "g",
            "text": "block of tempeh"
          },
          {
            "amount": 2,
            "unit": "tbsp",
            "text": "sesame oil"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "tamari"
          },
          {
            "amount": 1,
            "unit": "bunch",
            "text": "spring onions, white and green parts finely chopped"
          },
          {
            "amount": 1,
            "unit": "",
            "text": "thumb-sized piece of fresh ginger, peeled and minced"
          },
          {
            "amount": 4,
            "unit": "cloves",
            "text": "garlic, minced"
          },
          {
            "amount": 0.5,
            "unit": "",
            "text": "mild red chilli, finely chopped (½–1, to taste), plus more to serve"
          },
          {
            "amount": 150,
            "unit": "g",
            "text": "Tenderstem broccoli, stems roughly chopped into 2cm (¾ in) pieces"
          },
          {
            "amount": 80,
            "unit": "g",
            "text": "frozen edamame beans"
          },
          {
            "amount": 80,
            "unit": "g",
            "text": "frozen peas"
          },
          {
            "amount": 0,
            "unit": "",
            "text": "sesame seeds, to serve"
          }
        ]
      },
      {
        "name": "Quick teriyaki-style sauce",
        "items": [
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "sesame oil"
          },
          {
            "amount": 2.5,
            "unit": "tbsp",
            "text": "tamari"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "maple or agave syrup"
          },
          {
            "amount": 1,
            "unit": "tbsp",
            "text": "mirin (rice wine)"
          },
          {
            "amount": 1,
            "unit": "tsp",
            "text": "toasted sesame oil"
          }
        ]
      }
    ]
,
    steps: [
      {
        "title": "Cook the rice",
        "time": 25,
        "desc": "Cook the brown rice according to the packet instructions, with the vegetable stock cube if you like for extra flavour.",
        "tip": "Rinse the rice first for fluffier grains. Start this first — it can sit covered while you stir-fry.",
        "ingredientKeys": ["0-0", "0-1"]
      },
      {
        "title": "Mix the teriyaki sauce",
        "time": 2,
        "desc": "In a small bowl, mix together all the quick teriyaki sauce ingredients. Set aside.",
        "ingredientGroupNames": [
          "Quick teriyaki-style sauce"
        ]
      },
      {
        "title": "Crisp the tempeh",
        "time": 8,
        "desc": "Over a small bowl, crumble the tempeh into small chunks with your hands. Heat 1 tablespoon of the sesame oil in a non-stick frying pan on a medium–high heat and, once hot, add the tempeh. Fry for 5 minutes until browning. Add the tamari and mix well. Taste and add a little more tamari if you think it needs more salt.",
        "tip": "Crumbling over a bowl catches any crumbs — you want small, even pieces so every bite gets crispy edges.",
        "ingredientKeys": ["0-2", "0-3", "0-4"]
      },
      {
        "title": "Stir-fry the bowl",
        "time": 10,
        "desc": "In a wok or frying pan, add the remaining sesame oil and fry the spring onion whites, ginger, garlic and chilli for 3–4 minutes until fragrant. Add the broccoli and stir-fry for 3–4 minutes until it turns bright green. Add the cooked rice, edamame and peas (straight from frozen is fine — they will thaw in the pan), then tip in the sauce. Mix well, then add the cooked tempeh and heat through.",
        "ingredientKeys": ["0-5", "0-6", "0-7", "0-8", "0-9", "0-10", "0-11"]
      },
      {
        "title": "Serve",
        "time": 2,
        "desc": "Divide into bowls and serve topped with extra chilli, the spring onion greens and sesame seeds.",
        "ingredientKeys": ["0-12"]
      }
    ]
  },
  /* ============================================================ 23. Verborgen Schat - Bosbessenmuffins (NL limited edition of #2) ============================================================ */
  {
    id: 23,
    slug: "berried-treasure-blueberry-muffins-nl",
    title: "Verborgen Schat - Bosbessenmuffins",
    author: "Sara Mackinley",
    authorUsername: "mackinleykitchen",
    role: "Recipe Developer - Brunch & Bakery",
    cuisine: "Brits",
    time: 30,
    difficulty: 1,
    baseServings: 9,
    servingNoun: "muffin",
    language: "nl",
    isLimitedEdition: true,
    variantGroup: "berried-treasure-blueberry-muffins",
    isPrimary: false,
    tags: ["Ontbijt","Vegan","Licht"],
    photo: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
    fact: {"title":"Wist je dat?","body":"Bosbessen bevatten een van de hoogste concentraties antioxidanten van al het fruit, wat helpt cellen te beschermen tegen schade en het verval van het geheugen vertraagt. Je lichaam wordt niet somber van bosbessen."},
    intro: "Zachte, met gember gekruide muffins boordevol jammy bosbessen. Vegan, lactosevrij en klaar in een half uur - en Sara's geheim is de kaneel-gembersuiker die je er warm overheen strooit.",
    macros: {"calories":152,"carbs":23,"protein":2.2,"fat":5.5,"fibre":0.5,"sugar":7.6},
    equipment: ["Muffinvorm voor 9 stuks","Papieren vormpjes","Mengkommen","Garde","Spatel"],
    ingredientGroups: [
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
        "name": "Sara's kruidensuiker (optioneel)",
        "items": [
          { "amount": 1,   "unit": "tl", "text": "fijne kristalsuiker" },
          { "amount": 0.5, "unit": "tl", "text": "gemberpoeder" },
          { "amount": 0.5, "unit": "tl", "text": "kaneelpoeder" }
        ]
      }
    ],
    steps: [
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
        "title": "Sara's kruidensuiker (optioneel)",
        "time": 3,
        "desc": "Meng de suiker, gember en kaneel voor de topping. Strooi dit royaal over de muffins terwijl ze nog warm zijn zodat het aan de bovenkant blijft plakken.",
        "ingredientKeys": ["1-0","1-1","1-2"]
      }
    ]
  }
];
