export interface AdminMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  metadata?: {
    query_executed?: string;
    data_count?: number;
    raw_data?: any[];
    query_type?: 'leads' | 'funcionarios' | 'produtos' | 'metricas' | 'conversas' | 'general';
    performance_metrics?: {
      execution_time?: number;
      memory_usage?: number;
    };
  };
}

export interface AdminChatbotResponse {
  success: boolean;
  response: string;
  query_executed?: string;
  data_count?: number;
  raw_data?: any[];
  error?: string;
  suggestions?: string[];
  context?: {
    query_type: string;
    confidence_level: number;
    related_queries?: string[];
  };
}

export interface AdminConversationRequest {
  message: string;
  conversation_history: AdminConversationMessage[];
  user_token?: string;
  context?: {
    current_page?: string;
    active_filters?: Record<string, any>;
    user_preferences?: Record<string, any>;
  };
}

export interface AdminConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface DatabaseQueryResult {
  data: any[];
  query: string;
  description: string;
  execution_time?: number;
  affected_rows?: number;
}

export interface BusinessInsight {
  type: 'metric' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  value?: number | string;
  change?: {
    percentage: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  actions?: string[];
}

export interface AdminChatbotSettings {
  auto_suggestions: boolean;
  detailed_explanations: boolean;
  show_raw_data: boolean;
  query_timeout: number;
  max_results_display: number;
}

export interface SecurityContext {
  user_id: string;
  user_email: string;
  access_level: 'admin' | 'funcionario';
  permissions: string[];
  session_id: string;
  last_activity: Date;
}

export interface QueryAnalytics {
  query_id: string;
  user_id: string;
  query_text: string;
  sql_generated: string;
  execution_time: number;
  results_count: number;
  success: boolean;
  error_message?: string;
  timestamp: Date;
  context: {
    page: string;
    user_intent: string;
    complexity_score: number;
  };
}

// Tipos específicos para diferentes domínios de negócio

export interface LeadsAnalytics {
  total_leads: number;
  new_leads_today: number;
  conversion_rate: number;
  average_response_time: number;
  leads_by_source: Array<{
    source: string;
    count: number;
    conversion_rate: number;
  }>;
  leads_by_status: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface FuncionariosPerformance {
  funcionario_id: string;
  nome: string;
  leads_assigned: number;
  leads_converted: number;
  conversion_rate: number;
  average_response_time: number;
  productivity_score: number;
  recent_activity: Array<{
    action: string;
    timestamp: Date;
    lead_id?: string;
  }>;
}

export interface ProductsAnalytics {
  total_products: number;
  most_searched: Array<{
    product_name: string;
    search_count: number;
    conversion_rate: number;
  }>;
  category_performance: Array<{
    category: string;
    interest_level: number;
    conversion_rate: number;
  }>;
  price_optimization: Array<{
    product_id: string;
    current_price: number;
    suggested_price: number;
    reason: string;
  }>;
}

export interface MetricsTrend {
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend_direction: 'up' | 'down' | 'stable';
  period: string;
  forecast?: {
    next_period_value: number;
    confidence_level: number;
  };
}

// Enums para melhor tipagem

export enum QueryComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

export enum UserIntent {
  OVERVIEW = 'overview',
  SPECIFIC_METRIC = 'specific_metric',
  COMPARISON = 'comparison',
  TREND_ANALYSIS = 'trend_analysis',
  TROUBLESHOOTING = 'troubleshooting',
  OPTIMIZATION = 'optimization'
}

export enum ResponseType {
  DIRECT_ANSWER = 'direct_answer',
  DATA_VISUALIZATION = 'data_visualization',
  ACTIONABLE_INSIGHT = 'actionable_insight',
  FOLLOW_UP_QUESTION = 'follow_up_question',
  ERROR_EXPLANATION = 'error_explanation'
}

// Tipos para configurações avançadas

export interface AdvancedQueryConfig {
  enable_predictive_analysis: boolean;
  include_benchmarking: boolean;
  auto_detect_anomalies: boolean;
  suggest_optimizations: boolean;
  max_query_complexity: QueryComplexity;
  cache_results: boolean;
  cache_duration_minutes: number;
}

export interface ChatbotPersonality {
  tone: 'professional' | 'friendly' | 'analytical' | 'supportive';
  expertise_level: 'basic' | 'intermediate' | 'expert';
  response_length: 'concise' | 'detailed' | 'comprehensive';
  include_examples: boolean;
  use_business_terminology: boolean;
}

// Tipos para auditoria e compliance

export interface AuditLog {
  log_id: string;
  user_id: string;
  action: string;
  resource_accessed: string;
  query_executed?: string;
  results_count?: number;
  sensitive_data_accessed: boolean;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
  success: boolean;
  error_details?: string;
}

export interface ComplianceCheck {
  check_id: string;
  rule_name: string;
  rule_description: string;
  query_text: string;
  compliance_status: 'approved' | 'flagged' | 'blocked';
  risk_level: 'low' | 'medium' | 'high';
  justification: string;
  timestamp: Date;
}