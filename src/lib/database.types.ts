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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      closet_members: {
        Row: {
          closet_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          closet_id: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          closet_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "closet_members_closet_id_fkey"
            columns: ["closet_id"]
            isOneToOne: false
            referencedRelation: "closets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closet_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      closets: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "closets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          context: Json
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      item_materials: {
        Row: {
          fiber: string
          item_id: string
          percentage: number | null
        }
        Insert: {
          fiber: string
          item_id: string
          percentage?: number | null
        }
        Update: {
          fiber?: string
          item_id?: string
          percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_materials_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_photos: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          item_id: string
          kind: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          item_id: string
          kind?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          item_id?: string
          kind?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_photos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_tags: {
        Row: {
          item_id: string
          tag_id: string
        }
        Insert: {
          item_id: string
          tag_id: string
        }
        Update: {
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag_vocab"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          acquisition_type: string | null
          brand: string | null
          care: string[]
          category: string
          closet_id: string
          color: string | null
          condition: string | null
          country_of_origin: string | null
          created_at: string
          enrichment: Json | null
          id: string
          is_high_value: boolean
          is_lendable: boolean
          is_private: boolean
          is_sentimental: boolean
          item_fit: string | null
          last_worn_at: string | null
          loan: Json | null
          location_id: string | null
          measurements: Json | null
          name: string
          notes: string[]
          occasion: string | null
          on_sale: boolean
          original_price: number | null
          primary_photo_url: string | null
          purchase_date: string | null
          purchase_price: number | null
          qty: number | null
          retailer: string | null
          size: string | null
          source: string | null
          status: string | null
          style: Json | null
          updated_at: string
          worn_count: number
        }
        Insert: {
          acquisition_type?: string | null
          brand?: string | null
          care?: string[]
          category: string
          closet_id: string
          color?: string | null
          condition?: string | null
          country_of_origin?: string | null
          created_at?: string
          enrichment?: Json | null
          id?: string
          is_high_value?: boolean
          is_lendable?: boolean
          is_private?: boolean
          is_sentimental?: boolean
          item_fit?: string | null
          last_worn_at?: string | null
          loan?: Json | null
          location_id?: string | null
          measurements?: Json | null
          name: string
          notes?: string[]
          occasion?: string | null
          on_sale?: boolean
          original_price?: number | null
          primary_photo_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qty?: number | null
          retailer?: string | null
          size?: string | null
          source?: string | null
          status?: string | null
          style?: Json | null
          updated_at?: string
          worn_count?: number
        }
        Update: {
          acquisition_type?: string | null
          brand?: string | null
          care?: string[]
          category?: string
          closet_id?: string
          color?: string | null
          condition?: string | null
          country_of_origin?: string | null
          created_at?: string
          enrichment?: Json | null
          id?: string
          is_high_value?: boolean
          is_lendable?: boolean
          is_private?: boolean
          is_sentimental?: boolean
          item_fit?: string | null
          last_worn_at?: string | null
          loan?: Json | null
          location_id?: string | null
          measurements?: Json | null
          name?: string
          notes?: string[]
          occasion?: string | null
          on_sale?: boolean
          original_price?: number | null
          primary_photo_url?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          qty?: number | null
          retailer?: string | null
          size?: string | null
          source?: string | null
          status?: string | null
          style?: Json | null
          updated_at?: string
          worn_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_closet_id_fkey"
            columns: ["closet_id"]
            isOneToOne: false
            referencedRelation: "closets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          kind: string | null
          label: string
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          kind?: string | null
          label: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          kind?: string | null
          label?: string
          owner_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_enrichment_cache: {
        Row: {
          care_raw: string | null
          description: string | null
          features: string[]
          fetched_at: string
          fit_info: string | null
          id: string
          item_key: string
          json_ld: Json | null
          materials_raw: string | null
          pdp_url: string | null
          retailer: string
          size_equiv: string | null
        }
        Insert: {
          care_raw?: string | null
          description?: string | null
          features?: string[]
          fetched_at?: string
          fit_info?: string | null
          id?: string
          item_key: string
          json_ld?: Json | null
          materials_raw?: string | null
          pdp_url?: string | null
          retailer: string
          size_equiv?: string | null
        }
        Update: {
          care_raw?: string | null
          description?: string | null
          features?: string[]
          fetched_at?: string
          fit_info?: string | null
          id?: string
          item_key?: string
          json_ld?: Json | null
          materials_raw?: string | null
          pdp_url?: string | null
          retailer?: string
          size_equiv?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          photo_url: string | null
          settings: Json
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          photo_url?: string | null
          settings?: Json
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          photo_url?: string | null
          settings?: Json
        }
        Relationships: []
      }
      tag_vocab: {
        Row: {
          id: string
          kind: string
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          kind: string
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          kind?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      wear_events: {
        Row: {
          created_at: string
          id: string
          item_id: string
          note: string | null
          occasion_tag_id: string | null
          photo_id: string | null
          worn_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          note?: string | null
          occasion_tag_id?: string | null
          photo_id?: string | null
          worn_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          note?: string | null
          occasion_tag_id?: string | null
          photo_id?: string | null
          worn_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wear_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wear_events_occasion_tag_id_fkey"
            columns: ["occasion_tag_id"]
            isOneToOne: false
            referencedRelation: "tag_vocab"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wear_events_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "item_photos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_closet_member: { Args: { _closet_id: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
