/* Recipy Cookery School — static technique guide content.
   Loaded on learn.html and technique.html (technique.html?slug=<slug>).
   Editorial content only; no Supabase dependency. To add a new guide,
   append an object here — learn.html scales automatically. */
window.TECHNIQUES = [
  /* ============================================================
     1. How to Cook Eggs
     ============================================================ */
  {
    slug: "how-to-cook-eggs",
    title: "How to Cook Eggs",
    subtitle: "Six ways to cook the world's most versatile ingredient — with times, temperatures and the tells that mean it's ready.",
    heroPhoto: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
    icon: "🍳",
    skillLevel: "Beginner",
    readTime: 6,
    tags: ["Eggs", "Breakfast", "Protein"],
    intro: "Eggs are the first thing most cooks learn and the last thing they master. The difference between a rubbery scramble and a silky one, or a chalky boiled yolk and a jammy one, usually comes down to two things: heat and timing. This guide walks through the six core methods, what to look for at each stage, and how to season them so they never get boring.",
    fact: {
      title: "Did you know?",
      body: "The colour of an egg's shell has nothing to do with quality or flavour — it's decided by the breed of hen. The colour of the yolk, though, is all about the hen's diet: more carotenoid-rich plants mean a deeper orange yolk."
    },
    methods: [
      {
        key: "boiled",
        label: "Boiled",
        heat: "Gentle simmer",
        time: "6–12 min",
        steps: [
          "Bring a pan of water to a gentle simmer — small bubbles rising, not a rolling boil. A hard boil bounces the eggs around and cracks the shells.",
          "Lower the eggs in gently with a slotted spoon and start your timer straight away.",
          "Simmer for 6 minutes for a soft, jammy yolk, 8–9 minutes for barely-set, or 11–12 minutes for fully hard-boiled.",
          "Lift the eggs into a bowl of iced water for at least 2 minutes. This stops the cooking dead and shrinks the egg away from the shell, making peeling far easier.",
          "Tap all over on the counter and peel from the wider end — there's an air pocket there that gives you a head start."
        ],
        doneness: [
          { label: "Soft", time: "6 min", cue: "White just set, yolk fully runny and jammy" },
          { label: "Medium", time: "8–9 min", cue: "Yolk fudgy at the edge, still gooey in the centre" },
          { label: "Hard", time: "11–12 min", cue: "Yolk fully set but still bright yellow, no grey ring" }
        ],
        commonMistake: "Boiling past 12 minutes gives the yolk a greenish-grey ring and a sulphurous smell. It's harmless, but it means the egg is overcooked — set a timer and use the iced-water bath every time."
      },
      {
        key: "fried",
        label: "Fried",
        heat: "Medium",
        time: "2–4 min",
        steps: [
          "Heat a non-stick or well-seasoned pan over medium heat with a small knob of butter or a tablespoon of oil. The fat should shimmer, not smoke.",
          "Crack the egg into a small bowl first, then slide it into the pan. You'll get a neater shape and no shell surprises.",
          "For sunny-side up: cook 2–3 minutes until the white is fully set but the yolk is untouched. Spoon a little of the hot fat over the white near the yolk to help it set.",
          "For over-easy: once the white is set, flip gently and cook 20–30 seconds more. For over-hard, flip and cook about a minute until the yolk is firm.",
          "Season at the end with flaky salt — salting the raw yolk early can leave pale spots on it."
        ],
        doneness: [
          { label: "Sunny-side up", time: "2–3 min", cue: "White fully opaque, yolk glossy and liquid" },
          { label: "Over-easy", time: "+30 sec flipped", cue: "White sealed both sides, yolk still runny" },
          { label: "Over-hard", time: "+1 min flipped", cue: "Yolk cooked through, edges lightly crisped" }
        ],
        commonMistake: "A pan that's too cool makes the egg spread thin and turn tough before it sets; too hot and the edges burn to lace while the white stays raw on top. Medium heat and a lid for the last 30 seconds solves both."
      },
      {
        key: "scrambled",
        label: "Scrambled",
        heat: "Low",
        time: "3–5 min",
        steps: [
          "Whisk the eggs thoroughly in a bowl with a pinch of salt until no streaks of white remain. Whisking in the pan is too late — you want the salt and air worked in first.",
          "Melt butter in a non-stick pan over low heat. Low is the whole secret: eggs turn rubbery above a gentle warmth.",
          "Pour in the eggs and wait about 20 seconds, then start pushing them slowly from the edges to the centre with a spatula, forming soft folds.",
          "Keep folding gently. For small, custardy curds, stir almost constantly; for bigger, fluffier curds, fold less often.",
          "Take the pan off the heat while the eggs still look slightly wet — they carry on cooking for another 30 seconds in the residual heat. Finish with black pepper and chives."
        ],
        doneness: [
          { label: "French-style", time: "4–5 min, constant stirring", cue: "Tiny curds, glossy, almost sauce-like" },
          { label: "Soft folds", time: "3–4 min", cue: "Large pillowy curds, just barely set" },
          { label: "Well done", time: "5+ min", cue: "Fully set and dry — fine for a sandwich, but past its best" }
        ],
        commonMistake: "The single most common egg mistake in any kitchen: heat too high, cooked too long. Eggs finish cooking off the heat — if they look done in the pan, they'll be overdone on the plate."
      },
      {
        key: "poached",
        label: "Poached",
        heat: "Barely simmering",
        time: "3–4 min",
        steps: [
          "Use the freshest eggs you have — fresh whites are thick and hold together; older whites go wispy in the water.",
          "Bring a deep pan of water to a bare simmer — a few small bubbles on the base, the surface barely trembling. Add a splash of vinegar if you like (it helps the white set faster) but skip the salt.",
          "Crack the egg into a fine sieve over a bowl for 10 seconds to drain off the loose, watery white, then tip it into a small cup.",
          "Stir the water into a gentle whirlpool and slide the egg into the centre. The swirl wraps the white around the yolk.",
          "Poach for 3 minutes for a runny yolk, 4 for a slightly set one. Lift out with a slotted spoon and rest it on kitchen paper for a moment before serving."
        ],
        doneness: [
          { label: "Runny", time: "3 min", cue: "White set, yolk liquid — it should wobble like a water balloon" },
          { label: "Jammy", time: "4 min", cue: "Yolk thickened at the edges, soft centre" }
        ],
        commonMistake: "Boiling water tears the white apart before it can set. If your poached eggs come out ragged, the water was too hot or the egg was too old — the sieve trick fixes most of the rest."
      },
      {
        key: "baked",
        label: "Baked (shirred)",
        heat: "180°C / 350°F",
        time: "10–14 min",
        steps: [
          "Preheat the oven to 180°C (350°F) and butter a small ramekin per egg — or per two eggs, if you're feeling generous.",
          "Add a spoonful of cream, a few wilted greens, or leftover ratatouille to the bottom of each ramekin. Eggs bake best with a little moisture underneath.",
          "Crack in the eggs, season, and top with a little grated cheese if you like.",
          "Bake for 10–12 minutes for runny yolks, 13–14 for set. The whites should be just opaque — they'll firm up a little more out of the oven.",
          "Rest for 2 minutes before serving with toast for dipping. The ramekin stays hot, so the eggs keep cooking — pull them a touch early."
        ],
        doneness: [
          { label: "Dippable", time: "10–12 min", cue: "Whites opaque, yolks glossy and loose" },
          { label: "Set", time: "13–14 min", cue: "Gentle shake shows no wobble in the yolk" }
        ],
        commonMistake: "Judging doneness in the oven is hard because ramekins keep cooking the egg after they come out. If the white looks fully done in the oven, the yolk will be hard by the time you eat it."
      },
      {
        key: "omelette",
        label: "Omelette",
        heat: "Medium-low",
        time: "2–3 min",
        steps: [
          "Whisk 2–3 eggs with a pinch of salt until completely smooth. A few drops of water (not milk) make it lighter.",
          "Heat a small non-stick pan over medium-low with a generous knob of butter. When the foam subsides, pour in the eggs.",
          "For the first 30 seconds, stir the eggs briskly with a spatula while shaking the pan — like making scrambled eggs — then let the base set.",
          "When the surface is still slightly wet, add your filling in a line across the middle. Less is more: a tablespoon or two of cheese or herbs.",
          "Tilt the pan and roll or fold the omelette over the filling, then slide it onto the plate seam-side down. The residual heat finishes the inside."
        ],
        doneness: [
          { label: "French (baveuse)", time: "~2 min", cue: "Pale gold outside, softly creamy inside, no browning" },
          { label: "Diner-style", time: "~3 min", cue: "Light golden-brown outside, fully set inside" }
        ],
        commonMistake: "Overfilling. A stuffed omelette won't fold, tears open, and the filling never warms through. Fillings should be pre-cooked, warm and modest — the egg is the star."
      }
    ],
    seasoningIdeas: [
      "Flaky sea salt + cracked black pepper",
      "Chilli crisp + sliced spring onion",
      "Furikake or toasted sesame",
      "Hot honey + flaky salt",
      "Herb butter (chives, tarragon, parsley)",
      "Smoked paprika + a squeeze of lemon",
      "Curry powder + coriander",
      "Everything-bagel seasoning"
    ],
    toolsNeeded: [
      "Non-stick frying pan",
      "Small saucepan",
      "Slotted spoon",
      "Silicone spatula",
      "Fine sieve",
      "Timer",
      "Ramekins (for baking)"
    ],
    topTips: [
      "Crack eggs into a bowl first, never straight into the pan — you'll catch shell fragments and bad eggs before they hit your breakfast.",
      "Older eggs peel more easily when boiled; the freshest eggs are best saved for poaching and frying where the white needs to hold together.",
      "Take eggs off the heat just before they look done. Residual heat finishes the job — this one habit fixes most overcooked eggs.",
      "Season scrambled eggs before cooking, fried eggs after. Salt whisked into raw egg dissolves evenly; salt on a raw yolk marks it.",
      "A splash of water in an omelette makes it lighter; cream in scrambled eggs makes them richer. Milk mostly just dilutes flavour."
    ],
    troubleshooting: [
      {
        q: "Why do my scrambled eggs turn rubbery and watery?",
        a: "The heat was too high or they cooked too long — overcooked egg proteins squeeze their moisture out, which is where the watery puddle comes from. Cook over low heat, keep the eggs moving, and pull the pan off the stove while they still look a little wet."
      },
      {
        q: "Why is there a green-grey ring around my boiled yolk?",
        a: "That's a harmless reaction between iron in the yolk and sulphur in the white, and it means the egg was overcooked. Keep hard-boiling to 11–12 minutes maximum and plunge the eggs straight into iced water."
      },
      {
        q: "Why do my poached eggs fall apart into wisps?",
        a: "Either the egg wasn't fresh enough — older whites are thin and watery — or the water was boiling rather than barely simmering. Strain the egg through a fine sieve first to remove the loose white, and keep the water at a tremble."
      },
      {
        q: "Why do my fried eggs stick to the pan?",
        a: "The pan wasn't hot enough before the egg went in, or there wasn't enough fat. Heat the pan first, add the fat, wait until it shimmers, then add the egg. Stainless steel needs noticeably more fat than non-stick."
      },
      {
        q: "How do I know if an egg is still fresh?",
        a: "Drop it in a bowl of water: fresh eggs lie flat on the bottom, older ones stand upright, and floaters should be binned. The air pocket inside grows as the egg ages, which is what makes it float."
      }
    ],
    relatedIngredientKeywords: ["egg", "eggs"]
  },

  /* ============================================================
     2. How to Cook Tofu
     ============================================================ */
  {
    slug: "how-to-cook-tofu",
    title: "How to Cook Tofu",
    subtitle: "From crispy golden cubes to silky scrambles — how to press it, season it and cook it so it never tastes bland again.",
    heroPhoto: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    icon: "🧊",
    skillLevel: "Beginner",
    readTime: 7,
    tags: ["Tofu", "Vegan", "Protein"],
    intro: "Tofu has an unfair reputation, and it's almost never tofu's fault — it's technique. Tofu is a sponge: full of water when it comes out of the packet, and unable to absorb flavour or crisp up until that water is gone. Get the pressing and the firmness right, and it will take on almost any flavour you throw at it. This guide covers the core methods, which firmness to buy for each, and the tricks that make the difference between soggy and golden.",
    fact: {
      title: "Did you know?",
      body: "Tofu has been made for over 2,000 years, and the process is remarkably similar to cheesemaking — soy milk is curdled with a coagulant, then the curds are pressed into blocks. That's why firmness varies: silken tofu is barely pressed, extra-firm has had most of its whey squeezed out."
    },
    methods: [
      {
        key: "pressing",
        label: "Pressing",
        heat: "None",
        time: "15–30 min",
        steps: [
          "Drain the block and pat it dry. This step applies to firm and extra-firm tofu — never press silken tofu, it will simply collapse.",
          "Wrap the block in a clean tea towel or several layers of kitchen paper.",
          "Set it on a plate, put a small chopping board on top, and weigh it down with a heavy pan or a couple of tins.",
          "Leave for 15–30 minutes, swapping the towel halfway if it's soaked through. A dedicated tofu press does the same job with less mess.",
          "For an even chewier, meatier texture, freeze the whole block first, thaw it, then press — freezing opens up the structure so it drinks up marinades."
        ],
        doneness: [
          { label: "Quick press", time: "15 min", cue: "Surface dry, block slightly slimmer — fine for stir-fries" },
          { label: "Full press", time: "30 min", cue: "Noticeably firmer and denser — best for searing and baking" },
          { label: "Freeze-thaw-press", time: "Overnight + 30 min", cue: "Spongy, chewy, drinks marinade like a sponge" }
        ],
        commonMistake: "Skipping the press entirely. Un-pressed tofu steams in its own water instead of browning, sticks to the pan, and stays bland no matter how good your marinade is."
      },
      {
        key: "pan-seared",
        label: "Pan-seared",
        heat: "Medium-high",
        time: "8–10 min",
        steps: [
          "Cut pressed extra-firm tofu into cubes or slabs about 2cm thick and pat them dry one more time.",
          "Toss the pieces in a light coat of cornflour (cornstarch) with a pinch of salt — this is the secret to a shatteringly crisp crust.",
          "Heat a generous layer of neutral oil in a non-stick or cast-iron pan over medium-high until it shimmers.",
          "Add the tofu in a single layer with space between pieces. Then leave it alone — don't move it for 2–3 minutes until the underside is deep golden.",
          "Turn each piece and repeat on the other sides, about 8–10 minutes total. Toss with sauce only at the very end, off the heat, so the crust stays crisp."
        ],
        doneness: [
          { label: "Golden", time: "2–3 min per side", cue: "Deep golden crust that releases from the pan easily" },
          { label: "Extra-crispy", time: "3–4 min per side", cue: "Edges browned and blistered, audible crunch" }
        ],
        commonMistake: "Moving the tofu too soon. If it's sticking, it isn't ready to turn — a proper crust releases itself from the pan. Prodding it early tears the surface and you lose the crust entirely."
      },
      {
        key: "baked",
        label: "Baked",
        heat: "200°C / 400°F",
        time: "25–30 min",
        steps: [
          "Preheat the oven to 200°C (400°F) and line a baking tray.",
          "Tear or cut pressed tofu into bite-size chunks — torn edges catch more marinade and crisp better than clean cuts.",
          "Toss with a tablespoon of oil, a tablespoon of soy sauce, and a tablespoon of cornflour until evenly coated.",
          "Spread out in a single layer with space between the pieces — crowding means steaming.",
          "Bake for 25–30 minutes, flipping halfway, until golden and crisp at the edges. Baked tofu holds its crunch in sauces longer than pan-fried."
        ],
        doneness: [
          { label: "Chewy-crisp", time: "25 min", cue: "Golden outside, tender centre" },
          { label: "Crunchy", time: "30 min+", cue: "Deeply browned corners, firm bite all the way through" }
        ],
        commonMistake: "Crowding the tray. Tofu releases steam as it bakes, and pieces touching each other trap it — you end up with pale, rubbery cubes instead of golden ones."
      },
      {
        key: "air-fried",
        label: "Air-fried",
        heat: "190°C / 375°F",
        time: "12–15 min",
        steps: [
          "Press and cube extra-firm tofu, then toss with a teaspoon of oil, seasoning, and a dusting of cornflour.",
          "Preheat the air fryer to 190°C (375°F) for a couple of minutes.",
          "Arrange the cubes in a single layer in the basket — cook in batches rather than piling them up.",
          "Air-fry for 12–15 minutes, shaking the basket every 5 minutes so all sides crisp evenly.",
          "They're done when deeply golden and rattling dry in the basket. Sauce them just before serving."
        ],
        doneness: [
          { label: "Golden", time: "12 min", cue: "Light golden, tender inside" },
          { label: "Crispy", time: "15 min", cue: "Deep gold, hollow-sounding when shaken" }
        ],
        commonMistake: "Using silken or unpressed tofu — the fan blasts moisture around the basket and the cubes stew instead of crisping. Extra-firm, pressed, lightly oiled: those three things do all the work."
      },
      {
        key: "braised",
        label: "Simmered & braised",
        heat: "Gentle simmer",
        time: "10–20 min",
        steps: [
          "Choose firm tofu for braising — it holds its shape but still soaks up the braising liquid. Pressing is optional here; a quick 10-minute press helps it absorb more.",
          "Cut into large cubes or thick slabs so the pieces survive the simmer intact.",
          "Optionally sear the pieces first for colour and a firmer surface that won't break up.",
          "Add to your sauce or broth — curry, mapo-style, miso broth — and simmer gently for 10–20 minutes. The longer it simmers, the more flavour it takes on.",
          "Stir minimally and use a wooden spoon or a gentle shake of the pan to move things around. Tofu doesn't need cooking, only heating and flavouring."
        ],
        doneness: [
          { label: "Heated through", time: "10 min", cue: "Warm centre, mild flavour" },
          { label: "Fully braised", time: "20 min", cue: "Seasoned to the centre, sauce clinging to each piece" }
        ],
        commonMistake: "Vigorous stirring. Braising tofu breaks apart under a spoon dragged through the pan — fold it gently or just spoon the sauce over the top and let the simmer do the work."
      },
      {
        key: "scrambled",
        label: "Scrambled",
        heat: "Medium",
        time: "6–8 min",
        steps: [
          "Use medium or firm tofu — not silken (too wet) and not extra-firm (too dry). No pressing needed; just drain well.",
          "Crumble the block into the pan with your hands, keeping a mix of big and small pieces for a scrambled-egg texture.",
          "Heat a little oil over medium heat and cook the crumbles for 3–4 minutes to drive off some moisture.",
          "Add your seasoning: a pinch of turmeric for colour, nutritional yeast for savouriness, garlic powder, salt and pepper. A splash of plant milk brings it back to creamy.",
          "Cook another 3–4 minutes until it looks like soft scrambled eggs. If you can find kala namak (black salt), a small pinch at the end adds a distinctly eggy flavour."
        ],
        doneness: [
          { label: "Soft", time: "6 min", cue: "Moist, creamy, holds together on a fork" },
          { label: "Firm", time: "8 min+", cue: "Drier crumbles with lightly browned edges" }
        ],
        commonMistake: "Adding the turmeric too generously. A quarter teaspoon colours a whole block; more than that and the scramble turns bitter and neon."
      }
    ],
    seasoningIdeas: [
      "Soy + ginger + garlic marinade",
      "Gochujang glaze",
      "Peanut-lime sauce",
      "Five-spice + sesame oil",
      "Tahini-lemon dressing",
      "Smoked paprika + maple",
      "Curry powder + coconut milk",
      "Kala namak (for eggy scrambles)"
    ],
    toolsNeeded: [
      "Tofu press (or tea towel + heavy pan)",
      "Non-stick or cast-iron pan",
      "Baking tray",
      "Air fryer (optional)",
      "Sharp knife",
      "Kitchen paper"
    ],
    topTips: [
      "Match the firmness to the method: silken for blending and soups, medium for scrambles, firm for braises, extra-firm for searing, baking and air-frying.",
      "Cornflour is the crispiness cheat code — a light dusting before any dry-heat method gives a crust that plain tofu can't manage.",
      "Freeze then thaw a block before pressing for a chewier, meatier texture that absorbs marinades twice as well.",
      "Marinades don't need hours — because tofu is mostly water, 15–30 minutes on pressed tofu does more than overnight on unpressed.",
      "Salt your marinade generously. Tofu is a blank canvas and under-seasoning is why it gets called bland."
    ],
    troubleshooting: [
      {
        q: "Why does my tofu stick to the pan?",
        a: "Three usual suspects: the tofu was still wet (press it and pat it dry), the pan wasn't hot enough before the tofu went in, or you tried to move it too early. A golden crust releases itself — if it's gripping the pan, give it another minute."
      },
      {
        q: "Why is my tofu soggy instead of crispy?",
        a: "Water is the enemy of crisp. Press it properly, coat it in cornflour, use enough oil, and don't crowd the pan or tray. Any one of those missing usually means soggy results."
      },
      {
        q: "Why does my tofu taste bland even after marinating?",
        a: "Unpressed tofu is already full of water, so it physically can't absorb your marinade. Press first, marinate second, and season more assertively than you would meat — salt, acid and umami all help."
      },
      {
        q: "Why does my tofu fall apart when I cook it?",
        a: "Wrong firmness for the method. Silken and soft tofu can't survive a stir-fry or a flip in the pan — save them for soups, sauces and blending. For anything involving tongs or a spatula, use firm or extra-firm."
      },
      {
        q: "Can I eat tofu without cooking it?",
        a: "Yes — tofu is pre-cooked during production, so it's safe straight from the packet. Chilled silken tofu with soy sauce, sesame oil and spring onions is a classic dish in its own right."
      }
    ],
    relatedIngredientKeywords: ["tofu"]
  },

  /* ============================================================
     3. How to Cook Chickpeas
     ============================================================ */
  {
    slug: "how-to-cook-chickpeas",
    title: "How to Cook Chickpeas",
    subtitle: "Tinned or dried, roasted or blended — everything you need to turn the humble chickpea into crunchy snacks, silky hummus and hearty stews.",
    heroPhoto: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082",
    icon: "🫘",
    skillLevel: "Beginner",
    readTime: 6,
    tags: ["Chickpeas", "Vegan", "Pantry"],
    intro: "Chickpeas might be the hardest-working ingredient in the cupboard: a tin becomes a curry, a salad, a tray of crunchy snacks or a bowl of hummus in minutes, and even the liquid in the tin has its own job. The two skills worth learning are how to cook dried chickpeas properly (cheaper, better texture) and how to get tinned ones truly crisp. This guide covers both, plus the seasoning combinations that make them sing.",
    fact: {
      title: "Did you know?",
      body: "The cloudy liquid in a tin of chickpeas is called aquafaba, and it behaves uncannily like egg white — about three tablespoons whips up to replace one egg in meringues, mousses and mayonnaise. Don't pour it down the sink."
    },
    methods: [
      {
        key: "tinned-vs-dried",
        label: "Tinned vs dried",
        heat: "—",
        time: "0 min vs overnight",
        steps: [
          "Tinned chickpeas are fully cooked and ready to eat — just drain and rinse. One 400g tin gives you about 240g (1½ cups) of chickpeas.",
          "Dried chickpeas cost roughly half as much per serving and cook up creamier with more bite, but they need soaking and simmering.",
          "To substitute: 1 tin ≈ 1½ cups cooked ≈ 75g dried. Scale recipe liquid accordingly if swapping dried into a recipe written for tinned.",
          "Rinse tinned chickpeas well before using — the canning liquid can taste metallic and salty in delicate dishes (but save it if you need aquafaba).",
          "For hummus, simmer even tinned chickpeas for 10 minutes with a pinch of bicarbonate of soda first. They break down further and blend far silkier."
        ],
        doneness: [
          { label: "Tinned", time: "Ready now", cue: "Convenient, softer texture, slightly salty" },
          { label: "Dried, home-cooked", time: "Overnight + 1–2 hrs", cue: "Creamier, nuttier, holds shape better in stews" }
        ],
        commonMistake: "Treating them as identical. Tinned chickpeas are softer and saltier — great for speed, but home-cooked dried chickpeas hold their shape better in long-simmered dishes and taste noticeably nuttier."
      },
      {
        key: "stovetop",
        label: "Soak & simmer",
        heat: "Gentle simmer",
        time: "1–2 hrs (+ soak)",
        steps: [
          "Soak dried chickpeas overnight in plenty of cold water — they'll triple in size, so cover them by at least 5cm. Short on time? Boil for 1 minute, then soak in the hot water for 1 hour.",
          "Drain, rinse, and tip into a large pot with fresh water covering them by a few centimetres.",
          "Add half a teaspoon of bicarbonate of soda — it softens the skins and cuts the cooking time noticeably. Hold the salt until the last 30 minutes.",
          "Bring to a boil, skim off any foam, then drop to a gentle simmer, partially covered.",
          "Simmer 60–90 minutes for salads (intact, with bite) or up to 2 hours for hummus and mashing (falling-apart soft). Cool them in their cooking liquid so they stay moist, and freeze extras in that liquid too."
        ],
        doneness: [
          { label: "Firm-tender", time: "60–90 min", cue: "Holds shape, creamy centre — best for salads and stews" },
          { label: "Butter-soft", time: "1½–2 hrs", cue: "Crushes with no resistance — best for hummus" }
        ],
        commonMistake: "Salting the water at the start and expecting supermarket-fresh results from ancient stock. Old dried chickpeas (a year-plus in the cupboard) can simmer for hours and never soften — buy from a shop with high turnover."
      },
      {
        key: "pressure-cooker",
        label: "Pressure cooker",
        heat: "High pressure",
        time: "35–50 min",
        steps: [
          "In an Instant Pot or pressure cooker, you can skip the soak entirely — though soaked chickpeas cook faster and more evenly.",
          "Add rinsed chickpeas and cover with water by about 5cm. Don't fill the pot past half full; chickpeas foam.",
          "Add a teaspoon of oil to tame the foam, plus any aromatics — bay leaf, garlic, half an onion.",
          "Cook at high pressure: 35–40 minutes for unsoaked, 12–15 minutes for soaked. Let the pressure release naturally for 10–15 minutes.",
          "Check a few: they should crush easily between two fingers. If they're firm, reseal and cook another 5–10 minutes."
        ],
        doneness: [
          { label: "Soaked", time: "12–15 min high pressure", cue: "Even, creamy, intact" },
          { label: "Unsoaked", time: "35–40 min high pressure", cue: "Just as soft, skins slightly looser" }
        ],
        commonMistake: "Quick-releasing the pressure. The violent bubbling blows the skins off and turns the top layer to mush — a natural release keeps them intact and finishes the cooking gently."
      },
      {
        key: "roasted",
        label: "Roasted crispy",
        heat: "200°C / 400°F",
        time: "25–35 min",
        steps: [
          "Drain and rinse a tin of chickpeas, then dry them fanatically — roll them in a clean tea towel and discard any loose skins. Dryness decides crispiness.",
          "Toss with a tablespoon of olive oil and a good pinch of salt. Hold the spices for now — most burn during a long roast.",
          "Spread on a baking tray in a single layer and roast at 200°C (400°F) for 25–35 minutes, shaking the tray every 10 minutes.",
          "They're done when deep golden and they rattle on the tray. Bite one: it should be crunchy to the centre, not chewy.",
          "Toss with your spices while still hot — smoked paprika, cumin, za'atar, curry powder — and eat within a few hours; they soften as they sit."
        ],
        doneness: [
          { label: "Crunchy-chewy", time: "25 min", cue: "Golden, crisp shell, slightly tender centre" },
          { label: "Fully crunchy", time: "30–35 min", cue: "Rattles on the tray, crunchy all the way through" }
        ],
        commonMistake: "Roasting damp chickpeas. Any surface moisture steams them and they'll never crisp — the tea-towel dry-down matters more than oven temperature or timing."
      },
      {
        key: "hummus",
        label: "Blended (hummus)",
        heat: "None (blend)",
        time: "10 min",
        steps: [
          "For the silkiest hummus, simmer a drained tin of chickpeas for 10 minutes with half a teaspoon of bicarbonate of soda, then rinse — the skins slip off and the chickpeas soften completely.",
          "Blend the warm chickpeas first, on their own, until they form a thick paste.",
          "Add 3–4 tablespoons of tahini, a crushed garlic clove, juice of a lemon and a good pinch of salt. Blend again.",
          "With the machine running, drizzle in iced water a tablespoon at a time until the hummus turns pale, light and whippy — usually 3–5 tablespoons.",
          "Taste and adjust: more lemon for brightness, more tahini for richness, more salt almost always. Serve swirled with olive oil."
        ],
        doneness: [
          { label: "Rustic", time: "2 min blending", cue: "Thick, textured, holds a spoon upright" },
          { label: "Silky", time: "4–5 min + iced water", cue: "Pale, glossy, pipeable — restaurant texture" }
        ],
        commonMistake: "Blending everything at once and stopping too early. Long blending plus iced water is what makes hummus light instead of stodgy — give the machine a full few minutes."
      },
      {
        key: "stews",
        label: "Curries & stews",
        heat: "Simmer",
        time: "20–40 min",
        steps: [
          "Chickpeas are the rare ingredient that genuinely improves with longer simmering — they soak up the sauce without falling apart.",
          "Build your base first: onions, garlic, ginger and spices cooked properly before any liquid goes in.",
          "Add tinned chickpeas with the liquid component (tomatoes, coconut milk, stock) and simmer at least 20 minutes so they take on flavour.",
          "Home-cooked dried chickpeas are even better here — add a ladle of their cooking liquid instead of stock for extra body.",
          "Mash a spoonful of chickpeas against the side of the pot near the end to thicken the sauce naturally."
        ],
        doneness: [
          { label: "Quick", time: "20 min", cue: "Chickpeas warmed through, sauce still loose" },
          { label: "Slow", time: "40 min", cue: "Chickpeas seasoned to the centre, sauce thick and clinging" }
        ],
        commonMistake: "Adding chickpeas at the very end like a garnish. They need at least 20 minutes in the sauce to absorb any flavour — added in the final five, they taste like an afterthought."
      },
      {
        key: "aquafaba",
        label: "Aquafaba",
        heat: "None (whip)",
        time: "5–10 min",
        steps: [
          "Drain a tin of chickpeas through a sieve and keep the cloudy liquid — that's aquafaba. From a 400g tin you'll get about 150ml.",
          "As an egg substitute: 3 tablespoons ≈ 1 whole egg, 2 tablespoons ≈ 1 egg white.",
          "For whipping, use it straight from the fridge and whisk with electric beaters — it takes 5–10 minutes to reach stiff peaks, longer than egg whites.",
          "Add a quarter teaspoon of cream of tartar or a few drops of lemon juice to stabilise the foam for meringues and mousses.",
          "Unwhipped aquafaba also works as a binder in veggie burgers and as the base for egg-free mayonnaise. It keeps 3–4 days in the fridge or freezes in ice-cube trays."
        ],
        doneness: [
          { label: "Soft peaks", time: "4–6 min whisking", cue: "Foam holds a droop — good for folding into batters" },
          { label: "Stiff peaks", time: "8–10 min whisking", cue: "Stands upright, bowl can be tipped — meringue-ready" }
        ],
        commonMistake: "Giving up whisking too early. Aquafaba takes noticeably longer than egg whites to build structure — if it's still sloshing at four minutes, keep going, it will get there."
      }
    ],
    seasoningIdeas: [
      "Cumin + smoked paprika + lemon",
      "Harissa + honey",
      "Za'atar + olive oil",
      "Curry powder + coconut",
      "Tahini + garlic + lemon (hummus base)",
      "Rosemary + chilli flakes",
      "Sumac + mint",
      "Garam masala + yoghurt"
    ],
    toolsNeeded: [
      "Large pot or saucepan",
      "Pressure cooker / Instant Pot (optional)",
      "Baking tray",
      "Blender or food processor",
      "Fine sieve",
      "Clean tea towel"
    ],
    topTips: [
      "A pinch of bicarbonate of soda in the soaking and cooking water is the single biggest upgrade — softer skins, shorter cooking, silkier hummus.",
      "Dry chickpeas obsessively before roasting. Surface moisture is the only thing standing between you and proper crunch.",
      "Cook dried chickpeas in bulk and freeze them in their cooking liquid — you get tinned-level convenience with home-cooked texture.",
      "Never bin the tin liquid: aquafaba replaces eggs in meringues, mayo and baking (3 tbsp ≈ 1 egg).",
      "Salt dried chickpeas near the end of cooking, not the start — early salt can keep old chickpeas from ever softening properly."
    ],
    troubleshooting: [
      {
        q: "My dried chickpeas won't soften no matter how long I simmer them. Why?",
        a: "They're probably old — dried pulses over a year old harden permanently and no amount of simmering saves them. Very hard water makes it worse. Buy from a shop with high turnover, and add a pinch of bicarbonate of soda to the cooking water."
      },
      {
        q: "Why do my roasted chickpeas go soft an hour after they come out of the oven?",
        a: "Either they weren't dried thoroughly before roasting, weren't roasted quite long enough, or they were stored in a sealed container while still warm — trapped steam softens them. Roast until they rattle, cool completely, and store loosely covered (they're honestly best the same day)."
      },
      {
        q: "Can I use tinned chickpeas anywhere a recipe says dried?",
        a: "Almost always, yes. One 400g tin ≈ 1½ cups cooked ≈ 75g dried. Skip the soaking and simmering steps, reduce added liquid slightly, and add them later in the cooking so they don't turn mushy."
      },
      {
        q: "Why is my hummus grainy instead of smooth?",
        a: "Cold, firm chickpeas and not enough blending time. Simmer them (even tinned) with a pinch of bicarb for 10 minutes first, blend while warm, blend for longer than feels necessary, and loosen with iced water rather than oil."
      },
      {
        q: "Do I really need to peel the skins off?",
        a: "For most dishes, no — the skins are perfectly edible. For competition-level silky hummus, the bicarb-simmer trick loosens the skins so most rinse away without tedious hand-peeling."
      }
    ],
    relatedIngredientKeywords: ["chickpea", "chickpeas", "aquafaba"]
  }
];
