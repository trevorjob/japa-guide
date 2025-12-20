import apiClient from './api';
import type {
  Country,
  CountryListData,
  VisaType,
  Roadmap,
  RoadmapFormData,
  RoadmapStepStatus,
  CostCalculation,
  CostCalculatorFormData,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  Story,
  GeoPoint,
  PaginatedResponse,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  User,
  SessionStatus,
  CountryFilters,
} from '@/types';

// ============ Auth Services ============

export const authService = {
  async register(data: RegisterData): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  async claimSession(): Promise<{ message: string; claimed_roadmaps: number }> {
    const response = await apiClient.post('/auth/claim-session/');
    return response.data;
  },

  async getSessionStatus(): Promise<SessionStatus> {
    const response = await apiClient.get('/session/status/');
    return response.data;
  },
};

// ============ Country Services ============

export interface CountryDocument {
  id: number;
  country: number;
  country_name: string;
  country_code: string;
  title: string;
  content: string;
  doc_type: 'overview' | 'visas' | 'work' | 'study' | 'family' | 'asylum' | 'citizenship';
  doc_type_display: string;
  source: number | null;
  source_name: string | null;
  data_confidence: 'low' | 'medium' | 'high';
  needs_review: boolean;
  word_count: number;
  updated_at: string;
}

export const countryService = {
  async getAll(filters?: CountryFilters): Promise<CountryListData[]> {
    const params: any = {};
    if (filters?.region) params.region = filters.region;
    if (filters?.difficulty_score) params.difficulty_score = filters.difficulty_score;
    if (filters?.search) params.search = filters.search;
    if (filters?.difficulty_score__gte !== undefined) params.difficulty_score__gte = filters.difficulty_score__gte;
    if (filters?.difficulty_score__lte !== undefined) params.difficulty_score__lte = filters.difficulty_score__lte;

    const response = await apiClient.get('/countries/', { params });
    return response.data;
  },

  async getById(id: number): Promise<Country> {
    const response = await apiClient.get(`/countries/${id}/`);
    return response.data;
  },

  async getByCode(code: string): Promise<Country> {
    const response = await apiClient.get(`/countries/${code}/`);
    return response.data;
  },

  async calculateCost(countryCode: string, formData: CostCalculatorFormData): Promise<CostCalculation> {
    const response = await apiClient.post(`/countries/${countryCode}/calculate-cost/`, formData);
    return response.data;
  },

  async getDocuments(countryCode: string, docType?: string): Promise<CountryDocument[]> {
    const params: any = {};
    if (docType) params.doc_type = docType;
    const response = await apiClient.get(`/countries/${countryCode}/documents/`, { params });
    return response.data;
  },
};

// ============ Visa Services ============

export const visaService = {
  async getByCountry(countryId: number): Promise<VisaType[]> {
    const response = await apiClient.get(`/visas/?country_id=${countryId}`);
    return response.data.results || response.data;
  },

  async getById(id: number): Promise<VisaType> {
    const response = await apiClient.get(`/visas/${id}/`);
    return response.data;
  },
};

// ============ Roadmap Services ============

export const roadmapService = {
  async generate(data: RoadmapFormData): Promise<Roadmap> {
    const response = await apiClient.post('/roadmaps/generate/', data);
    return response.data;
  },

  async getAll(): Promise<PaginatedResponse<Roadmap>> {
    const response = await apiClient.get('/roadmaps/');
    return response.data;
  },

  async getById(id: number): Promise<Roadmap> {
    const response = await apiClient.get(`/roadmaps/${id}/`);
    return response.data;
  },

  async update(id: number, data: Partial<RoadmapFormData>): Promise<Roadmap> {
    const response = await apiClient.patch(`/roadmaps/${id}/`, data);
    return response.data;
  },

  async markStepComplete(
    roadmapId: number,
    stepId: number,
    notes?: string
  ): Promise<RoadmapStepStatus> {
    const response = await apiClient.post(`/roadmaps/${roadmapId}/steps/${stepId}/complete/`, {
      notes: notes || '',
    });
    return response.data;
  },

  async markStepIncomplete(roadmapId: number, stepId: number): Promise<RoadmapStepStatus> {
    const response = await apiClient.post(`/roadmaps/${roadmapId}/steps/${stepId}/incomplete/`);
    return response.data;
  },

  async blockStep(
    roadmapId: number,
    stepId: number,
    reason: string
  ): Promise<RoadmapStepStatus> {
    const response = await apiClient.post(`/roadmaps/${roadmapId}/steps/${stepId}/block/`, {
      reason,
    });
    return response.data;
  },

  async unblockStep(roadmapId: number, stepId: number): Promise<RoadmapStepStatus> {
    const response = await apiClient.post(`/roadmaps/${roadmapId}/steps/${stepId}/unblock/`);
    return response.data;
  },
};

