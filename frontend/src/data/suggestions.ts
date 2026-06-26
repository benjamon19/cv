export const LOCATIONS = [
  'Madrid, España', 'Barcelona, España', 'Valencia, España', 'Sevilla, España',
  'Bilbao, España', 'Málaga, España', 'Zaragoza, España', 'Murcia, España',
  'Palma de Mallorca, España', 'Las Palmas, España', 'Alicante, España',
  'Ciudad de México, México', 'Guadalajara, México', 'Monterrey, México',
  'Buenos Aires, Argentina', 'Córdoba, Argentina', 'Rosario, Argentina',
  'Bogotá, Colombia', 'Medellín, Colombia', 'Cali, Colombia', 'Barranquilla, Colombia',
  'Santiago, Chile', 'Lima, Perú', 'Caracas, Venezuela', 'Quito, Ecuador',
  'São Paulo, Brasil', 'Rio de Janeiro, Brasil',
  'Remoto', 'Remoto / España', 'Remoto / LATAM', 'Remoto / Europa',
]

export const JOB_TITLES = [
  // Engineering
  'Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Principal Engineer',
  'Frontend Developer', 'Senior Frontend Developer', 'Lead Frontend Developer',
  'Backend Developer', 'Senior Backend Developer', 'Lead Backend Developer',
  'Full Stack Developer', 'Senior Full Stack Developer', 'Lead Full Stack Developer',
  'iOS Developer', 'Android Developer', 'Mobile Developer', 'Flutter Developer',
  'DevOps Engineer', 'Senior DevOps Engineer', 'Site Reliability Engineer',
  'Platform Engineer', 'Infrastructure Engineer', 'Cloud Engineer',
  'Data Engineer', 'Senior Data Engineer', 'Data Scientist', 'Senior Data Scientist',
  'Machine Learning Engineer', 'AI Engineer', 'MLOps Engineer',
  'Security Engineer', 'Cybersecurity Analyst', 'Penetration Tester',
  'QA Engineer', 'SDET', 'Automation Engineer', 'Test Engineer',
  'Engineering Manager', 'Tech Lead', 'CTO', 'VP of Engineering',
  // Product & Design
  'Product Manager', 'Senior Product Manager', 'Principal Product Manager',
  'UX Designer', 'UI Designer', 'Product Designer', 'UX/UI Designer',
  'UX Researcher', 'Interaction Designer', 'Visual Designer', 'Brand Designer',
  // Business
  'Project Manager', 'Program Manager', 'Scrum Master', 'Agile Coach',
  'Business Analyst', 'Financial Analyst', 'Business Intelligence Analyst',
  'Marketing Manager', 'Digital Marketing Specialist', 'Growth Hacker',
  'SEO Specialist', 'SEM Specialist', 'Content Manager', 'Copywriter',
  'Sales Manager', 'Account Executive', 'Business Development Manager',
  'Customer Success Manager', 'Customer Support Lead',
  'HR Manager', 'Talent Acquisition Specialist', 'Recruiter',
  'Operations Manager', 'Chief of Staff',
]

export const DEGREES = [
  'Grado en Ingeniería Informática',
  'Grado en Ingeniería de Software',
  'Grado en Ciencias de la Computación',
  'Grado en Telecomunicaciones',
  'Grado en Matemáticas', 'Grado en Física', 'Grado en Estadística',
  'Grado en Administración de Empresas (ADE)',
  'Grado en Marketing y Publicidad',
  'Grado en Diseño Gráfico', 'Grado en Diseño Digital',
  'Grado en Psicología', 'Grado en Comunicación',
  'Máster en Inteligencia Artificial',
  'Máster en Ciencia de Datos', 'Máster en Big Data',
  'Máster en Ingeniería de Software',
  'Máster en Ciberseguridad',
  'Máster en UX Design',
  'Máster en Dirección de Proyectos',
  'MBA – Master in Business Administration',
  'Bootcamp en Desarrollo Web Full Stack',
  'Bootcamp en Data Science',
  'FP Superior – DAM (Desarrollo de Aplicaciones Multiplataforma)',
  'FP Superior – DAW (Desarrollo de Aplicaciones Web)',
  'FP Superior – ASIR (Administración de Sistemas)',
  'Certificación AWS Solutions Architect',
  'Certificación Google Cloud Professional',
  'Certificación PMP',
]

