// ============================================================
// Seed Data — Nganga wa Muchai Family Tree
// A Kikuyu family spanning five generations, rooted in
// the highlands of Central Kenya and reaching across the world.
// ============================================================

// --------------- People ---------------
export const seedPeople = [
  // --- Generation 1: The Ancestor ---
  {
    id: "p1",
    name: "Muchai wa Kamau",
    birthYear: 1882,
    deathYear: 1954,
    generation: 1,
    location: "Murang'a, Kenya",
    bio: "Muchai wa Kamau was a respected elder and landowner in the hills of Murang'a. Known for his wisdom in settling disputes, he served on the local kiama (council of elders) and was a keeper of Kikuyu traditions. He lived through the colonial era and fought to protect ancestral land rights.",
    role: "patriarch",
    photo: null,
    stories: ["s1", "s2"],
  },
  {
    id: "p2",
    name: "Wanjiku wa Muchai",
    birthYear: 1888,
    deathYear: 1962,
    generation: 1,
    location: "Murang'a, Kenya",
    bio: "Wanjiku was the matriarch of the family and a pillar of the community. She was known for her generosity, often feeding neighbors during times of famine. Her knowledge of herbal medicine was sought after throughout the region.",
    role: "matriarch",
    photo: null,
    stories: ["s1", "s3"],
  },

  // --- Generation 2: The Patriarch ---
  {
    id: "p3",
    name: "Nganga wa Muchai",
    birthYear: 1924,
    deathYear: 2008,
    generation: 2,
    location: "Nyeri, Kenya",
    bio: "Nganga wa Muchai, the family's central patriarch, was born in the waning years of colonial Kenya. He attended a mission school, became a teacher, and later joined the independence movement. After uhuru he settled in Nyeri where he became a respected headmaster and community leader. His home was always open to relatives and strangers alike.",
    role: "patriarch",
    photo: null,
    stories: ["s2", "s4", "s5", "s6"],
  },
  {
    id: "p4",
    name: "Nyambura wa Nganga",
    birthYear: 1930,
    deathYear: 2015,
    generation: 2,
    location: "Nyeri, Kenya",
    bio: "Nyambura was Nganga's beloved wife and the heart of the household. A talented farmer and trader, she managed the family shamba and ensured every child received an education. Her warmth and steady faith held the family together through hardship and joy.",
    role: "matriarch",
    photo: null,
    stories: ["s3", "s5", "s7"],
  },
  {
    id: "p5",
    name: "Kamau wa Muchai",
    birthYear: 1928,
    deathYear: 1990,
    generation: 2,
    location: "Thika, Kenya",
    bio: "Kamau, Nganga's younger brother, worked in the coffee industry in Thika. He was known for his booming laugh and love of storytelling. He helped many young men from the village find employment in the growing town.",
    role: "child",
    photo: null,
    stories: ["s2"],
  },

  // --- Generation 3: The Children ---
  {
    id: "p6",
    name: "Joseph Muchai Nganga",
    birthYear: 1958,
    deathYear: null,
    generation: 3,
    location: "Nairobi, Kenya",
    bio: "Joseph, Nganga's eldest son, studied engineering at the University of Nairobi and built a career in telecommunications. He moved to Nairobi in the early 1980s and has been instrumental in keeping the family connected, often organizing reunions at the family homestead in Nyeri.",
    role: "child",
    photo: null,
    stories: ["s6", "s8", "s10"],
  },
  {
    id: "p7",
    name: "Wangari Nganga",
    birthYear: 1961,
    deathYear: null,
    generation: 3,
    location: "Nakuru, Kenya",
    bio: "Wangari, named after her grandmother's clan, became a nurse and later a public health administrator in Nakuru. She is the family historian, tirelessly collecting oral histories and photographs. Her dedication to preserving the family's story inspired this very project.",
    role: "child",
    photo: null,
    stories: ["s5", "s7", "s9"],
  },
  {
    id: "p8",
    name: "Peter Kariuki Nganga",
    birthYear: 1964,
    deathYear: null,
    generation: 3,
    location: "Mombasa, Kenya",
    bio: "Kariuki moved to the coast after university and built a successful import business in Mombasa. His Swahili is impeccable and he jokes that he is half-Kikuyu, half-Mijikenda. He hosts the family's annual coast gathering every December.",
    role: "child",
    photo: null,
    stories: ["s8", "s10"],
  },
  {
    id: "p9",
    name: "Grace Muthoni Nganga",
    birthYear: 1968,
    deathYear: null,
    generation: 3,
    location: "London, United Kingdom",
    bio: "Muthoni earned a scholarship to study law in London and never quite came back. She practices immigration law and is a fierce advocate for the Kenyan diaspora community. Despite the distance, she calls home every Sunday without fail.",
    role: "child",
    photo: null,
    stories: ["s9", "s11"],
  },
  {
    id: "p10",
    name: "Margaret Waithera Nganga",
    birthYear: 1955,
    deathYear: null,
    generation: 3,
    location: "Nyeri, Kenya",
    bio: "Waithera, Nganga's eldest daughter, stayed in Nyeri to care for her aging parents. She runs a successful dairy farm on the family land and is the unofficial keeper of the homestead. Every family gathering revolves around her cooking and her warm, commanding presence.",
    role: "child",
    photo: null,
    stories: ["s5", "s7"],
  },

  // --- Generation 4: The Grandchildren ---
  {
    id: "p11",
    name: "Brian Nganga Muchai",
    birthYear: 1988,
    deathYear: null,
    generation: 4,
    location: "Nairobi, Kenya",
    bio: "Brian is Joseph's eldest son and a software engineer working in Nairobi's tech scene. He is passionate about using technology to preserve African heritage, which led him to start building this family story platform.",
    role: "grandchild",
    photo: null,
    stories: ["s10", "s12"],
  },
  {
    id: "p12",
    name: "Angela Wanjiku Muchai",
    birthYear: 1991,
    deathYear: null,
    generation: 4,
    location: "Toronto, Canada",
    bio: "Angela moved to Canada for graduate studies in environmental science. She works on climate adaptation projects and draws inspiration from her great-grandmother Wanjiku's connection to the land. She is raising her children to speak Kikuyu.",
    role: "grandchild",
    photo: null,
    stories: ["s11", "s12"],
  },
  {
    id: "p13",
    name: "Kevin Kamau Kariuki",
    birthYear: 1993,
    deathYear: null,
    generation: 4,
    location: "Mombasa, Kenya",
    bio: "Kevin works alongside his father Kariuki in Mombasa and is expanding the family business into e-commerce. He is known in the family for his quick wit and his ability to make everyone laugh at gatherings.",
    role: "grandchild",
    photo: null,
    stories: ["s10"],
  },
  {
    id: "p14",
    name: "Sarah Nyambura Muthoni",
    birthYear: 1996,
    deathYear: null,
    generation: 4,
    location: "London, United Kingdom",
    bio: "Sarah, Grace's daughter, is studying medicine at King's College London. Named after her great-grandmother Nyambura, she dreams of returning to Kenya to work in rural healthcare. She organizes a Kikuyu cultural group at her university.",
    role: "grandchild",
    photo: null,
    stories: ["s11"],
  },
  {
    id: "p15",
    name: "Daniel Nganga Waithera",
    birthYear: 1985,
    deathYear: null,
    generation: 4,
    location: "Nyeri, Kenya",
    bio: "Daniel is Waithera's son and manages the family dairy farm alongside his mother. He introduced modern farming techniques while respecting traditional methods, doubling the farm's output. He is the one everyone calls when something at the homestead needs fixing.",
    role: "grandchild",
    photo: null,
    stories: ["s7", "s12"],
  },
];

