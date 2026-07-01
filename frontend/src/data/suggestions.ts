export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const JOB_TITLES = [
  // Tecnología
  'Desarrollador/a de Software', 'Analista de Sistemas', 'Administrador/a de Redes',
  'Técnico en Soporte Informático', 'Analista de Datos', 'Diseñador/a UX/UI',
  // Salud
  'Enfermero/a', 'Técnico en Enfermería de Nivel Superior (TENS)', 'Médico/a General',
  'Kinesiólogo/a', 'Auxiliar de Farmacia', 'Paramédico/a', 'Cuidador/a de Adultos Mayores',
  // Construcción y oficios
  'Maestro/a de Obra', 'Albañil', 'Electricista', 'Gásfiter / Plomero', 'Soldador/a',
  'Jefe/a de Obra', 'Carpintero/a', 'Pintor/a',
  // Minería e industria
  'Operador/a de Maquinaria Pesada', 'Perforista', 'Supervisor/a de Mina', 'Geólogo/a',
  'Ingeniero/a de Minas', 'Mecánico/a Industrial', 'Prevencionista de Riesgos',
  // Gastronomía
  'Chef', 'Cocinero/a', 'Ayudante de Cocina', 'Garzón / Mesera', 'Barista',
  'Administrador/a de Restaurante',
  // Retail y ventas
  'Vendedor/a', 'Cajero/a', 'Encargado/a de Tienda', 'Reponedor/a', 'Supervisor/a de Tienda',
  'Ejecutivo/a de Ventas',
  // Administración y oficina
  'Asistente Administrativo/a', 'Secretario/a', 'Contador/a', 'Recepcionista',
  'Encargado/a de Bodega', 'Analista Contable',
  // Logística y transporte
  'Conductor/a Profesional', 'Chofer de Camión', 'Operador/a de Bodega', 'Encargado/a de Logística',
  // Educación
  'Profesor/a', 'Educador/a de Párvulos', 'Asistente de Aula',
  // Belleza y servicios
  'Peluquero/a', 'Estilista', 'Manicurista',
  // Seguridad
  'Guardia de Seguridad', 'Supervisor/a de Seguridad',
  // Negocios y gestión
  'Gerente de Proyecto', 'Product Manager', 'Especialista en Marketing Digital',
  'Analista Financiero', 'Encargado/a de Recursos Humanos', 'Gerente de Operaciones',
]

export const DEGREES = [
  // Educación superior
  'Licenciatura en Administración de Empresas',
  'Ingeniería Civil Industrial',
  'Ingeniería en Informática',
  'Técnico de Nivel Superior en Enfermería',
  'Técnico de Nivel Superior en Administración',
  'Técnico de Nivel Superior en Prevención de Riesgos',
  'Técnico en Construcción',
  'Técnico en Gastronomía',
  'Pedagogía en Educación Básica',
  'Licenciatura en Psicología',
  'Contador/a Auditor/a',
  // Formación técnica, oficios y capacitación laboral
  'Curso de Operador de Maquinaria Pesada',
  'Certificación en Soldadura Estructural',
  'Curso de Manipulación de Alimentos',
  'Curso de Primeros Auxilios',
  'Licencia de Conducir Profesional Clase A',
  'Curso de Prevención de Riesgos Laborales',
  'Certificación en Electricidad Domiciliaria',
  'Curso de Gasfitería',
  'Certificación de Barista Profesional',
  // Postgrados y certificaciones profesionales
  'MBA – Master in Business Administration',
  'Máster en Dirección de Proyectos',
  'Certificación PMP',
  'Diplomado en Recursos Humanos',
  'Bootcamp en Desarrollo Web Full Stack',
  'Certificación AWS Solutions Architect',
]

