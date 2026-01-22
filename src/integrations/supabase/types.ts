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
      account_lockouts: {
        Row: {
          email: string
          failed_attempts: number
          id: string
          locked_at: string
          locked_until: string
          notification_sent: boolean
        }
        Insert: {
          email: string
          failed_attempts?: number
          id?: string
          locked_at?: string
          locked_until: string
          notification_sent?: boolean
        }
        Update: {
          email?: string
          failed_attempts?: number
          id?: string
          locked_at?: string
          locked_until?: string
          notification_sent?: boolean
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          action: string
          actor_role: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          outcome: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          outcome?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          outcome?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      benefit_entitlements: {
        Row: {
          annual_allowance: number
          benefit_id: string
          created_at: string | null
          id: string
          organization_id: string | null
          updated_at: string | null
          user_id: string
          utilized_amount: number | null
        }
        Insert: {
          annual_allowance: number
          benefit_id: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
          utilized_amount?: number | null
        }
        Update: {
          annual_allowance?: number
          benefit_id?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
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
          {
            foreignKeyName: "benefit_entitlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_grade_eligibility: {
        Row: {
          annual_allowance: number | null
          benefit_id: string
          coverage_percent: number | null
          created_at: string | null
          dependent_coverage: string | null
          grade: string
          id: string
          is_eligible: boolean
          max_claim_per_transaction: number | null
          max_dependents: number | null
          notes: string | null
          requires_documentation: boolean | null
          updated_at: string | null
          waiting_period_days: number | null
        }
        Insert: {
          annual_allowance?: number | null
          benefit_id: string
          coverage_percent?: number | null
          created_at?: string | null
          dependent_coverage?: string | null
          grade: string
          id?: string
          is_eligible?: boolean
          max_claim_per_transaction?: number | null
          max_dependents?: number | null
          notes?: string | null
          requires_documentation?: boolean | null
          updated_at?: string | null
          waiting_period_days?: number | null
        }
        Update: {
          annual_allowance?: number | null
          benefit_id?: string
          coverage_percent?: number | null
          created_at?: string | null
          dependent_coverage?: string | null
          grade?: string
          id?: string
          is_eligible?: boolean
          max_claim_per_transaction?: number | null
          max_dependents?: number | null
          notes?: string | null
          requires_documentation?: boolean | null
          updated_at?: string | null
          waiting_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_grade_eligibility_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_policy_versions: {
        Row: {
          attachment_url: string | null
          benefit_id: string | null
          created_at: string
          created_by: string | null
          effective_from: string
          effective_until: string | null
          id: string
          organization_id: string | null
          policy_text: string | null
          updated_at: string
          version: number
        }
        Insert: {
          attachment_url?: string | null
          benefit_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_from: string
          effective_until?: string | null
          id?: string
          organization_id?: string | null
          policy_text?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          attachment_url?: string | null
          benefit_id?: string | null
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_until?: string | null
          id?: string
          organization_id?: string | null
          policy_text?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "benefit_policy_versions_benefit_id_fkey"
            columns: ["benefit_id"]
            isOneToOne: false
            referencedRelation: "benefits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_policy_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      benefit_required_documents: {
        Row: {
          benefit_id: string
          conditions: Json | null
          created_at: string
          description: string | null
          description_ar: string | null
          document_name: string
          document_name_ar: string | null
          document_type: string
          id: string
          is_required: boolean | null
          required_for: string | null
        }
        Insert: {
          benefit_id: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          document_name: string
          document_name_ar?: string | null
          document_type: string
          id?: string
          is_required?: boolean | null
          required_for?: string | null
        }
        Update: {
          benefit_id?: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          document_name?: string
          document_name_ar?: string | null
          document_type?: string
          id?: string
          is_required?: boolean | null
          required_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_required_documents_benefit_id_fkey"
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
          organization_id: string | null
          school_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          grade?: string | null
          id?: string
          name: string
          organization_id?: string | null
          school_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          grade?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          school_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_docs: {
        Row: {
          created_at: string
          doc_name: string
          doc_type: string
          file_url: string | null
          id: string
          request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_name: string
          doc_type: string
          file_url?: string | null
          id?: string
          request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_name?: string
          doc_type?: string
          file_url?: string | null
          id?: string
          request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_docs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_internal: boolean
          note: string
          request_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_internal?: boolean
          note: string
          request_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_internal?: boolean
          note?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_notes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      data_access_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          status?: string
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
      employer_action_activity: {
        Row: {
          action_id: string
          actor_user_id: string | null
          created_at: string
          event_payload: Json | null
          event_type: string
          id: string
        }
        Insert: {
          action_id: string
          actor_user_id?: string | null
          created_at?: string
          event_payload?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          action_id?: string
          actor_user_id?: string | null
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_action_activity_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "employer_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_action_comments: {
        Row: {
          action_id: string
          author_user_id: string | null
          comment_text: string
          created_at: string
          id: string
        }
        Insert: {
          action_id: string
          author_user_id?: string | null
          comment_text: string
          created_at?: string
          id?: string
        }
        Update: {
          action_id?: string
          author_user_id?: string | null
          comment_text?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_action_comments_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "employer_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_actions: {
        Row: {
          action_type: string | null
          blockers: string[] | null
          completed_at: string | null
          confidence_level: string | null
          confidence_note: string | null
          created_at: string
          created_by: string | null
          data_completeness_pct: number | null
          description: string | null
          due_date: string | null
          expected_impact: Json | null
          id: string
          linked_categories: string[] | null
          linked_metrics: string[] | null
          metric_keys: string[] | null
          organization_id: string
          owner_user_id: string | null
          priority: string | null
          source_insight: string | null
          source_ref_id: string | null
          source_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          action_type?: string | null
          blockers?: string[] | null
          completed_at?: string | null
          confidence_level?: string | null
          confidence_note?: string | null
          created_at?: string
          created_by?: string | null
          data_completeness_pct?: number | null
          description?: string | null
          due_date?: string | null
          expected_impact?: Json | null
          id?: string
          linked_categories?: string[] | null
          linked_metrics?: string[] | null
          metric_keys?: string[] | null
          organization_id: string
          owner_user_id?: string | null
          priority?: string | null
          source_insight?: string | null
          source_ref_id?: string | null
          source_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_type?: string | null
          blockers?: string[] | null
          completed_at?: string | null
          confidence_level?: string | null
          confidence_note?: string | null
          created_at?: string
          created_by?: string | null
          data_completeness_pct?: number | null
          description?: string | null
          due_date?: string | null
          expected_impact?: Json | null
          id?: string
          linked_categories?: string[] | null
          linked_metrics?: string[] | null
          metric_keys?: string[] | null
          organization_id?: string
          owner_user_id?: string | null
          priority?: string | null
          source_insight?: string | null
          source_ref_id?: string | null
          source_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_permissions: {
        Row: {
          can_manage_integrations: boolean
          can_manage_policies: boolean
          can_process_claims: boolean
          can_view_exec_analytics: boolean
          created_at: string
          id: string
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          can_manage_integrations?: boolean
          can_manage_policies?: boolean
          can_process_claims?: boolean
          can_view_exec_analytics?: boolean
          created_at?: string
          id?: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          can_manage_integrations?: boolean
          can_manage_policies?: boolean
          can_process_claims?: boolean
          can_view_exec_analytics?: boolean
          created_at?: string
          id?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      integration_runs: {
        Row: {
          connector_type: string
          coverage_percent: number | null
          created_at: string
          error_summary: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          organization_id: string
          records_failed: number | null
          records_synced: number | null
          status: string
          updated_at: string
        }
        Insert: {
          connector_type: string
          coverage_percent?: number | null
          created_at?: string
          error_summary?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          organization_id: string
          records_failed?: number | null
          records_synced?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          connector_type?: string
          coverage_percent?: number | null
          created_at?: string
          error_summary?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          organization_id?: string
          records_failed?: number | null
          records_synced?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          created_at: string | null
          id: string
          leave_type: string
          organization_id: string | null
          total_days: number
          used_days: number | null
          user_id: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          leave_type: string
          organization_id?: string | null
          total_days: number
          used_days?: number | null
          user_id: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          leave_type?: string
          organization_id?: string | null
          total_days?: number
          used_days?: number | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_time: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempt_time?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempt_time?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
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
          is_public: boolean | null
          merchant: string
          rating: number | null
          sponsored: boolean | null
          status: string
          tags: string[] | null
          terms: string | null
          title: string
          valid_from: string | null
          valid_to: string | null
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
          is_public?: boolean | null
          merchant: string
          rating?: number | null
          sponsored?: boolean | null
          status?: string
          tags?: string[] | null
          terms?: string | null
          title: string
          valid_from?: string | null
          valid_to?: string | null
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
          is_public?: boolean | null
          merchant?: string
          rating?: number | null
          sponsored?: boolean | null
          status?: string
          tags?: string[] | null
          terms?: string | null
          title?: string
          valid_from?: string | null
          valid_to?: string | null
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
      metric_definitions: {
        Row: {
          confidence_rules: Json | null
          created_at: string
          definition_ar: string | null
          definition_en: string
          formula_ar: string | null
          formula_en: string
          key: string
          min_sample_size: number
          name_ar: string | null
          name_en: string
          owner_role: string
          source: string
          updated_at: string
        }
        Insert: {
          confidence_rules?: Json | null
          created_at?: string
          definition_ar?: string | null
          definition_en: string
          formula_ar?: string | null
          formula_en: string
          key: string
          min_sample_size?: number
          name_ar?: string | null
          name_en: string
          owner_role?: string
          source: string
          updated_at?: string
        }
        Update: {
          confidence_rules?: Json | null
          created_at?: string
          definition_ar?: string | null
          definition_en?: string
          formula_ar?: string | null
          formula_en?: string
          key?: string
          min_sample_size?: number
          name_ar?: string | null
          name_en?: string
          owner_role?: string
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          enrolled_at: string | null
          id: string
          mfa_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          enrolled_at?: string | null
          id?: string
          mfa_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          enrolled_at?: string | null
          id?: string
          mfa_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      org_budgets: {
        Row: {
          annual_budget: number
          budget_allocated: Json | null
          created_at: string
          fiscal_year: number
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          annual_budget?: number
          budget_allocated?: Json | null
          created_at?: string
          fiscal_year: number
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          annual_budget?: number
          budget_allocated?: Json | null
          created_at?: string
          fiscal_year?: number
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_policy_governance_settings: {
        Row: {
          approval_sla_days: number | null
          approver_role: string
          created_at: string
          id: string
          organization_id: string
          policy_enforcement_mode:
            | Database["public"]["Enums"]["policy_enforcement_mode"]
            | null
          require_policy_approval: boolean
          updated_at: string
        }
        Insert: {
          approval_sla_days?: number | null
          approver_role?: string
          created_at?: string
          id?: string
          organization_id: string
          policy_enforcement_mode?:
            | Database["public"]["Enums"]["policy_enforcement_mode"]
            | null
          require_policy_approval?: boolean
          updated_at?: string
        }
        Update: {
          approval_sla_days?: number | null
          approver_role?: string
          created_at?: string
          id?: string
          organization_id?: string
          policy_enforcement_mode?:
            | Database["public"]["Enums"]["policy_enforcement_mode"]
            | null
          require_policy_approval?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      org_policy_settings: {
        Row: {
          created_at: string
          currency: string | null
          fiscal_year_start_month: number | null
          gratuity_calculation_rules: Json | null
          id: string
          leave_accrual_rules: Json | null
          organization_id: string
          payroll_cycle: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          fiscal_year_start_month?: number | null
          gratuity_calculation_rules?: Json | null
          id?: string
          leave_accrual_rules?: Json | null
          organization_id: string
          payroll_cycle?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          fiscal_year_start_month?: number | null
          gratuity_calculation_rules?: Json | null
          id?: string
          leave_accrual_rules?: Json | null
          organization_id?: string
          payroll_cycle?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_policy_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          accent_color: string | null
          created_at: string | null
          domain: string | null
          footer_text: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          status: string
          survey_end_month: number | null
          survey_start_month: number | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string | null
          domain?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          status?: string
          survey_end_month?: number | null
          survey_start_month?: number | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string | null
          domain?: string | null
          footer_text?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          status?: string
          survey_end_month?: number | null
          survey_start_month?: number | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      per_diem_claims: {
        Row: {
          accommodation_amount: number
          created_at: string | null
          currency: string
          departure_date: string
          destination_city: string | null
          destination_country: string
          destination_type: string
          id: string
          incidentals_amount: number
          meals_amount: number
          number_of_days: number | null
          organization_id: string | null
          paid_at: string | null
          rate_id: string | null
          receipts_attached: boolean | null
          return_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          submitted_at: string | null
          total_amount: number | null
          transport_amount: number
          trip_purpose: string
          trip_reference: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accommodation_amount?: number
          created_at?: string | null
          currency?: string
          departure_date: string
          destination_city?: string | null
          destination_country: string
          destination_type: string
          id?: string
          incidentals_amount?: number
          meals_amount?: number
          number_of_days?: number | null
          organization_id?: string | null
          paid_at?: string | null
          rate_id?: string | null
          receipts_attached?: boolean | null
          return_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string | null
          total_amount?: number | null
          transport_amount?: number
          trip_purpose: string
          trip_reference?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accommodation_amount?: number
          created_at?: string | null
          currency?: string
          departure_date?: string
          destination_city?: string | null
          destination_country?: string
          destination_type?: string
          id?: string
          incidentals_amount?: number
          meals_amount?: number
          number_of_days?: number | null
          organization_id?: string | null
          paid_at?: string | null
          rate_id?: string | null
          receipts_attached?: boolean | null
          return_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          submitted_at?: string | null
          total_amount?: number | null
          transport_amount?: number
          trip_purpose?: string
          trip_reference?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "per_diem_claims_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "per_diem_claims_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "per_diem_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      per_diem_rates: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          currency: string
          daily_accommodation: number
          daily_incidentals: number
          daily_meals: number
          daily_total: number | null
          daily_transport: number
          destination_type: string
          effective_from: string
          effective_until: string | null
          grade: string
          id: string
          is_active: boolean
          notes: string | null
          region: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          daily_accommodation?: number
          daily_incidentals?: number
          daily_meals?: number
          daily_total?: number | null
          daily_transport?: number
          destination_type: string
          effective_from?: string
          effective_until?: string | null
          grade: string
          id?: string
          is_active?: boolean
          notes?: string | null
          region: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          currency?: string
          daily_accommodation?: number
          daily_incidentals?: number
          daily_meals?: number
          daily_total?: number | null
          daily_transport?: number
          destination_type?: string
          effective_from?: string
          effective_until?: string | null
          grade?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          region?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      perk_activations: {
        Row: {
          activated_at: string | null
          id: string
          offer_id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          id?: string
          offer_id: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          id?: string
          offer_id?: string
          organization_id?: string | null
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
          {
            foreignKeyName: "perk_activations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      policies: {
        Row: {
          auto_close_on_approval: boolean | null
          benefit_key: string | null
          benefit_type: string | null
          category: string
          coverage_rules: Json | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          effective_from: string
          effective_to: string | null
          eligibility_rules: Json | null
          id: string
          is_active: boolean | null
          is_archived: boolean | null
          is_deleted: boolean | null
          organization_id: string | null
          owner_user_id: string | null
          policy_ref: string
          required_docs: Json | null
          settlement_required: boolean | null
          sla_rules: Json | null
          status: string
          summary: string | null
          title: string
          transaction_model: string | null
          updated_at: string
          version: string
        }
        Insert: {
          auto_close_on_approval?: boolean | null
          benefit_key?: string | null
          benefit_type?: string | null
          category: string
          coverage_rules?: Json | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          effective_from?: string
          effective_to?: string | null
          eligibility_rules?: Json | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          organization_id?: string | null
          owner_user_id?: string | null
          policy_ref: string
          required_docs?: Json | null
          settlement_required?: boolean | null
          sla_rules?: Json | null
          status?: string
          summary?: string | null
          title: string
          transaction_model?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          auto_close_on_approval?: boolean | null
          benefit_key?: string | null
          benefit_type?: string | null
          category?: string
          coverage_rules?: Json | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          effective_from?: string
          effective_to?: string | null
          eligibility_rules?: Json | null
          id?: string
          is_active?: boolean | null
          is_archived?: boolean | null
          is_deleted?: boolean | null
          organization_id?: string | null
          owner_user_id?: string | null
          policy_ref?: string
          required_docs?: Json | null
          settlement_required?: boolean | null
          sla_rules?: Json | null
          status?: string
          summary?: string | null
          title?: string
          transaction_model?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_approvals: {
        Row: {
          approver_role: string | null
          approver_user_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          note: string | null
          organization_id: string
          policy_id: string
          policy_version_id: string
          requested_by: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approver_role?: string | null
          approver_user_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          organization_id: string
          policy_id: string
          policy_version_id: string
          requested_by: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approver_role?: string | null
          approver_user_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          organization_id?: string
          policy_id?: string
          policy_version_id?: string
          requested_by?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_approvals_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_articles: {
        Row: {
          content: string
          created_at: string
          id: string
          is_faq: boolean | null
          organization_id: string | null
          policy_id: string | null
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_faq?: boolean | null
          organization_id?: string | null
          policy_id?: string | null
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_faq?: boolean | null
          organization_id?: string | null
          policy_id?: string | null
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_articles_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_create_requests: {
        Row: {
          client_request_id: string
          created_at: string | null
          created_by: string
          id: string
          organization_id: string
          policy_id: string | null
          policy_version_id: string | null
        }
        Insert: {
          client_request_id: string
          created_at?: string | null
          created_by: string
          id?: string
          organization_id: string
          policy_id?: string | null
          policy_version_id?: string | null
        }
        Update: {
          client_request_id?: string
          created_at?: string | null
          created_by?: string
          id?: string
          organization_id?: string
          policy_id?: string | null
          policy_version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_create_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_create_requests_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_required_docs: {
        Row: {
          conditions_json: Json | null
          created_at: string | null
          description: string | null
          doc_name: string
          doc_type: string
          id: string
          is_required: boolean | null
          policy_version_id: string
          transaction_type: string
        }
        Insert: {
          conditions_json?: Json | null
          created_at?: string | null
          description?: string | null
          doc_name: string
          doc_type: string
          id?: string
          is_required?: boolean | null
          policy_version_id: string
          transaction_type?: string
        }
        Update: {
          conditions_json?: Json | null
          created_at?: string | null
          description?: string | null
          doc_name?: string
          doc_type?: string
          id?: string
          is_required?: boolean | null
          policy_version_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_required_docs_policy_version_id_fkey"
            columns: ["policy_version_id"]
            isOneToOne: false
            referencedRelation: "policy_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          benefit_type: string | null
          category: string
          created_at: string
          created_by: string | null
          default_content: Json | null
          default_eligibility_rules: Json | null
          default_limits: Json | null
          default_required_docs: Json | null
          default_sla_days: number | null
          default_workflow: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          transaction_model: string | null
          updated_at: string
        }
        Insert: {
          benefit_type?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          default_content?: Json | null
          default_eligibility_rules?: Json | null
          default_limits?: Json | null
          default_required_docs?: Json | null
          default_sla_days?: number | null
          default_workflow?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          transaction_model?: string | null
          updated_at?: string
        }
        Update: {
          benefit_type?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          default_content?: Json | null
          default_eligibility_rules?: Json | null
          default_limits?: Json | null
          default_required_docs?: Json | null
          default_sla_days?: number | null
          default_workflow?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          transaction_model?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      policy_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_url: string | null
          content_json: Json | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          last_updated_at: string | null
          logic_json: Json | null
          policy_id: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          version_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          last_updated_at?: string | null
          logic_json?: Json | null
          policy_id: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          version_number?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_url?: string | null
          content_json?: Json | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          last_updated_at?: string | null
          logic_json?: Json | null
          policy_id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
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
          employer_view_mode: string | null
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
          employer_view_mode?: string | null
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
          employer_view_mode?: string | null
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
      recovery_playbook_runs: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          due_date: string
          expected_impact_aed: number | null
          id: string
          notes: string | null
          organization_id: string
          owner: string
          playbook_type: string
          segment: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          due_date: string
          expected_impact_aed?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          owner: string
          playbook_type: string
          segment?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          expected_impact_aed?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          owner?: string
          playbook_type?: string
          segment?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_playbook_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_run_outputs: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          link_or_text: string | null
          output_type: string
          run_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          link_or_text?: string | null
          output_type: string
          run_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          link_or_text?: string | null
          output_type?: string
          run_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_run_outputs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "recovery_playbook_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_run_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          run_id: string
          status: string
          task_name: string
          task_order: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          run_id: string
          status?: string
          task_name: string
          task_order?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          run_id?: string
          status?: string
          task_name?: string
          task_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "recovery_run_tasks_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "recovery_playbook_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      request_attachments: {
        Row: {
          document_type: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_required: boolean | null
          request_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_required?: boolean | null
          request_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_required?: boolean | null
          request_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_documents: {
        Row: {
          created_at: string
          derivation_reason: string | null
          doc_name: string
          doc_type: string
          file_url: string | null
          id: string
          is_required: boolean
          policy_version_id: string | null
          rejection_reason: string | null
          request_id: string
          required_for: string | null
          reviewer_notes: string | null
          source_doc_id: string | null
          status: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          derivation_reason?: string | null
          doc_name: string
          doc_type: string
          file_url?: string | null
          id?: string
          is_required?: boolean
          policy_version_id?: string | null
          rejection_reason?: string | null
          request_id: string
          required_for?: string | null
          reviewer_notes?: string | null
          source_doc_id?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          derivation_reason?: string | null
          doc_name?: string
          doc_type?: string
          file_url?: string | null
          id?: string
          is_required?: boolean
          policy_version_id?: string | null
          rejection_reason?: string | null
          request_id?: string
          required_for?: string | null
          reviewer_notes?: string | null
          source_doc_id?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_documents_policy_version_id_fkey"
            columns: ["policy_version_id"]
            isOneToOne: false
            referencedRelation: "policy_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_events: {
        Row: {
          action: string | null
          actor_name: string | null
          actor_role: string | null
          actor_user_id: string
          bulk_action_id: string | null
          created_at: string
          from_status: string | null
          id: string
          meta: Json | null
          notes_employee_visible: string | null
          notes_internal: string | null
          request_id: string
          to_status: string
          visibility: string | null
        }
        Insert: {
          action?: string | null
          actor_name?: string | null
          actor_role?: string | null
          actor_user_id: string
          bulk_action_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          meta?: Json | null
          notes_employee_visible?: string | null
          notes_internal?: string | null
          request_id: string
          to_status: string
          visibility?: string | null
        }
        Update: {
          action?: string | null
          actor_name?: string | null
          actor_role?: string | null
          actor_user_id?: string
          bulk_action_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          meta?: Json | null
          notes_employee_visible?: string | null
          notes_internal?: string | null
          request_id?: string
          to_status?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          amount: number | null
          approved_amount: number | null
          assigned_owner_name: string | null
          assigned_to: string | null
          assigned_to_user_id: string | null
          category: string
          checklist_snapshot_json: Json | null
          compliance_reasons_json: Json | null
          compliance_status: string | null
          created_at: string | null
          currency: string | null
          decision_at: string | null
          department: string | null
          description: string | null
          employee_code: string | null
          employee_context_json: Json | null
          escalated_at: string | null
          escalation_reason: string | null
          grade: string | null
          id: string
          last_status_change_at: string | null
          location: string | null
          missing_docs: Json | null
          organization_id: string | null
          paid_amount: number | null
          paid_at: string | null
          parent_request_id: string | null
          policy_id: string | null
          policy_ref: string | null
          policy_version_id: string | null
          priority: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          required_docs: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          sla_due_at: string | null
          sla_hours: number | null
          source_system: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          subject: string
          submitted_at: string | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          user_id: string
          value_band: string | null
        }
        Insert: {
          amount?: number | null
          approved_amount?: number | null
          assigned_owner_name?: string | null
          assigned_to?: string | null
          assigned_to_user_id?: string | null
          category: string
          checklist_snapshot_json?: Json | null
          compliance_reasons_json?: Json | null
          compliance_status?: string | null
          created_at?: string | null
          currency?: string | null
          decision_at?: string | null
          department?: string | null
          description?: string | null
          employee_code?: string | null
          employee_context_json?: Json | null
          escalated_at?: string | null
          escalation_reason?: string | null
          grade?: string | null
          id?: string
          last_status_change_at?: string | null
          location?: string | null
          missing_docs?: Json | null
          organization_id?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          parent_request_id?: string | null
          policy_id?: string | null
          policy_ref?: string | null
          policy_version_id?: string | null
          priority?: string | null
          request_type: Database["public"]["Enums"]["request_type"]
          required_docs?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          sla_due_at?: string | null
          sla_hours?: number | null
          source_system?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject: string
          submitted_at?: string | null
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          user_id: string
          value_band?: string | null
        }
        Update: {
          amount?: number | null
          approved_amount?: number | null
          assigned_owner_name?: string | null
          assigned_to?: string | null
          assigned_to_user_id?: string | null
          category?: string
          checklist_snapshot_json?: Json | null
          compliance_reasons_json?: Json | null
          compliance_status?: string | null
          created_at?: string | null
          currency?: string | null
          decision_at?: string | null
          department?: string | null
          description?: string | null
          employee_code?: string | null
          employee_context_json?: Json | null
          escalated_at?: string | null
          escalation_reason?: string | null
          grade?: string | null
          id?: string
          last_status_change_at?: string | null
          location?: string | null
          missing_docs?: Json | null
          organization_id?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          parent_request_id?: string | null
          policy_id?: string | null
          policy_ref?: string | null
          policy_version_id?: string | null
          priority?: string | null
          request_type?: Database["public"]["Enums"]["request_type"]
          required_docs?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          sla_due_at?: string | null
          sla_hours?: number | null
          source_system?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          subject?: string
          submitted_at?: string | null
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type"]
            | null
          user_id?: string
          value_band?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_parent_request_id_fkey"
            columns: ["parent_request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
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
      sensitive_employee_data: {
        Row: {
          blood_type: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emirates_id_encrypted: string | null
          id: string
          monthly_salary_encrypted: string | null
          passport_number_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blood_type?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emirates_id_encrypted?: string | null
          id?: string
          monthly_salary_encrypted?: string | null
          passport_number_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blood_type?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emirates_id_encrypted?: string | null
          id?: string
          monthly_salary_encrypted?: string | null
          passport_number_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sla_rules: {
        Row: {
          category: string
          created_at: string
          escalation_hours: number | null
          id: string
          organization_id: string | null
          reminder_hours: number[] | null
          sla_hours: number
          updated_at: string
          value_band: string
          working_hours_only: boolean | null
        }
        Insert: {
          category: string
          created_at?: string
          escalation_hours?: number | null
          id?: string
          organization_id?: string | null
          reminder_hours?: number[] | null
          sla_hours?: number
          updated_at?: string
          value_band: string
          working_hours_only?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string
          escalation_hours?: number | null
          id?: string
          organization_id?: string | null
          reminder_hours?: number[] | null
          sla_hours?: number
          updated_at?: string
          value_band?: string
          working_hours_only?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_visibility_settings: {
        Row: {
          element_key: string
          id: string
          is_visible: boolean
          organization_id: string | null
          page_key: string
          role: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          element_key: string
          id?: string
          is_visible?: boolean
          organization_id?: string | null
          page_key: string
          role: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          element_key?: string
          id?: string
          is_visible?: boolean
          organization_id?: string | null
          page_key?: string
          role?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_visibility_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity: string
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity?: string
          session_token_hash?: string
          user_agent?: string | null
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
          organization_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          benefit_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          benefit_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          organization_id?: string | null
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
          {
            foreignKeyName: "utilization_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
            foreignKeyName: "vendor_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          status: string
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
          status?: string
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
          status?: string
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
      approve_policy_version: {
        Args: { p_approval_id: string; p_comment?: string }
        Returns: Json
      }
      archive_or_delete_policy: {
        Args: { p_action: string; p_policy_id: string; p_reason?: string }
        Returns: Json
      }
      create_policy_with_draft_version: {
        Args: {
          p_benefit_type?: string
          p_client_request_id?: string
          p_content_json?: Json
          p_created_by: string
          p_effective_from?: string
          p_effective_to?: string
          p_life_area: string
          p_logic_json?: Json
          p_org_id: string
          p_policy_name: string
          p_template_id?: string
          p_transaction_model?: string
        }
        Returns: Json
      }
      create_policy_with_version: {
        Args: {
          p_benefit_type?: string
          p_client_request_id?: string
          p_content_json?: Json
          p_created_by: string
          p_effective_from?: string
          p_effective_to?: string
          p_life_area: string
          p_logic_json?: Json
          p_org_id: string
          p_policy_name: string
          p_template_id?: string
          p_transaction_model?: string
        }
        Returns: Json
      }
      duplicate_policy_version: {
        Args: {
          p_client_request_id?: string
          p_new_title?: string
          p_source_policy_id: string
          p_source_version_id?: string
        }
        Returns: Json
      }
      ensure_demo_user_role: {
        Args: {
          p_email: string
          p_org_id?: string
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      get_benefit_utilization_stats: {
        Args: {
          p_org_id: string
          p_period_end?: string
          p_period_start?: string
        }
        Returns: Json
      }
      get_employer_dashboard_metrics: {
        Args: {
          p_org_id: string
          p_period_end?: string
          p_period_start?: string
        }
        Returns: Json
      }
      get_org_benefit_stats: {
        Args: { org_id: string }
        Returns: {
          avg_utilization_percent: number
          benefit_name: string
          total_entitlements: number
          total_utilized: number
        }[]
      }
      get_org_employee_directory: {
        Args: { org_id: string }
        Returns: {
          emp_department: string
          emp_email: string
          emp_first_name: string
          emp_last_name: string
          emp_position: string
          emp_user_id: string
          emp_work_location: string
        }[]
      }
      get_org_leave_stats: {
        Args: { org_id: string }
        Returns: {
          avg_remaining_days: number
          avg_used_days: number
          leave_type: string
          total_employees: number
        }[]
      }
      get_org_satisfaction_stats: {
        Args: { org_id: string }
        Returns: {
          avg_rating: number
          category: string
          period_month: number
          period_year: number
          total_responses: number
        }[]
      }
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_employer_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
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
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_ip_address?: string
          p_resource_id?: string
          p_resource_type: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      publish_policy_version:
        | {
            Args: {
              p_effective_from?: string
              p_policy_id: string
              p_version_id: string
            }
            Returns: Json
          }
        | {
            Args: { p_effective_from?: string; p_policy_version_id: string }
            Returns: Json
          }
      reject_policy_version: {
        Args: { p_approval_id: string; p_reason: string }
        Returns: Json
      }
      revert_policy_to_draft: {
        Args: { p_policy_version_id: string }
        Returns: Json
      }
      submit_policy_for_approval: {
        Args: { p_note?: string; p_policy_version_id: string }
        Returns: Json
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
      policy_enforcement_mode: "soft" | "strict"
      request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "draft"
        | "submitted"
        | "in_review"
        | "info_requested"
        | "paid"
        | "closed"
        | "cancelled"
        | "pending_employee"
        | "escalated"
      request_type: "claim" | "request" | "question"
      transaction_type: "request" | "claim" | "settlement"
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
      policy_enforcement_mode: ["soft", "strict"],
      request_status: [
        "pending",
        "approved",
        "rejected",
        "draft",
        "submitted",
        "in_review",
        "info_requested",
        "paid",
        "closed",
        "cancelled",
        "pending_employee",
        "escalated",
      ],
      request_type: ["claim", "request", "question"],
      transaction_type: ["request", "claim", "settlement"],
      user_role: ["employee", "employer", "admin", "vendor"],
    },
  },
} as const