// --------------- Connections ---------------
export const seedConnections = [
  // Spouse relationships
  { id: "c1", source: "p1", target: "p2", type: "spouse" },
  { id: "c2", source: "p3", target: "p4", type: "spouse" },

  // Parent-child: Muchai & Wanjiku -> Nganga, Kamau
  { id: "c3", source: "p1", target: "p3", type: "parent-child" },
  { id: "c4", source: "p1", target: "p5", type: "parent-child" },
  { id: "c5", source: "p2", target: "p3", type: "parent-child" },
  { id: "c6", source: "p2", target: "p5", type: "parent-child" },

  // Siblings: Nganga & Kamau
  { id: "c7", source: "p3", target: "p5", type: "sibling" },

  // Parent-child: Nganga & Nyambura -> children
  { id: "c8", source: "p3", target: "p10", type: "parent-child" },
  { id: "c9", source: "p3", target: "p6", type: "parent-child" },
  { id: "c10", source: "p3", target: "p7", type: "parent-child" },
  { id: "c11", source: "p3", target: "p8", type: "parent-child" },
  { id: "c12", source: "p3", target: "p9", type: "parent-child" },
  { id: "c13", source: "p4", target: "p10", type: "parent-child" },
  { id: "c14", source: "p4", target: "p6", type: "parent-child" },
  { id: "c15", source: "p4", target: "p7", type: "parent-child" },
  { id: "c16", source: "p4", target: "p8", type: "parent-child" },
  { id: "c17", source: "p4", target: "p9", type: "parent-child" },

  // Siblings: Gen 3
  { id: "c18", source: "p10", target: "p6", type: "sibling" },
  { id: "c19", source: "p6", target: "p7", type: "sibling" },
  { id: "c20", source: "p7", target: "p8", type: "sibling" },
  { id: "c21", source: "p8", target: "p9", type: "sibling" },

  // Parent-child: Gen 3 -> Gen 4
  { id: "c22", source: "p6", target: "p11", type: "parent-child" },
  { id: "c23", source: "p6", target: "p12", type: "parent-child" },
  { id: "c24", source: "p8", target: "p13", type: "parent-child" },
  { id: "c25", source: "p9", target: "p14", type: "parent-child" },
  { id: "c26", source: "p10", target: "p15", type: "parent-child" },
];

