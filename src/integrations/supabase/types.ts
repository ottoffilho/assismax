export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          dados_antigos: Json | null
          dados_novos: Json | null
          id: string
          id_registro: string
          ip_address: unknown | null
          nome_tabela: string
          operacao: string
          timestamp: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          id_registro: string
          ip_address?: unknown | null
          nome_tabela: string
          operacao: string
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          id_registro?: string
          ip_address?: unknown | null
          nome_tabela?: string
          operacao?: string
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      consentimentos: {
        Row: {
          aceite_marketing: boolean
          aceite_termos: boolean
          aceite_whatsapp: boolean
          id: string
          ip_origem: unknown | null
          lead_id: string | null
          politica_versao: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          aceite_marketing?: boolean
          aceite_termos: boolean
          aceite_whatsapp?: boolean
          id?: string
          ip_origem?: unknown | null
          lead_id?: string | null
          politica_versao?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          aceite_marketing?: boolean
          aceite_termos?: boolean
          aceite_whatsapp?: boolean
          id?: string
          ip_origem?: unknown | null
          lead_id?: string | null
          politica_versao?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consentimentos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas: {
        Row: {
          canal: string
          funcionario_id: string | null
          id: string
          lead_id: string | null
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          timestamp: string | null
          tipo: string
        }
        Insert: {
          canal: string
          funcionario_id?: string | null
          id?: string
          lead_id?: string | null
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          timestamp?: string | null
          tipo: string
        }
        Update: {
          canal?: string
          funcionario_id?: string | null
          id?: string
          lead_id?: string | null
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          timestamp?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas_ia: {
        Row: {
          contexto: Json | null
          id: string
          lead_id: string | null
          mensagem: string
          resposta: string
          timestamp: string | null
        }
        Insert: {
          contexto?: Json | null
          id?: string
          lead_id?: string | null
          mensagem: string
          resposta: string
          timestamp?: string | null
        }
        Update: {
          contexto?: Json | null
          id?: string
          lead_id?: string | null
          mensagem?: string
          resposta?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_ia_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          configuracoes: Json | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          plano: string | null
          slug: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          plano?: string | null
          slug: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          plano?: string | null
          slug?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean | null
          configuracoes: Json | null
          created_at: string | null
          email: string
          empresa_id: string | null
          id: string
          nivel_acesso: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          email: string
          empresa_id?: string | null
          id?: string
          nivel_acesso?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          configuracoes?: Json | null
          created_at?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nivel_acesso?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string | null
          dados_adicionais: Json | null
          email: string
          empresa_id: string | null
          funcionario_id: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: string | null
          status: string | null
          telefone: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dados_adicionais?: Json | null
          email: string
          empresa_id?: string | null
          funcionario_id?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: string | null
          telefone: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dados_adicionais?: Json | null
          email?: string
          empresa_id?: string | null
          funcionario_id?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: string | null
          telefone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas: {
        Row: {
          data: string | null
          empresa_id: string | null
          id: string
          metadata: Json | null
          timestamp: string | null
          tipo: string
          valor: number | null
        }
        Insert: {
          data?: string | null
          empresa_id?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          tipo: string
          valor?: number | null
        }
        Update: {
          data?: string | null
          empresa_id?: string | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          tipo?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string | null
          empresa_id: string | null
          estoque: number | null
          id: string
          imagem_url: string | null
          nome: string
          preco_atacado: number | null
          preco_varejo: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          estoque?: number | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco_atacado?: number | null
          preco_varejo?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          empresa_id?: string | null
          estoque?: number | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco_atacado?: number | null
          preco_varejo?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_proprietario: {
        Row: {
          empresa: string | null
          leads_convertidos: number | null
          leads_em_atendimento: number | null
          leads_hoje: number | null
          leads_novos: number | null
          leads_semana: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      performance_funcionarios: {
        Row: {
          funcionario: string | null
          leads_atribuidos: number | null
          leads_convertidos: number | null
          taxa_conversao: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