export const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  'Oficios y Trabajo Manual': [
    'Soldadura', 'Manejo de maquinaria pesada', 'Electricidad domiciliaria', 'Gasfitería',
    'Carpintería', 'Operación de grúa horquilla', 'Lectura de planos', 'Mantenimiento mecánico',
  ],
  'Salud y Cuidado de Personas': [
    'Primeros auxilios', 'Control de signos vitales', 'Cuidado de pacientes',
    'Administración de medicamentos', 'Bioseguridad', 'Soporte vital básico', 'Manejo de fichas clínicas',
  ],
  'Gastronomía y Alimentos': [
    'Manipulación de alimentos', 'Preparación de alimentos', 'Coctelería', 'Servicio de sala',
    'Gestión de inventario de cocina', 'Normas de higiene alimentaria',
  ],
  'Atención al Cliente y Ventas': [
    'Atención al cliente', 'Manejo de caja', 'Venta consultiva', 'Fidelización de clientes',
    'Resolución de reclamos', 'Manejo de POS',
  ],
  'Administración y Oficina': [
    'Excel avanzado', 'Redacción de documentos', 'Gestión documental', 'Atención telefónica',
    'Facturación', 'Agenda y coordinación',
  ],
  'Logística y Transporte': [
    'Conducción profesional', 'Gestión de rutas', 'Manejo de bodega', 'Control de inventario',
    'Carga y descarga', 'Licencia de conducir clase A',
  ],
  'Construcción': [
    'Lectura de planos', 'Albañilería', 'Instalaciones eléctricas', 'Instalaciones sanitarias',
    'Prevención de riesgos', 'Uso de herramientas de construcción',
  ],
  'Seguridad y Prevención de Riesgos': [
    'Prevención de riesgos laborales', 'Primeros auxilios', 'Uso de EPP', 'Control de accesos',
    'Vigilancia y rondas',
  ],
  'Educación y Formación': [
    'Planificación de clases', 'Evaluación de aprendizajes', 'Manejo de grupos',
    'Diseño curricular', 'Capacitación de adultos',
  ],
  'Lenguajes de Programación': [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C', 'C++', 'C#',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS',
  ],
  'Frameworks & Librerías': [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
    'Spring Boot', 'Laravel', 'React Native', 'Flutter', 'TailwindCSS',
  ],
  'Bases de Datos': [
    'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'DynamoDB', 'Supabase',
  ],
  'DevOps & Cloud': [
    'Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'Azure',
    'GitHub Actions', 'CI/CD', 'Linux',
  ],
  'Herramientas de Desarrollo': [
    'Git', 'GitHub', 'Jira', 'Figma', 'Postman', 'VS Code', 'Webpack', 'Vite', 'Jest', 'Cypress',
  ],
  'Machine Learning': [
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Jupyter', 'NLP', 'Computer Vision',
  ],
  'Diseño': [
    'Figma', 'Adobe XD', 'Sketch', 'Adobe Photoshop', 'Adobe Illustrator',
    'Canva', 'Prototyping', 'Design Systems', 'Wireframing',
  ],
  'Marketing': [
    'Google Analytics', 'SEO', 'SEM', 'Google Ads', 'Meta Ads',
    'HubSpot', 'Copywriting', 'Content Marketing', 'Email Marketing', 'CRM',
  ],
  'Idiomas': [
    'Español (nativo)', 'Inglés (C2 / bilingüe)', 'Inglés (C1 avanzado)',
    'Inglés (B2 alto)', 'Inglés (B1 intermedio)',
    'Francés (B2)', 'Francés (B1)', 'Alemán (B1)', 'Alemán (A2)',
    'Portugués (B2)', 'Catalán (nativo)', 'Italiano (B1)', 'Chino mandarín (A2)',
  ],
  'Metodologías': [
    'Scrum', 'Kanban', 'Agile', 'Lean', 'Mejora continua', 'Gestión de calidad',
  ],
  'Soft Skills': [
    'Liderazgo de equipos', 'Comunicación efectiva', 'Resolución de problemas',
    'Trabajo bajo presión', 'Adaptabilidad', 'Gestión del tiempo',
    'Mentoría', 'Presentaciones', 'Pensamiento analítico',
    'Toma de decisiones', 'Negociación', 'Trabajo en equipo',
  ],
}

export const ROLE_PLACEHOLDER_EXAMPLES = [
  'Encargado/a de Turno', 'Vendedor/a', 'Técnico en Enfermería', 'Soldador/a',
  'Operador/a de Maquinaria', 'Analista Contable', 'Chef de Cocina', 'Conductor/a Profesional',
]

export const HIGHLIGHT_PLACEHOLDER_EXAMPLES = [
  'Ej: Atendí un promedio de 60 clientes diarios, mejorando el tiempo de espera un 20%',
  'Ej: Operé maquinaria pesada cumpliendo el 100% de las normas de seguridad',
  'Ej: Coordiné un equipo de 8 personas en turnos rotativos de cocina',
  'Ej: Reduje el tiempo de entrega en bodega un 25% mediante mejor organización de rutas',
  'Ej: Desarrollé el sistema de pagos, reduciendo fallos un 40%',
  'Ej: Capacité a 15 nuevos colaboradores en procedimientos de atención al cliente',
]