// --------------- Stories ---------------
export const seedStories = [
  {
    id: "s1",
    title: "The Land on the Hill",
    content: `Muchai wa Kamau always said the land chose him, not the other way around. In the early 1900s, when colonial administrators were drawing boundaries that made no sense to the people who had walked those hills for generations, Muchai planted a mugumo tree at the highest point of his land. "This tree will stand longer than any paper deed," he told his children.

The tree still stands today, its roots gripping the red soil of Murang'a like ancient fingers. Family members who visit the homestead always walk up to touch its bark, a quiet ritual connecting them to the old man they may never have met but whose stubbornness preserved what might have been lost.

Wanjiku would sit beneath that tree in the evenings, weaving baskets and telling stories to grandchildren who gathered around her like moths to a flame. She said the tree hummed with the voices of ancestors, and if you listened closely enough, you could hear them.`,
    author: "Wangari Nganga",
    date: "2019-04-12",
    personIds: ["p1", "p2"],
    tags: ["land", "heritage", "Murang'a", "colonial era"],
    type: "memory",
  },
  {
    id: "s2",
    title: "Brothers of the Highlands",
    content: `Nganga and Kamau were inseparable as boys, racing through the tea fields and swimming in the cold rivers that cut through the Murang'a hills. Their father Muchai would shake his head and say they had enough energy to power a locomotive. Yet the brothers were different in temperament: Nganga was the thinker, always with a book borrowed from the mission school, while Kamau was the doer, helping their father in the fields before dawn.

When Nganga decided to pursue education and eventually join the independence movement, it was Kamau who quietly managed the family land so his brother could follow his calling. "You go change the country," Kamau told him at the bus stop in 1950. "I will keep the home fires burning." It was a promise he kept until his last day.

Years later, Nganga would name his eldest grandson Brian after a teacher who had inspired him at the mission school. But he always said Kamau was the real teacher in his life — the one who taught him that sacrifice is the purest form of love.`,
    author: "Joseph Muchai Nganga",
    date: "2020-08-03",
    personIds: ["p3", "p5", "p1"],
    tags: ["brotherhood", "sacrifice", "independence", "Murang'a"],
    type: "memory",
  },
  {
    id: "s3",
    title: "Wanjiku's Medicine Garden",
    content: `Behind the main house in Murang'a, Wanjiku tended a garden that was equal parts pharmacy and sanctuary. She grew muiri for chest ailments, muthiga for stomach troubles, and a dozen other plants whose Kikuyu names the grandchildren struggled to remember but whose healing properties they never doubted.

Nyambura, her daughter-in-law, was the only person Wanjiku trusted to tend the garden in her absence. Over years of working side by side — weeding, planting, harvesting — the two women developed a bond that transcended the typical in-law relationship. Nyambura would later carry seeds from that garden to Nyeri, planting them around her own home as a living memorial.

When modern medicine arrived in force, some dismissed the old remedies. But Wangari, Nyambura's daughter who became a nurse, often found that the herbal treatments worked alongside Western medicine. She keeps a notebook of her grandmother's recipes, written in a mix of Kikuyu and English, and considers it one of her most valuable possessions.`,
    author: "Wangari Nganga",
    date: "2018-11-20",
    personIds: ["p2", "p4", "p7"],
    tags: ["tradition", "medicine", "women", "Kikuyu knowledge"],
    type: "tradition",
  },
  {
    id: "s4",
    title: "The Walk to Freedom",
    content: `In 1952, a young Nganga wa Muchai made a decision that would alter the course of his life. He left his teaching post and joined the movement for Kenyan independence. The details of those years are ones he rarely spoke about — the forest camps, the long marches, the friends lost — but the fire in his eyes when he recalled the moment the flag was raised on December 12, 1963, told the whole story.

After independence, Nganga returned to education with a renewed purpose. He believed that a free Kenya needed educated citizens more than anything. He became headmaster of a primary school in Nyeri and poured his energy into building classrooms, training teachers, and ensuring that girls had equal access to education — a radical idea in the 1960s.

His students remember him as strict but fair, a man who could silence a room with a glance but who also wept openly at graduation ceremonies. "Every child who walks out of this school with knowledge," he would say, "is a victory greater than any battle I ever fought."`,
    author: "Joseph Muchai Nganga",
    date: "2015-12-12",
    personIds: ["p3"],
    tags: ["independence", "education", "Nyeri", "Mau Mau"],
    type: "milestone",
  },
  {
    id: "s5",
    title: "Sundays at the Homestead",
    content: `If you grew up in the Nganga household, Sunday was sacred — not just for church, but for what came after. Nyambura would begin cooking before dawn: githeri simmering on the jiko, chapati dough resting under a cloth, chicken slow-roasting over charcoal. By noon, the compound would fill with the sound of arriving cars, children's laughter, and the inevitable argument about politics between the uncles.

Nganga would sit in his favorite chair on the veranda, a cup of sweet chai in hand, watching his family with quiet satisfaction. Waithera would be in the kitchen helping her mother, Wangari would be chasing the younger cousins, and Joseph would be fixing something — there was always something to fix. Kariuki would arrive late, as usual, with a cooler full of fish from Mombasa and apologies that fooled no one.

These Sunday gatherings continued for decades, evolving as children grew and married and had children of their own. Even after Nganga's passing in 2008, the tradition held. The family still gathers at the Nyeri homestead every few months, and Nyambura's recipes are followed to the letter. Some things, the family agreed, are too important to let go.`,
    author: "Wangari Nganga",
    date: "2021-01-15",
    personIds: ["p3", "p4", "p10", "p7", "p6", "p8"],
    tags: ["tradition", "family gatherings", "Nyeri", "food"],
    type: "tradition",
  },
  {
    id: "s6",
    title: "The Headmaster's Last Lesson",
    content: `In 2007, a year before he passed, Nganga wa Muchai called his children to the homestead for what he said was an important meeting. They arrived expecting news about land or finances. Instead, they found their father sitting under the mugumo tree his own father had planted a century before, with a cardboard box beside him.

Inside the box were notebooks — dozens of them — filled with Nganga's handwriting. Stories of the family, proverbs he had collected, songs in Kikuyu he feared would be forgotten, and letters he had written to each of his children and grandchildren but never sent. "I am giving you your inheritance," he said. "Not the land. The land will sort itself out. This is what matters."

Joseph remembers the silence that followed, broken only by Wangari's soft crying. They divided the notebooks that evening, each person taking the letters addressed to them and the stories they cherished most. It was, Joseph says, the greatest gift their father ever gave them, and the reason this family story project exists today.`,
    author: "Joseph Muchai Nganga",
    date: "2022-06-18",
    personIds: ["p3", "p6"],
    tags: ["legacy", "wisdom", "notebooks", "inheritance"],
    type: "milestone",
  },
  {
    id: "s7",
    title: "The Women Who Held the Roof",
    content: `There is a Kikuyu saying: "Mũtĩ mũnene wĩthaganĩrio nĩ mĩtĩ mĩnini" — a big tree is supported by smaller ones. In the Nganga family, the women were those supporting trees, though there was nothing small about them.

Waithera stayed in Nyeri when her siblings scattered to cities and continents. She milked the cows at dawn, managed the farm accounts, nursed her parents through their final illnesses, and somehow still found time to raise four children and feed every visitor who appeared at the gate. She never complained, though Wangari suspects she had plenty of reason to.

Wangari herself chose a different path — professional life in Nakuru — but returned home every weekend for years to help with her parents' care. The sisters developed a rhythm, a wordless coordination born of shared purpose. When Daniel, Waithera's son, took over the farm, both women cried. Not from sadness, but from the relief of knowing the homestead was in good hands for another generation.`,
    author: "Wangari Nganga",
    date: "2023-03-08",
    personIds: ["p10", "p7", "p4", "p15"],
    tags: ["women", "caregiving", "Nyeri", "strength"],
    type: "memory",
  },
  {
    id: "s8",
    title: "From Nyeri to Nairobi",
    content: `When Joseph left for Nairobi in 1982, he carried a single suitcase and his father's warning: "The city will try to make you forget who you are. Do not let it." He found a room in Eastleigh, started work at the Kenya Posts and Telecommunications Corporation, and spent his first paycheck on a bus ticket home.

The early years were hard. Nairobi in the 1980s was a city of stark contrasts — gleaming new buildings alongside sprawling informal settlements, opportunity side by side with struggle. Joseph worked long hours, studied at night for his engineering credentials, and slowly built a life. When Kariuki arrived a few years later, bound for the coast, they shared that tiny Eastleigh room for three months. Kariuki still insists Joseph snored loud enough to rattle the windows.

What Joseph never forgot was his father's charge to stay connected. He became the family's Nairobi anchor — meeting relatives at the bus station, helping cousins find jobs, hosting holiday dinners in his small apartment. By the time he married and moved to a house in Karen, his home had already earned the nickname "Nyeri Embassy."`,
    author: "Brian Nganga Muchai",
    date: "2023-09-22",
    personIds: ["p6", "p8"],
    tags: ["migration", "Nairobi", "urban life", "1980s"],
    type: "migration",
  },
  {
    id: "s9",
    title: "Across the Water",
    content: `Grace Muthoni Nganga never planned to leave Kenya permanently. The scholarship to study law in London was supposed to be a two-year adventure before returning home to practice. But London had a way of weaving itself into her life — the libraries, the theatre, the unexpected friendships, and eventually, a career she could not walk away from.

The hardest part was not the distance but the guilt. While her siblings dealt with aging parents, land disputes, and the daily realities of life in Kenya, Muthoni sent money and phone calls — valuable, but not the same as presence. She threw herself into diaspora work instead, helping Kenyans in the UK navigate immigration law, often pro bono.

Her daughter Sarah was born in London but raised on stories of Nyeri. Muthoni made sure of that. Every school holiday, they flew to Kenya, and Sarah would follow her cousin Daniel around the farm, fascinated by cows and red soil. "I want her to know that home is not just a place you visit," Muthoni told Wangari. "It is a place that lives inside you."`,
    author: "Grace Muthoni Nganga",
    date: "2022-12-01",
    personIds: ["p9", "p14", "p7"],
    tags: ["diaspora", "London", "identity", "migration"],
    type: "migration",
  },
  {
    id: "s10",
    title: "The Cousins' Pact",
    content: `It happened at the 2018 family reunion in Nyeri, the big one held every five years. Brian, Angela, Kevin, Sarah, and Daniel — the eldest of the grandchildren — sat around a bonfire long after the adults had gone to bed. The conversation started with jokes and memories but turned serious as the night deepened.

They talked about what it meant to be the next generation — scattered across Nairobi, Mombasa, London, Toronto, and Nyeri. They worried about losing touch, about the family stories fading, about the homestead eventually being sold. It was Brian who suggested building something digital, a platform where the family could share stories, photos, and stay connected. Angela proposed including the environmental history of their land. Kevin offered to fund the initial work.

They called it the Cousins' Pact: a promise to keep the family's memory alive and to gather at the homestead at least once every five years, no matter where life took them. Daniel, who had stayed closest to home, was quiet for a moment. Then he smiled and said, "You all go build the app. I will make sure there is still a home to come back to."`,
    author: "Brian Nganga Muchai",
    date: "2023-11-30",
    personIds: ["p11", "p12", "p13", "p14", "p15", "p6", "p8"],
    tags: ["reunion", "next generation", "technology", "promise"],
    type: "milestone",
  },
  {
    id: "s11",
    title: "Roots in New Soil",
    content: `Angela Wanjiku Muchai arrived in Toronto in 2015 with two suitcases, a PhD offer from the University of Toronto, and a small bag of soil from the Nyeri homestead. The soil sat in a jar on her desk throughout her studies — a reminder of where she came from and why her research on climate adaptation mattered.

In Canada, Angela found a small but vibrant Kenyan community. Sunday afternoons were spent in a Kikuyu family's living room in Scarborough, eating mukimo and speaking a mix of Kikuyu, Swahili, and English. Her children, born in Toronto, learned to say "Nĩ wega" before "thank you." It was her way of honoring her great-grandmother Wanjiku, the herbalist of Murang'a, who believed that knowing your language was knowing your soul.

When Sarah visited from London, the two cousins would cook Nyambura's recipes together — chapati that never came out quite right, chai that was always too sweet — and video-call Aunt Waithera in Nyeri for corrections. These kitchen sessions, messy and full of laughter, became their own form of homecoming.`,
    author: "Angela Wanjiku Muchai",
    date: "2024-02-14",
    personIds: ["p12", "p14", "p2", "p10"],
    tags: ["diaspora", "Toronto", "language", "identity"],
    type: "migration",
  },
  {
    id: "s12",
    title: "Building the Family Tree",
    content: `The idea for the Nganga wa Muchai family platform came from two sources: Grandfather Nganga's notebooks and a frustration with forgetting. Brian had been at a tech meetup in Nairobi when someone mentioned knowledge graphs and he thought immediately of his family — all those stories, connections, and histories that lived in scattered notebooks, WhatsApp groups, and aging memories.

He called Angela first. She was excited but practical: "It has to be something everyone can use, not just the tech people." Then Daniel, who said the farm records alone would fill a database. Together, the three of them sketched out what the platform should be: a living family tree, a story archive, a timeline of the family's journey from Murang'a to the world.

The hardest part was not the coding but the conversations. Sitting with Aunt Wangari as she narrated fifty years of memories, recording Uncle Kariuki's rambling but golden stories over the phone from Mombasa, and transcribing Aunt Muthoni's careful recollections from London. Each conversation was a gift. "We are not just building an app," Brian told his cousins. "We are saying to our grandparents: we heard you. We remember."`,
    author: "Brian Nganga Muchai",
    date: "2024-08-20",
    personIds: ["p11", "p12", "p15", "p3"],
    tags: ["technology", "preservation", "storytelling", "project"],
    type: "milestone",
  },
];

