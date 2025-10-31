export const TECH_CATEGORIES_FOR_JOBS = {
  "Frontend Development": [
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS"
  ],
  "Backend Development": [
    "Node.js", "Python", "Java", "Go", "Rust", "PHP", "C#", ".NET", "Ruby", "Django", "Spring Boot", "Flask", "Express", "FastAPI", "Laravel"
  ],
  "Mobile Development": [
    "React Native", "Flutter", "iOS (Swift)", "Android (Kotlin)", "Ionic", "Xamarin"
  ],
  "QA & Testing": [
    "Selenium", "Cypress", "Jest", "Playwright", "Pytest", "JUnit", "Test Automation", "Manual Testing", "API Testing", "Performance Testing"
  ],
  "Cloud & Infrastructure": [
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "DevOps", "Jenkins", "GitLab CI", "GitHub Actions"
  ],
  "Databases & Data": [
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Data Engineering", "SQL", "NoSQL", "Oracle", "Apache Kafka", "RabbitMQ"
  ],
  "AI & Machine Learning": [
    "Machine Learning", "AI", "Data Science", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch"
  ],
  "Architecture & Design": [
    "Microservices", "System Design", "Enterprise Architecture", "Cloud Architecture", "Solution Architecture", "API Design"
  ],
  "Leadership & Management": [
    "Engineering Management", "Technical Leadership", "Product & Engineering Strategy", "Team Building", "Agile & Scrum", "Project Management"
  ],
  "Specialized Skills": [
    "Security & Compliance", "Performance Optimization", "CI/CD", "Blockchain", "IoT", "GraphQL", "REST APIs", "WebSockets"
  ]
} as const;

export const TECH_CATEGORIES_FOR_SKILLS = {
  "Frontend Development": [
    "React", "Next.js", "Vue.js", "Angular", "Svelte", "TypeScript", "JavaScript", "HTML/CSS", "Tailwind CSS"
  ],
  "Backend Development": [
    "Node.js", "Python", "Java", "Go", "Rust", "PHP", "C#", ".NET", "Ruby", "Django", "Spring Boot", "Flask", "Express", "FastAPI", "Laravel"
  ],
  "Mobile Development": [
    "React Native", "Flutter", "iOS (Swift)", "Android (Kotlin)", "Ionic", "Xamarin"
  ],
  "QA & Testing": [
    "Selenium", "Cypress", "Jest", "Playwright", "Pytest", "JUnit", "Test Automation", "Manual Testing", "API Testing", "Performance Testing"
  ],
  "Cloud & Infrastructure": [
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "DevOps", "Jenkins", "GitLab CI", "GitHub Actions"
  ],
  "Databases & Data": [
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Data Engineering", "SQL", "NoSQL", "Oracle", "Apache Kafka", "RabbitMQ"
  ],
  "AI & Machine Learning": [
    "Machine Learning", "AI", "Data Science", "Deep Learning", "NLP", "Computer Vision", "TensorFlow", "PyTorch"
  ],
  "Architecture & Design": [
    "Microservices", "System Design", "Enterprise Architecture", "Cloud Architecture", "Solution Architecture", "API Design"
  ],
  "Specialized Skills": [
    "Security & Compliance", "Performance Optimization", "CI/CD", "Blockchain", "IoT", "GraphQL", "REST APIs", "WebSockets"
  ]
} as const;

export const TECH_CATEGORIES = TECH_CATEGORIES_FOR_JOBS;

export const ALL_TECH_OPTIONS = Object.values(TECH_CATEGORIES).flat();

export type TechCategory = keyof typeof TECH_CATEGORIES;
