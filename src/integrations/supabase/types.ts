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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cart_item_notes: {
        Row: {
          cart_id: string
          created_at: string | null
          id: number
          menu_item_id: string
          notes: string
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: never
          menu_item_id: string
          notes: string
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: never
          menu_item_id?: string
          notes?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: number
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: never
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: never
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: number
          rating: number
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: never
          rating: number
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: never
          rating?: number
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_views: {
        Row: {
          id: number
          ip_address: unknown | null
          tenant_id: string | null
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: never
          ip_address?: unknown | null
          tenant_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: never
          ip_address?: unknown | null
          tenant_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_views_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          browser_notifications: boolean | null
          created_at: string
          email_notifications: boolean | null
          id: string
          new_order_sound: boolean | null
          sms_notifications: boolean | null
          tenant_id: string
          updated_at: string
          urgent_order_alert: boolean | null
          user_id: string
        }
        Insert: {
          browser_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          new_order_sound?: boolean | null
          sms_notifications?: boolean | null
          tenant_id: string
          updated_at?: string
          urgent_order_alert?: boolean | null
          user_id: string
        }
        Update: {
          browser_notifications?: boolean | null
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          new_order_sound?: boolean | null
          sms_notifications?: boolean | null
          tenant_id?: string
          updated_at?: string
          urgent_order_alert?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      order_history: {
        Row: {
          cart_hash: string
          cart_id: string
          created_at: string
          customer_name: string | null
          customer_notes: string | null
          customer_phone: string | null
          delivery_fee: number
          discount: number
          id: string
          items_count: number
          order_data: Json | null
          order_mode: string
          order_type: string
          subtotal: number
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          cart_hash: string
          cart_id: string
          created_at?: string
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          delivery_fee?: number
          discount?: number
          id?: string
          items_count?: number
          order_data?: Json | null
          order_mode?: string
          order_type?: string
          subtotal?: number
          tenant_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          cart_hash?: string
          cart_id?: string
          created_at?: string
          customer_name?: string | null
          customer_notes?: string | null
          customer_phone?: string | null
          delivery_fee?: number
          discount?: number
          id?: string
          items_count?: number
          order_data?: Json | null
          order_mode?: string
          order_type?: string
          subtotal?: number
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: number
          menu_item_id: string | null
          quantity: number
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          menu_item_id?: string | null
          quantity: number
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          menu_item_id?: string | null
          quantity?: number
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          id: number
          order_type: string | null
          tenant_id: string | null
          total_price: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          order_type?: string | null
          tenant_id?: string | null
          total_price: number
        }
        Update: {
          created_at?: string | null
          id?: never
          order_type?: string | null
          tenant_id?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          change_amount: number | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_method: string
          payment_status: string
          processed_by: string | null
          received_amount: number | null
          tenant_id: string
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          change_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_method: string
          payment_status?: string
          processed_by?: string | null
          received_amount?: number | null
          tenant_id: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          change_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: string
          payment_status?: string
          processed_by?: string | null
          received_amount?: number | null
          tenant_id?: string
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_analytics: {
        Row: {
          avg_preparation_time: unknown | null
          created_at: string
          date: string
          id: string
          peak_hours: Json | null
          staff_performance: Json | null
          tenant_id: string
          total_orders: number | null
          total_revenue: number | null
          updated_at: string
        }
        Insert: {
          avg_preparation_time?: unknown | null
          created_at?: string
          date: string
          id?: string
          peak_hours?: Json | null
          staff_performance?: Json | null
          tenant_id: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Update: {
          avg_preparation_time?: unknown | null
          created_at?: string
          date?: string
          id?: string
          peak_hours?: Json | null
          staff_performance?: Json | null
          tenant_id?: string
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_devices: {
        Row: {
          created_at: string
          device_name: string
          device_type: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_heartbeat: string | null
          mac_address: string | null
          printer_config: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_name: string
          device_type: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_heartbeat?: string | null
          mac_address?: string | null
          printer_config?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_heartbeat?: string | null
          mac_address?: string | null
          printer_config?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_staff_id: string | null
          channel: string | null
          completion_time: string | null
          created_at: string
          customer_info: Json | null
          discount_amount: number | null
          estimated_completion_time: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          order_type: string
          payment_method: string | null
          payment_status: string | null
          preparation_start_time: string | null
          priority: string | null
          ready_time: string | null
          service_charge: number | null
          shift_id: string | null
          source_device_id: string | null
          staff_user_id: string | null
          status: string
          table_id: string | null
          tax_amount: number | null
          tenant_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_staff_id?: string | null
          channel?: string | null
          completion_time?: string | null
          created_at?: string
          customer_info?: Json | null
          discount_amount?: number | null
          estimated_completion_time?: string | null
          id?: string
          items: Json
          notes?: string | null
          order_number: string
          order_type?: string
          payment_method?: string | null
          payment_status?: string | null
          preparation_start_time?: string | null
          priority?: string | null
          ready_time?: string | null
          service_charge?: number | null
          shift_id?: string | null
          source_device_id?: string | null
          staff_user_id?: string | null
          status?: string
          table_id?: string | null
          tax_amount?: number | null
          tenant_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_staff_id?: string | null
          channel?: string | null
          completion_time?: string | null
          created_at?: string
          customer_info?: Json | null
          discount_amount?: number | null
          estimated_completion_time?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string | null
          payment_status?: string | null
          preparation_start_time?: string | null
          priority?: string | null
          ready_time?: string | null
          service_charge?: number | null
          shift_id?: string | null
          source_device_id?: string | null
          staff_user_id?: string | null
          status?: string
          table_id?: string | null
          tax_amount?: number | null
          tenant_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_stations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_heartbeat: string
          station_name: string
          station_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_heartbeat?: string
          station_name: string
          station_type?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_heartbeat?: string
          station_name?: string
          station_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_stations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurant_tables: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          is_active: boolean | null
          location_area: string | null
          qr_code_url: string | null
          table_number: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_area?: string | null
          qr_code_url?: string | null
          table_number: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          location_area?: string | null
          qr_code_url?: string | null
          table_number?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          card_payments: number | null
          cash_payments: number | null
          closing_cash: number | null
          created_at: string
          discounts_given: number | null
          id: string
          notes: string | null
          opening_cash: number | null
          shift_end: string | null
          shift_start: string
          staff_user_id: string
          status: string
          tenant_id: string
          total_orders: number | null
          total_sales: number | null
          updated_at: string
        }
        Insert: {
          card_payments?: number | null
          cash_payments?: number | null
          closing_cash?: number | null
          created_at?: string
          discounts_given?: number | null
          id?: string
          notes?: string | null
          opening_cash?: number | null
          shift_end?: string | null
          shift_start?: string
          staff_user_id: string
          status?: string
          tenant_id: string
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Update: {
          card_payments?: number | null
          cash_payments?: number | null
          closing_cash?: number | null
          created_at?: string
          discounts_given?: number | null
          id?: string
          notes?: string | null
          opening_cash?: number | null
          shift_end?: string | null
          shift_start?: string
          staff_user_id?: string
          status?: string
          tenant_id?: string
          total_orders?: number | null
          total_sales?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      staff_performance: {
        Row: {
          avg_completion_time: unknown | null
          created_at: string
          id: string
          orders_completed: number | null
          performance_score: number | null
          shift_date: string
          staff_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avg_completion_time?: unknown | null
          created_at?: string
          id?: string
          orders_completed?: number | null
          performance_score?: number | null
          shift_date: string
          staff_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avg_completion_time?: unknown | null
          created_at?: string
          id?: string
          orders_completed?: number | null
          performance_score?: number | null
          shift_date?: string
          staff_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          permissions: Json | null
          pin_code: string | null
          role: string
          staff_name: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          pin_code?: string | null
          role?: string
          staff_name: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json | null
          pin_code?: string | null
          role?: string
          staff_name?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      table_sessions: {
        Row: {
          created_at: string | null
          id: string
          orders_count: number | null
          session_end: string | null
          session_start: string | null
          table_id: string
          tenant_id: string
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          orders_count?: number | null
          session_end?: string | null
          session_start?: string | null
          table_id: string
          tenant_id: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          orders_count?: number | null
          session_end?: string | null
          session_start?: string | null
          table_id?: string
          tenant_id?: string
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_sessions_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "restaurant_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "table_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          address: string | null
          branch_name: string | null
          created_at: string
          currency: string
          delivery_fee: number | null
          description: string | null
          id: string
          is_active: boolean
          logo_position: string | null
          logo_url: string | null
          name: string
          owner_id: string
          phone_number: string | null
          primary_color: string | null
          secondary_color: string | null
          slug: string
          social_media_links: Json | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          branch_name?: string | null
          created_at?: string
          currency?: string
          delivery_fee?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_position?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug: string
          social_media_links?: Json | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          branch_name?: string | null
          created_at?: string
          currency?: string
          delivery_fee?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          logo_position?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone_number?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          slug?: string
          social_media_links?: Json | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_clicks: {
        Row: {
          cart_id: string
          cart_total: number
          clicked_at: string | null
          customer_name: string | null
          customer_phone: string | null
          id: number
          items_count: number
          order_type: string
          tenant_id: string
        }
        Insert: {
          cart_id: string
          cart_total: number
          clicked_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: never
          items_count: number
          order_type: string
          tenant_id: string
        }
        Update: {
          cart_id?: string
          cart_total?: number
          clicked_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: never
          items_count?: number
          order_type?: string
          tenant_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
      }
      get_new_tenants_over_time: {
        Args: { time_period_param: string }
        Returns: {
          date_trunc: string
          new_tenants_count: number
        }[]
      }
      get_popular_menu_items: {
        Args: { limit_param: number; tenant_id_param: string }
        Returns: {
          menu_item_id: string
          name: string
          total_orders: number
        }[]
      }
      get_public_menu_data: {
        Args: { p_slug: string }
        Returns: Json
      }
      get_sales_data: {
        Args: { tenant_id_param: string; time_period_param: string }
        Returns: {
          date_trunc: string
          total_sales: number
        }[]
      }
      get_total_menu_views: {
        Args: { tenant_id_param: string }
        Returns: number
      }
      get_user_tenant: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_menu_view: {
        Args: { tenant_id_param: string }
        Returns: undefined
      }
      log_order: {
        Args: {
          order_type_param: string
          tenant_id_param: string
          total_price_param: number
        }
        Returns: undefined
      }
      log_order_items: {
        Args: { items: Json; tenant_id_param: string }
        Returns: undefined
      }
      log_whatsapp_click: {
        Args: {
          cart_id_param: string
          cart_total_param: number
          customer_name_param?: string
          customer_phone_param?: string
          items_count_param: number
          order_type_param: string
          tenant_id_param: string
        }
        Returns: undefined
      }
      submit_feedback: {
        Args: {
          comment_param: string
          rating_param: number
          tenant_id_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      subscription_plan: "basic" | "premium" | "enterprise"
      user_role: "super_admin" | "restaurant_owner"
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
      subscription_plan: ["basic", "premium", "enterprise"],
      user_role: ["super_admin", "restaurant_owner"],
    },
  },
} as const