// ============ Cost Calculator Services ============

export const costService = {
  async calculate(data: CostCalculatorFormData): Promise<CostCalculation> {
    const response = await apiClient.post('/calculator/calculate/', data);
    return response.data;
  },

  async compare(country1: number, country2: number): Promise<{ country1: CostCalculation; country2: CostCalculation }> {
    const response = await apiClient.get(`/calculator/compare/?country1=${country1}&country2=${country2}`);
    return response.data;
  },
};

// ============ AI Chat Services ============

export const aiService = {
  async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post('/ai/chat/', data);
    return response.data;
  },

  async compareCountries(
    leftCountry: string,
    rightCountry: string,
    metrics?: string[]
  ): Promise<{ comparison: string }> {
    const response = await apiClient.post('/ai/compare/', {
      left: leftCountry,
      right: rightCountry,
      metrics: metrics || ['cost', 'difficulty', 'visa_options'],
    });
    return response.data;
  },

  getPersonalities() {
    return [
      {
        id: 'helpful',
        name: 'Helpful Assistant',
        emoji: '🤝',
        description: 'Professional and informative',
        tone: 'Clear, concise, and factual',
      },
      {
        id: 'uncle_japa',
        name: 'Uncle Japa',
        emoji: '👨🏾‍💼',
        description: 'Keeps it real',
        tone: 'Nigerian uncle with street wisdom',
      },
      {
        id: 'bestie',
        name: 'Your Bestie',
        emoji: '💅🏽',
        description: 'Spills the tea',
        tone: 'Gen-Z slang and casual vibes',
      },
      {
        id: 'strict_officer',
        name: 'Immigration Officer',
        emoji: '👮',
        description: 'By the book',
        tone: 'Formal and precise',
      },
      {
        id: 'hype_man',
        name: 'Hype Man',
        emoji: '🔥',
        description: 'ALL CAPS ENERGY!',
        tone: 'Motivational and enthusiastic',
      },
      {
        id: 'therapist',
        name: 'Migration Therapist',
        emoji: '🧘',
        description: 'Emotional support',
        tone: 'Empathetic and calming',
      },
    ];
  },
};

// ============ Story Services ============

export const storyService = {
  async getAll(countryId?: number): Promise<PaginatedResponse<Story>> {
    const params = countryId ? { country: countryId } : {};
    const response = await apiClient.get('/stories/', { params });
    return response.data;
  },

  async getById(id: number): Promise<Story> {
    const response = await apiClient.get(`/stories/${id}/`);
    return response.data;
  },

  async create(data: Partial<Story>): Promise<Story> {
    const response = await apiClient.post('/stories/', data);
    return response.data;
  },

  async like(id: number): Promise<{ like_count: number }> {
    const response = await apiClient.post(`/stories/${id}/like/`);
    return response.data;
  },
};

// ============ Map/Geo Services ============

export const geoService = {
  async getPoints(countryId: number, type?: string): Promise<GeoPoint[]> {
    const params: any = { country: countryId };
    if (type) params.type = type;
    const response = await apiClient.get('/maps/', { params });
    return response.data.results || response.data;
  },
};

// ============ Export all services ============

export default {
  auth: authService,
  countries: countryService,
  visas: visaService,
  roadmaps: roadmapService,
  costs: costService,
  ai: aiService,
  stories: storyService,
  geo: geoService,
};