// --------------- Story Trails ---------------
export const seedStoryTrails = [
  {
    id: "t1",
    title: "From Murang'a to the World",
    description:
      "Follow the Nganga family's journey from the ancestral hills of Murang'a across Kenya and beyond — a story of roots, migration, and staying connected across distance.",
    storyIds: ["s1", "s2", "s4", "s8", "s9", "s11"],
  },
  {
    id: "t2",
    title: "The Women of the Family",
    description:
      "The matriarchs who held the family together — from Wanjiku's medicine garden to Nyambura's Sunday feasts to Waithera's steady guardianship of the homestead.",
    storyIds: ["s3", "s5", "s7", "s9", "s11"],
  },
  {
    id: "t3",
    title: "Passing the Torch",
    description:
      "How one generation's values shaped the next — from Muchai's land, to Nganga's notebooks, to the grandchildren's pact to preserve it all.",
    storyIds: ["s1", "s6", "s10", "s12"],
  },
  {
    id: "t4",
    title: "Traditions That Endure",
    description:
      "Sunday gatherings, herbal remedies, and the rituals that keep a family anchored across generations and geographies.",
    storyIds: ["s3", "s5", "s7"],
  },
];

// --------------- Timeline Events ---------------
export const seedEvents = [
  {
    id: "e1",
    title: "Birth of Muchai wa Kamau",
    description: "The family patriarch is born in the hills of Murang'a, Central Kenya.",
    year: 1882,
    personIds: ["p1"],
    type: "birth",
  },
  {
    id: "e2",
    title: "Muchai Plants the Mugumo Tree",
    description:
      "Muchai plants a sacred fig tree on the family land, marking the boundary and establishing a spiritual anchor for the homestead.",
    year: 1910,
    personIds: ["p1"],
    type: "milestone",
  },
  {
    id: "e3",
    title: "Birth of Nganga wa Muchai",
    description: "Nganga, the future family patriarch and educator, is born in Murang'a.",
    year: 1924,
    personIds: ["p3"],
    type: "birth",
  },
  {
    id: "e4",
    title: "Nganga Marries Nyambura",
    description:
      "Nganga wa Muchai and Nyambura are joined in marriage in a ceremony that blends Kikuyu tradition with Christian practice.",
    year: 1953,
    personIds: ["p3", "p4"],
    type: "marriage",
  },
  {
    id: "e5",
    title: "Muchai wa Kamau Passes Away",
    description:
      "The family elder passes on, leaving behind a legacy of land, wisdom, and a mugumo tree that still stands.",
    year: 1954,
    personIds: ["p1"],
    type: "milestone",
  },
  {
    id: "e6",
    title: "Nganga Joins Independence Movement",
    description:
      "Nganga leaves his teaching post to join the struggle for Kenyan independence from British colonial rule.",
    year: 1952,
    personIds: ["p3"],
    type: "milestone",
  },
  {
    id: "e7",
    title: "Kenyan Independence — Uhuru",
    description:
      "Kenya gains independence on December 12. Nganga is among those who witness the raising of the new flag in Nyeri.",
    year: 1963,
    personIds: ["p3"],
    type: "achievement",
  },
  {
    id: "e8",
    title: "Nganga Becomes Headmaster",
    description:
      "Nganga is appointed headmaster of a primary school in Nyeri, beginning decades of service to education.",
    year: 1965,
    personIds: ["p3"],
    type: "achievement",
  },
  {
    id: "e9",
    title: "Joseph Moves to Nairobi",
    description:
      "Joseph Muchai Nganga relocates to Nairobi to work in telecommunications, becoming the family's urban anchor.",
    year: 1982,
    personIds: ["p6"],
    type: "migration",
  },
  {
    id: "e10",
    title: "Grace Moves to London",
    description:
      "Grace Muthoni Nganga earns a scholarship to study law in London, beginning the family's diaspora chapter.",
    year: 1992,
    personIds: ["p9"],
    type: "migration",
  },
  {
    id: "e11",
    title: "Passing of Nganga wa Muchai",
    description:
      "The family patriarch passes away peacefully in Nyeri, leaving behind notebooks filled with family stories and wisdom.",
    year: 2008,
    personIds: ["p3"],
    type: "milestone",
  },
  {
    id: "e12",
    title: "Angela Moves to Toronto",
    description:
      "Angela Wanjiku Muchai begins her PhD in environmental science at the University of Toronto.",
    year: 2015,
    personIds: ["p12"],
    type: "migration",
  },
  {
    id: "e13",
    title: "Passing of Nyambura",
    description:
      "Nyambura wa Nganga, the beloved matriarch, passes away in Nyeri surrounded by her children.",
    year: 2015,
    personIds: ["p4"],
    type: "milestone",
  },
  {
    id: "e14",
    title: "The Cousins' Pact",
    description:
      "At the 2018 family reunion, the grandchildren vow to preserve the family's stories and gather at the homestead every five years.",
    year: 2018,
    personIds: ["p11", "p12", "p13", "p14", "p15"],
    type: "milestone",
  },
  {
    id: "e15",
    title: "Family Story Platform Begins",
    description:
      "Brian, Angela, and Daniel begin building a digital platform to preserve and share the Nganga family's stories.",
    year: 2024,
    personIds: ["p11", "p12", "p15"],
    type: "achievement",
  },
];
