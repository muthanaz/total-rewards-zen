export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_saved_reports: {
        Row: {
          admin_user_id: string
          created_at: string | null
          data_snapshot: Json | null
          filters: Json | null
          id: string
          report_name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          data_snapshot?: Json | null
          filters?: Json | null
          id?: string
          report_name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          data_snapshot?: Json | null
          filters?: Json | null
          id?: string
          report_name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      benefit_entitlements: {
        Row: {
          annual_allowance: number
          benefit_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          utilized_amount: number | null
        }
        Insert: {
          annual_allowance: number
          benefit_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          utilized_amount?: number | null
        }
        Update: {
          annual_allowance?: number
          benefit_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          utilized_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_entitlements_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      benefits: {
        Row: {
          annual_value: number | null
          benefit_type: Database["public"]["Enums"]["benefit_type"]
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          life_area: Database["public"]["Enums"]["life_area"]
          name: string
          policy_bullets: string[] | null
        }
        Insert: {
          annual_value?: number | null
          benefit_type: Database["public"]["Enums"]["benefit_type"]
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          life_area: Database["public"]["Enums"]["life_area"]
          name: string
          policy_bullets?: string[] | null
        }
        Update: {
          annual_value?: number | null
          benefit_type?: Database["public"]["Enums"]["benefit_type"]
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          life_area?: Database["public"]["Enums"]["life_area"]
          name?: string
          policy_bullets?: string[] | null
        }
        Relationships: []
      }
      children: {
        Row: {
          created_at: string | null
          date_of_birth: string
          grade: string | null
          id: string
          name: string
          school_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          grade?: string | null
          id?: string
          name: string
          school_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          grade?: string | null
          id?: string
          name?: string
          school_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_audit: {
        Row: {
          document_type: string
          document_variant: string | null
          generated_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          document_type: string
          document_variant?: string | null
          generated_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          document_type?: string
          document_variant?: string | null
          generated_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_satisfaction_ratings: {
        Row: {
          category: string
          created_at: string
          feedback: string | null
          id: string
          period_month: number
          period_year: number
          rating: number
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          feedback?: string | null
          id?: string
          period_month?: number
          period_year?: number
          rating: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          feedback?: string | null
          id?: string
          period_month?: number
          period_year?: number
          rating?: number
          user_id?: string
        }
        Relationships: []
      }
      health_providers: {
        Row: {
          address: string | null
          area: string
          created_at: string | null
          id: string
          in_network: boolean | null
          name: string
          phone: string | null
          provider_type: string
          rating: number | null
          specialty: string | null
        }
        Insert: {
          address?: string | null
          area: string
          created_at?: string | null
          id?: string
          in_network?: boolean | null
          name: string
          phone?: string | null
          provider_type: string
          rating?: number | null
          specialty?: string | null
        }
        Update: {
          address?: string | null
          area?: string
          created_at?: string | null
          id?: string
          in_network?: boolean | null
          name?: string
          phone?: string | null
          provider_type?: string
          rating?: number | null
          specialty?: string | null
        }
        Relationships: []
      }
      housing_areas: {
        Row: {
          avg_rent_1br: number | null
          avg_rent_2br: number | null
          avg_rent_3br: number | null
          avg_rent_studio: number | null
          commute_to_difc_mins: number | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          avg_rent_1br?: number | null
          avg_rent_2br?: number | null
          avg_rent_3br?: number | null
          avg_rent_studio?: number | null
          commute_to_difc_mins?: number | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          avg_rent_1br?: number | null
          avg_rent_2br?: number | null
          avg_rent_3br?: number | null
          avg_rent_studio?: number | null
          commute_to_difc_mins?: number | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      housing_listings: {
        Row: {
          amenities: string[] | null
          annual_rent: number
          area: string
          bathrooms: number
          bayut_url: string | null
          bedrooms: number
          created_at: string | null
          dubizzle_url: string | null
          id: string
          image_url: string | null
          property_finder_url: string | null
          rating: number | null
          title: string
        }
        Insert: {
          amenities?: string[] | null
          annual_rent: number
          area: string
          bathrooms: number
          bayut_url?: string | null
          bedrooms: number
          created_at?: string | null
          dubizzle_url?: string | null
          id?: string
          image_url?: string | null
          property_finder_url?: string | null
          rating?: number | null
          title: string
        }
        Update: {
          amenities?: string[] | null
          annual_rent?: number
          area?: string
          bathrooms?: number
          bayut_url?: string | null
          bedrooms?: number
          created_at?: string | null
          dubizzle_url?: string | null
          id?: string
          image_url?: string | null
          property_finder_url?: string | null
          rating?: number | null
          title?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          created_at: string | null
          id: string
          leave_type: string
          total_days: number
          used_days: number | null
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          leave_type: string
          total_days: number
          used_days?: number | null
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          leave_type?: string
          total_days?: number
          used_days?: number | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      marketplace_offers: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          discount_percent: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          merchant: string
          rating: number | null
          tags: string[] | null
          terms: string | null
          title: string
          vendor_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          merchant: string
          rating?: number | null
          tags?: string[] | null
          terms?: string | null
          title: string
          vendor_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          merchant?: string
          rating?: number | null
          tags?: string[] | null
          terms?: string | null
          title?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_offers_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      perk_activations: {
        Row: {
          activated_at: string | null
          id: string
          offer_id: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          id?: string
          offer_id: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          id?: string
          offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perk_activations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          region: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          region?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          region?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blood_type: string | null
          cars: string[] | null
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emirates_id: string | null
          employment_date: string | null
          first_name: string | null
          grade: string | null
          home_location: string | null
          id: string
          interests: string[] | null
          last_name: string | null
          manager_name: string | null
          marital_status: string | null
          monthly_salary: number | null
          nationality: string | null
          organization_id: string | null
          passport_number: string | null
          pets: string[] | null
          phone: string | null
          position: string | null
          preferred_language: string | null
          spouse_employer: string | null
          spouse_name: string | null
          updated_at: string | null
          user_id: string
          work_location: string | null
        }
        Insert: {
          avatar_url?: string | null
          blood_type?: string | null
          cars?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emirates_id?: string | null
          employment_date?: string | null
          first_name?: string | null
          grade?: string | null
          home_location?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          manager_name?: string | null
          marital_status?: string | null
          monthly_salary?: number | null
          nationality?: string | null
          organization_id?: string | null
          passport_number?: string | null
          pets?: string[] | null
          phone?: string | null
          position?: string | null
          preferred_language?: string | null
          spouse_employer?: string | null
          spouse_name?: string | null
          updated_at?: string | null
          user_id: string
          work_location?: string | null
        }
        Update: {
          avatar_url?: string | null
          blood_type?: string | null
          cars?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emirates_id?: string | null
          employment_date?: string | null
          first_name?: string | null
          grade?: string | null
          home_location?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          manager_name?: string | null
          marital_status?: string | null
          monthly_salary?: number | null
          nationality?: string | null
          organization_id?: string | null
          passport_number?: string | null
          pets?: string[] | null
          phone?: string | null
          position?: string | null
          preferred_language?: string | null
          spouse_employer?: string | null
          spouse_name?: string | null
          updated_at?: string | null
          user_id?: string
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          amount: number | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          request_type: Database["public"]["Enums"]["request_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          subject: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          request_type: Database["public"]["Enums"]["request_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          request_type?: Database["public"]["Enums"]["request_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          annual_fee: number
          created_at: string | null
          curriculum: string
          facilities: string[] | null
          grade_range: string
          id: string
          location: string
          name: string
          rating: number | null
          website_url: string | null
        }
        Insert: {
          annual_fee: number
          created_at?: string | null
          curriculum: string
          facilities?: string[] | null
          grade_range: string
          id?: string
          location: string
          name: string
          rating?: number | null
          website_url?: string | null
        }
        Update: {
          annual_fee?: number
          created_at?: string | null
          curriculum?: string
          facilities?: string[] | null
          grade_range?: string
          id?: string
          location?: string
          name?: string
          rating?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      utilization_events: {
        Row: {
          amount: number | null
          benefit_id: string | null
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          benefit_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          benefit_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "utilization_events_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_transactions: {
        Row: {
          code_used: string | null
          commission_amount: number
          created_at: string | null
          discount_amount: number | null
          id: string
          offer_id: string | null
          original_amount: number
          redeemed_at: string | null
          settled_at: string | null
          status: string | null
          transaction_type: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          code_used?: string | null
          commission_amount: number
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          offer_id?: string | null
          original_amount: number
          redeemed_at?: string | null
          settled_at?: string | null
          status?: string | null
          transaction_type?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          code_used?: string | null
          commission_amount?: number
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          offer_id?: string | null
          original_amount?: number
          redeemed_at?: string | null
          settled_at?: string | null
          status?: string | null
          transaction_type?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_transactions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          commission_rate: number | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          total_revenue: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          commission_rate?: number | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          total_revenue?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          commission_rate?: number | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          total_revenue?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_same_organization: {
        Args: { _target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      benefit_type:
        | "cash_allowances"
        | "health_protection"
        | "time_off_flex"
        | "growth_career"
        | "wealth_ownership"
        | "wellbeing"
      life_area:
        | "home_living"
        | "family_parenting"
        | "health"
        | "money"
        | "career"
        | "lifestyle"
        | "mobility"
      request_status: "pending" | "approved" | "rejected"
      request_type: "claim" | "request" | "question"
      user_role: "employee" | "employer" | "admin" | "vendor"
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
    Enums: {
      benefit_type: [
        "cash_allowances",
        "health_protection",
        "time_off_flex",
        "growth_career",
        "wealth_ownership",
        "wellbeing",
      ],
      life_area: [
        "home_living",
        "family_parenting",
        "health",
        "money",
        "career",
        "lifestyle",
        "mobility",
      ],
      request_status: ["pending", "approved", "rejected"],
      request_type: ["claim", "request", "question"],
      user_role: ["employee", "employer", "admin", "vendor"],
    },
  },
} as const
