/*
  Everything the site says lives in this file.
  Change the text between the quotation marks, save the file and the site updates.

  Each stop is one place on the map. The "at" field is its latitude and longitude,
  and the camera travels there when a visitor scrolls to that stop.

  Scenes you can use for the "scene" field
    ferry, cranes, agents, route, beam, ladies, rings, park, beach, bridge, tower
  A stop with the scene "tower" is a plain pin, so it works anywhere in the city.

  Colors you can use for the "accent" field
    lilac, mint, peach, sky, butter, rose

  To swap the resume, upload a new PDF named resume.pdf over the old one.

  The map artwork is loaded from isometricsf.com. Its license asks for credit and a link,
  so please keep the credit line at the bottom of the page.
*/
window.SITE = {
  name: "Rohit Durbha",
  resume: "resume.pdf",
  email: "rohitdurbha@gmail.com",
  linkedin: "https://www.linkedin.com/in/rohit-durbha",
  github: "https://github.com/rohitDurbha",

  hero: {
    place: "San Francisco",
    coords: "37.7749° N, 122.4194° W",
    lede: "I am a full-stack engineer who builds backend systems and AI products.",
    intro: "I spent three years at Schneider Electric building Python services, REST APIs and data pipelines, and I now build agentic AI products with Node.js, React and LangChain. This site is San Francisco itself. You can roam it freely, or take the walk and stop at everything I have built along the way.",
    hint: "Drag to roam the city and scroll to zoom. Every pin on the map is something I have built."
  },

  stops: [
    {
      id: "experience",
      place: "Ferry Building",
      coords: "37.7955° N, 122.3937° W",
      at: [37.7955, -122.3937],
      scene: "ferry",
      accent: "sky",
      kind: "Experience",
      title: "Three years of shipping at Schneider Electric",
      meta: "Software Developer, Bengaluru, August 2021 to August 2024",
      paragraphs: [
        "Every route into this city starts at the water, and my own route started in Bengaluru. At Schneider Electric I designed, built and maintained REST API services and backend integrations for ML-powered applications running across distributed production systems.",
        "I also shipped LangChain and HuggingFace features that automated knowledge management for operations teams. Before that I interned at Hexagon Global in 2019, writing Python and SQL for production data pipelines and API integrations."
      ],
      stats: [
        { value: "5M+", label: "data points served by the APIs and real-time dashboards" },
        { value: "4M+", label: "customer account records unified by Snowflake and dbt pipelines" },
        { value: "25%", label: "fewer analysis errors across more than 10M production records", fill: 5, of: 20 }
      ]
    },
    {
      id: "toolkit",
      place: "Pier 70, Dogpatch",
      coords: "37.7605° N, 122.3860° W",
      at: [37.7605, -122.3860],
      scene: "cranes",
      accent: "butter",
      kind: "Toolkit",
      title: "The tools I build with",
      paragraphs: [
        "Pier 70 is where the city once built its ships, which makes it a fitting place to lay out the tools."
      ],
      groups: [
        { group: "Frontend", items: "React, TypeScript, JavaScript, HTML, CSS, WebSockets" },
        { group: "Backend and APIs", items: "Node.js, Python, FastAPI, Express.js, REST, GraphQL" },
        { group: "Databases", items: "PostgreSQL, MongoDB, Redis, Snowflake, vector databases" },
        { group: "Generative AI", items: "LangChain, OpenAI API, RAG, agent workflows, prompt engineering" },
        { group: "ML and data", items: "PyTorch, Scikit-learn, Pandas, NumPy, Airflow, Spark" },
        { group: "Cloud and DevOps", items: "AWS, GCP, Docker, Kubernetes, CI/CD, Git" }
      ]
    },
    {
      id: "careerpilot",
      place: "Salesforce Tower, SoMa",
      coords: "37.7897° N, 122.3972° W",
      at: [37.7897, -122.3972],
      scene: "agents",
      accent: "lilac",
      kind: "Build",
      title: "CareerPilot",
      paragraphs: [
        "CareerPilot is an agentic AI platform for the job search. Agents built with LangChain hand work to one another across several steps, scoring how well a role fits and running mock interviews along the way. Real-time dashboards backed by MongoDB track how the platform is performing.",
        "The squares travelling between the towers are agents passing a task down the line."
      ],
      stack: "Node.js, React, TypeScript, LangChain, MongoDB",
      link: { label: "Open the CareerPilot repository", url: "https://github.com/rohitDurbha/CareerPilot" }
    },
    {
      id: "safestride",
      place: "Powell and Market",
      coords: "37.7837° N, 122.4089° W",
      at: [37.7837, -122.4089],
      scene: "route",
      accent: "rose",
      kind: "Build",
      title: "SafeStride",
      paragraphs: [
        "Map apps find the fastest walk home, and SafeStride finds the safest one. It reads live crime data as hot spots and bends every route around them. A Gemini voice agent listens for emergency notes and works out how to respond.",
        "On the map, the dashed route is steering around the blocks that pulse."
      ],
      stack: "Gemini, Flask, React, GraphQL, Vite, Web Speech API",
      link: { label: "Open the SafeStride repository", url: "https://github.com/rohitDurbha/safe-stride" }
    },
    {
      id: "mcp-watcher",
      place: "Coit Tower, Telegraph Hill",
      coords: "37.8024° N, 122.4058° W",
      at: [37.8024, -122.4058],
      scene: "beam",
      accent: "peach",
      kind: "Build",
      title: "MCP Watcher",
      paragraphs: [
        "AI agents trust the tools they are handed, which makes a poisoned tool description a real attack surface. MCP Watcher scans every public MCP server each day, parses source code safely in four languages and pairs rule-based signals with a trained classifier.",
        "The beam sweeping from the tower lights up the 14 attacks it caught, and the two outlined blocks are the ones it missed."
      ],
      stats: [
        { value: "14 / 16", label: "real attacks against agent tools caught", fill: 14, of: 16 }
      ],
      stack: "Python, Scikit-learn, Tree-sitter, GitHub Actions",
      link: { label: "Open the MCP Watcher repository", url: "https://github.com/rohitDurbha/mcp-watcher" }
    },
    {
      id: "filla",
      place: "Painted Ladies, Alamo Square",
      coords: "37.7763° N, 122.4328° W",
      at: [37.7763, -122.4328],
      scene: "ladies",
      accent: "mint",
      kind: "Build",
      title: "Filla",
      paragraphs: [
        "Filla is a Chrome extension that reads a job description, tailors my resume to it and then fills in the application for me to review.",
        "The Painted Ladies share one frame while each wears its own color, and every tailored resume works the same way."
      ],
      stack: "Chrome extension, JavaScript, LaTeX resumes",
      link: { label: "Open the Filla repository", url: "https://github.com/rohitDurbha/Filla" }
    },
    {
      id: "savant",
      place: "Sutro Tower, Twin Peaks",
      coords: "37.7552° N, 122.4528° W",
      at: [37.7552, -122.4528],
      scene: "rings",
      accent: "mint",
      kind: "Build",
      title: "Savant",
      paragraphs: [
        "Savant is an analytics engine where a local language model plans each analysis and a deterministic statistics layer runs every test. A finding only reaches the report after it passes false discovery control, leakage detection and bootstrap stability checks.",
        "The rings leaving the tower are the findings that made it through every check."
      ],
      stack: "Python, statistics, bootstrap validation, local LLMs",
      link: { label: "Open the Savant repository", url: "https://github.com/rohitDurbha/savant" }
    },
    {
      id: "more",
      place: "Golden Gate Park",
      coords: "37.7694° N, 122.4862° W",
      at: [37.7694, -122.4862],
      scene: "park",
      accent: "mint",
      kind: "More builds",
      title: "More builds and research",
      paragraphs: [
        "A few more projects are growing in the park, alongside the research from my master's degree."
      ],
      items: [
        { name: "CareerAtlas", what: "A feed of contract and full-time roles from job boards and staffing portals that powers CareerPilot.", url: "https://github.com/rohitDurbha/contract-atlas" },
        { name: "StudyPilot", what: "An attention-aware study assistant that turns a PDF into short sections and switches to flashcards, quizzes or mind maps when focus starts to slip.", url: "https://github.com/rohitDurbha/study-pilot" },
        { name: "Synthetic data research", what: "My master's project trained AC-GANs to generate data for rare classes and reached 90.86% accuracy using synthetic training data only." }
      ],
      footnote: "M.S. in Data Science, San Jose State University, 2024 to 2026"
    },
    {
      id: "off-hours",
      place: "Ocean Beach",
      coords: "37.7594° N, 122.5107° W",
      at: [37.7594, -122.5080],
      scene: "beach",
      accent: "peach",
      kind: "Off hours",
      title: "Off hours",
      paragraphs: [
        "When the laptop closes I am usually replaying a Pokemon game, watching a film or heading out with a camera.",
        "San Francisco is generous to all three habits. The city is laid out like a route map with a landmark at every stop, the fog lights it like a film set, and the best photographs happen right here when the sun drops into the Pacific."
      ]
    },
    {
      id: "contact",
      place: "Golden Gate Bridge",
      coords: "37.8199° N, 122.4783° W",
      at: [37.8185, -122.4780],
      scene: "bridge",
      accent: "peach",
      kind: "Contact",
      title: "Say hello",
      paragraphs: [
        "I am looking for software engineering roles where I can build backend systems and AI products from end to end. The quickest way across the bridge is an email."
      ],
      contact: true
    }
  ]
};
