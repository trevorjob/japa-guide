// Core Types matching backend models

// Country List (for map view)
export interface CountryListData {
  id: number;
  code: string;
  code_alpha2: string;
  name: string;
  region: string;
  subregion?: string;
  currency: string;
  flag_image: string | null;
  flag_svg_url?: string;
  flag_png_url?: string;
  cost_of_living_index: number | null;
  difficulty_score: number | null;
  population: number | null;
  data_quality_score?: number;
  is_featured?: boolean;
}

// Country Detail (full data)
export interface Country {
  // Basic Info
  id: number;
  code: string;
  code_alpha2: string;
  name: string;
  region: string;
  subregion?: string;
  currency: string;
  population: number | null;
  area_sq_km?: number | null;
  flag_image: string | null;
  flag_svg_url?: string;
  flag_png_url?: string;
  hero_image: string | null;
  summary: string;
  
  // Cost & Difficulty
  cost_of_living_index: number | null;
  difficulty_score: number | null;
  avg_rent_monthly_usd: string | null;
  avg_meal_cost_usd: string | null;
  healthcare_monthly_usd: string | null;
  cpi_annual_change?: number | null;
  ppp_conversion_factor?: number | null;
  
  // Migration Metrics (from UNHCR)
  refugees_in?: number | null;
  refugees_out?: number | null;
  asylum_seekers?: number | null;
  net_migration?: number | null;
  idp_count?: number | null;
  
  // Economic Indicators (from World Bank)
  gdp_per_capita_usd?: number | null;
  unemployment_rate?: number | null;
  life_expectancy?: number | null;
  literacy_rate?: number | null;
  
  // Visa Info
  visa_summary?: string;
  visa_types_count?: number;
  visa_last_reviewed?: string | null;
  
  // Data Quality & Tracking
  data_quality_score?: number;
  data_confidence?: 'low' | 'medium' | 'high';
  needs_review?: boolean;
  is_featured?: boolean;
  basic_data_source?: string;
  basic_data_last_synced?: string | null;
  migration_data_source?: string;
  migration_data_last_synced?: string | null;
  economic_data_source?: string;
  economic_data_last_synced?: string | null;
  
  // Metadata & Timestamps
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VisaType {
  id: number;
  country: number;
  name: string;
  description: string;
  category?: string;
  processing_time_min: number;
  processing_time_max: number;
  duration_months?: number | null;
  cost: number;
  cost_usd?: string;
  success_rate: number | null;
  requirements: string | string[];
  restrictions: string | string[];
  benefits: string | string[];
  is_popular: boolean;
  is_renewable?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VisaStep {
  id: number;
  visa_type: number;
  order: number;
  title: string;
  description: string;
  estimated_time: string;
  required_documents: string[];
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user: number;
  education_level: string;
  field_of_study: string;
  years_of_experience: number;
  skills: string[];
  budget_usd: number;
  target_move_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: number;
  user: number | null;
  session_id: string;
  country: number;
  country_name?: string;
  visa_type: number | null;
  goal: string;
  education_level: string;
  field_of_study: string;
  years_experience: number;
  skills: string[];
  budget: number;
  target_date: string | null;
  ai_personality: string;
  is_ai_enriched: boolean;
  created_at: string;
  updated_at: string;
  steps: RoadmapStep[];
}

export interface RoadmapStep {
  id: number;
  roadmap: number;
  order: number;
  title: string;
  description: string;
  estimated_time: string;
  estimated_cost: number;
  tips: string[];
  pitfalls: string[];
  documents_needed: string[];
  ai_advice: string | null;
  created_at: string;
  updated_at: string;
  status?: RoadmapStepStatus;
}

export interface RoadmapStepStatus {
  id: number;
  step: number;
  user: number | null;
  session_id: string;
  is_complete: boolean;
  is_blocked: boolean;
  block_reason: string | null;
  notes: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CostCalculation {
  country: {
    code: string;
    name: string;
    currency: string;
  };
  input: {
    lifestyle: string;
    accommodation: string;
    dining: string;
    transportation: string;
    duration_months: number;
    dependents: number;
  };
  breakdown: {
    housing: number;
    food: number;
    transportation: number;
    utilities: number;
    healthcare: number;
    entertainment: number;
    visa_fees: number;
  };
  totals: {
    monthly: number;
    total: number;
    currency: string;
  };
  savings_plan: {
    monthly_savings_needed: number;
    description: string;
  };
}

export interface CostCalculatorFormData {
  lifestyle: 'budget' | 'moderate' | 'comfortable' | 'luxury';
  accommodation: 'shared' | 'studio' | 'one_bed' | 'two_bed';
  dining: 'cook_home' | 'mix' | 'eat_out';
  transportation: 'public' | 'mix' | 'car';
  duration_months: number;
  dependents: number;
}

export interface AIPersonality {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tone: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  conversationId?: number;
}

export interface ChatRequest {
  message: string;
  tone?: string;
  context?: {
    country?: string;
    visa_type?: string;
    roadmap_id?: number;
  };
  conversation_id?: number;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
  tone: string;
}

export interface Story {
  id: number;
  user: number | null;
  country: number;
  title: string;
  content: string;
  visa_type: string;
  timeline_months: number;
  is_moderated: boolean;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface GeoPoint {
  id: number;
  country: number;
  city: string;
  latitude: number;
  longitude: number;
  type: string;
  name: string;
  description: string;
  metadata: Record<string, any>;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

// Form Types
export interface RoadmapFormData {
  country: string; // Country code like 'USA', 'CAN'
  visa_type_id?: number;
  goal: 'study' | 'work' | 'business' | 'family' | 'other';
  ai_tone: 'helpful' | 'uncle_japa' | 'bestie' | 'strict_officer' | 'hype_man' | 'therapist';
  budget: number;
  target_date: string | null;
  profile: {
    age?: number;
    education?: string;
    experience_years?: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SessionStatus {
  authenticated: boolean;
  session_id: string | null;
  roadmap_count: number;
  can_claim: boolean;
}

// Filter Types
export interface CountryFilters {
  region?: string;
  difficulty_score?: number;
  difficulty_score__gte?: number;
  difficulty_score__lte?: number;
  search?: string;
}