export const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'Lenguajes': [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C', 'C++', 'C#',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'Bash', 'SQL', 'HTML', 'CSS',
  ],
  'Lenguajes de Programación': [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby',
  ],
  'Frameworks & Librerías': [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'SvelteKit',
    'Node.js', 'Express', 'NestJS', 'Fastify',
    'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Rails', 'Gin',
    'tRPC', 'GraphQL', 'REST', 'WebSockets',
    'React Native', 'Flutter', 'Expo',
    'TailwindCSS', 'Shadcn/ui', 'Material UI', 'Chakra UI',
  ],
  'Bases de Datos': [
    'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite',
    'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
    'Cassandra', 'Neo4j', 'InfluxDB', 'Supabase',
    'Prisma', 'SQLAlchemy', 'TypeORM', 'Drizzle',
  ],
  'DevOps & Cloud': [
    'Docker', 'Kubernetes', 'Helm', 'Terraform', 'Ansible',
    'AWS', 'GCP', 'Azure', 'Vercel', 'Railway', 'Fly.io',
    'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'ArgoCD',
    'Prometheus', 'Grafana', 'Datadog', 'Sentry', 'CI/CD', 'Linux',
  ],
  'Herramientas': [
    'Git', 'GitHub', 'GitLab', 'Jira', 'Linear', 'Notion',
    'Figma', 'Postman', 'VS Code', 'IntelliJ IDEA', 'Vim',
    'Webpack', 'Vite', 'ESBuild', 'Babel',
    'Jest', 'Vitest', 'Cypress', 'Playwright',
  ],
  'Machine Learning': [
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'XGBoost', 'LightGBM',
    'Hugging Face', 'LangChain', 'OpenAI API', 'Transformers',
    'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter',
    'MLflow', 'RAG', 'Computer Vision', 'NLP',
  ],
  'Diseño': [
    'Figma', 'Adobe XD', 'Sketch', 'Adobe Photoshop', 'Adobe Illustrator',
    'Canva', 'Framer', 'Prototyping', 'Design Systems', 'Wireframing',
    'User Research', 'Usability Testing', 'A/B Testing',
  ],
  'Marketing': [
    'Google Analytics', 'GA4', 'SEO', 'SEM', 'Google Ads', 'Meta Ads',
    'HubSpot', 'Salesforce', 'Mailchimp', 'Klaviyo',
    'Copywriting', 'Content Marketing', 'Email Marketing', 'CRM',
  ],
  'Idiomas': [
    'Español (nativo)', 'Inglés (C2 / bilingüe)', 'Inglés (C1 avanzado)',
    'Inglés (B2 alto)', 'Inglés (B1 intermedio)',
    'Francés (B2)', 'Francés (B1)', 'Alemán (B1)', 'Alemán (A2)',
    'Portugués (B2)', 'Catalán (nativo)', 'Italiano (B1)', 'Chino mandarín (A2)',
  ],
  'Metodologías': [
    'Scrum', 'Kanban', 'Agile', 'Lean', 'XP', 'SAFe',
    'TDD', 'BDD', 'DDD', 'Clean Architecture', 'SOLID',
    'Microservicios', 'Event-driven', 'CQRS', 'Hexagonal Architecture',
  ],
  'Soft Skills': [
    'Liderazgo de equipos', 'Comunicación efectiva', 'Resolución de problemas',
    'Trabajo bajo presión', 'Adaptabilidad', 'Gestión del tiempo',
    'Mentoría técnica', 'Presentaciones ejecutivas', 'Pensamiento analítico',
    'Toma de decisiones', 'Negociación', 'Gestión de stakeholders',
  ],
}

export const ACTION_VERBS_ES = [
  'Desarrollé', 'Lideré', 'Implementé', 'Diseñé', 'Arquitecté',
  'Optimicé', 'Reduje', 'Aumenté', 'Mejoré', 'Automaticé',
  'Coordiné', 'Gestioné', 'Escalé', 'Migré', 'Refactoricé',
  'Entregué', 'Lancé', 'Construí', 'Desplegué', 'Integré',
  'Mentoreé', 'Formé', 'Colaboré', 'Negocié', 'Presenté',
  'Investigué', 'Analicé', 'Identifiqué', 'Resolví', 'Simplifiqué',
  'Establecí', 'Definí', 'Planifiqué', 'Creé', 'Configuré',
]

export const ATS_CLICHES = [
  'apasionado', 'apasionada', 'proactivo', 'proactiva', 'dinámico', 'dinámica',
  'innovador', 'innovadora', 'pensamiento fuera de la caja', 'gurú', 'ninja',
  'rockstar', 'jedi', 'gran habilidad', 'muchos años de experiencia',
  'excelentes habilidades comunicativas', 'orientado a resultados',
  'equipo de trabajo', 'trabajador', 'trabajadora',
]

export const ATS_POWER_KEYWORDS = [
  'liderazgo', 'gestión de proyectos', 'desarrollo ágil', 'optimización',
  'reducción de costes', 'aumento de ingresos', 'automatización', 'escalabilidad',
  'integración continua', 'despliegue continuo', 'arquitectura', 'microservicios',
  'KPI', 'ROI', 'OKR', 'stakeholders', 'cross-functional',
]