export const DEGREE_PLACEHOLDER_EXAMPLES = [
  'Técnico en Enfermería de Nivel Superior', 'Licencia de Conducir Profesional Clase A',
  'Certificación en Soldadura Estructural', 'Ingeniería Civil Industrial',
  'Curso de Manipulación de Alimentos', 'Técnico en Administración de Empresas',
]

export const AREA_PLACEHOLDER_EXAMPLES = [
  'Salud', 'Construcción y Obras Civiles', 'Gastronomía', 'Administración', 'Minería', 'Tecnología',
]

export const SKILL_CATEGORY_PLACEHOLDER_EXAMPLES = [
  'Atención al Cliente', 'Oficios y Trabajo Manual', 'Idiomas', 'Herramientas y Software',
]

export const SKILL_DETAILS_PLACEHOLDER_EXAMPLES = [
  'Manejo de caja, atención al público, resolución de reclamos',
  'Soldadura, manejo de maquinaria pesada, lectura de planos',
  'Primeros auxilios, control de signos vitales, cuidado de pacientes',
  'Excel avanzado, redacción de informes, gestión documental',
]

export const SUGGESTED_SKILL_CATEGORIES = [
  'Idiomas', 'Herramientas de Desarrollo', 'Atención al Cliente y Ventas',
  'Oficios y Trabajo Manual', 'Administración y Oficina', 'Metodologías', 'Soft Skills',
]

export const SUMMARY_PLACEHOLDER_EXAMPLES = [
  'Técnico en Enfermería con 5 años de experiencia en atención a pacientes en box de urgencia. Certificado en soporte vital básico y manejo de instrumental médico. Reconocido/a por mi capacidad de mantener la calma y precisión bajo presión.',
  'Maestro de obra con 8 años de experiencia liderando cuadrillas en proyectos de construcción residencial e industrial. Especializado en lectura de planos y coordinación de subcontratistas. Entregué más de 20 proyectos dentro de plazo y presupuesto.',
  'Desarrolladora Full-Stack con 5 años de experiencia construyendo aplicaciones web escalables. Especializada en React y Python, con trayectoria en startups de fintech. Lideré la migración de arquitectura monolítica a microservicios, reduciendo los tiempos de respuesta un 40%.',
  'Encargado de tienda con 6 años de experiencia en retail, liderando equipos de hasta 12 vendedores. Aumenté las ventas mensuales un 30% mediante mejor gestión de inventario y capacitación del equipo.',
]

export const ACTION_VERBS_ES = [
  'Atendí', 'Coordiné', 'Gestioné', 'Lideré', 'Capacité', 'Supervisé',
  'Mejoré', 'Reduje', 'Aumenté', 'Organicé', 'Implementé', 'Optimicé',
  'Desarrollé', 'Diseñé', 'Operé', 'Elaboré', 'Vendí', 'Inspeccioné',
  'Entregué', 'Construí', 'Colaboré', 'Negocié', 'Presenté', 'Investigué',
  'Analicé', 'Identifiqué', 'Resolví', 'Simplifiqué', 'Establecí', 'Definí',
  'Planifiqué', 'Creé', 'Formé', 'Mentoreé', 'Arquitecté', 'Automaticé',
  'Escalé', 'Migré', 'Refactoricé', 'Lancé', 'Desplegué', 'Integré', 'Configuré',
]

export const ATS_CLICHES = [
  'apasionado', 'apasionada', 'proactivo', 'proactiva', 'dinámico', 'dinámica',
  'innovador', 'innovadora', 'pensamiento fuera de la caja', 'gurú', 'ninja',
  'rockstar', 'jedi', 'gran habilidad', 'muchos años de experiencia',
  'excelentes habilidades comunicativas', 'orientado a resultados',
  'equipo de trabajo', 'trabajador', 'trabajadora',
]

export const ATS_POWER_KEYWORDS = [
  'liderazgo', 'gestión de proyectos', 'optimización de procesos',
  'reducción de costes', 'aumento de ingresos', 'automatización', 'atención al cliente',
  'control de calidad', 'trabajo en equipo', 'seguridad laboral', 'mejora continua',
  'gestión de inventario', 'capacitación de personal', 'cumplimiento de metas',
  'resolución de problemas', 'KPI', 'ROI',
]
