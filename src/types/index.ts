export interface Service {
  id: string;
  category: 'TECHNOLOGY' | 'CREATIVE' | 'GROWTH';
  title: string;
  description: string;
  icon: string;
  slug: string;
}

export interface Project {
  id: string;
  title: string;
  client?: string;
  category: string;
  description: string;
  image: string;
  year: number;
  slug: string;
  challenge?: string;
  approach?: string;
  impact?: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  category: string;
  challenge: string;
  solution: string;
  result: string;
  image: string;
  slug: string;
}

export interface ContactSubmission {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  serviceRequired: string;
  budgetRange: string;
  projectDetails: string;
}
