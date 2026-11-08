export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'trade' | 'admin';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type OrderChannel = 'public' | 'trade';
export type OrderStatus =
  | 'pending'
  | 'pending_payment'
  | 'paid'
  | 'packing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'failed'
  | 'refunded';
export type PromoAudience = 'public' | 'trade' | 'both';

export interface Address {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          status: AccountStatus;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string;
          business_type: string;
          trading_address: Json;
          delivery_address: Json | null;
          symbol_group: string | null;
          vat_number: string | null;
          company_number: string | null;
          notes: string | null;
          stripe_customer_id?: string | null;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          status?: AccountStatus;
          business_name: string;
          contact_name: string;
          email: string;
          phone: string;
          business_type: string;
          trading_address: Json;
          delivery_address?: Json | null;
          symbol_group?: string | null;
          vat_number?: string | null;
          company_number?: string | null;
          notes?: string | null;
          stripe_customer_id?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          status?: AccountStatus;
          business_name?: string;
          contact_name?: string;
          email?: string;
          phone?: string;
          business_type?: string;
          trading_address?: Json;
          delivery_address?: Json | null;
          symbol_group?: string | null;
          vat_number?: string | null;
          company_number?: string | null;
          notes?: string | null;
          stripe_customer_id?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          image_path: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          image_path: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          image_path?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          code: string;
          barcode: string | null;
          category_id: string;
          short_line: string;
          description: string;
          features: string[];
          retail_price_pence: number;
          visible_to_public: boolean;
          visible_to_trade: boolean;
          is_best_seller: boolean;
          is_new_arrival: boolean;
          is_special_offer: boolean;
          offer_price_pence: number | null;
          seo_title: string | null;
          seo_description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          code: string;
          barcode?: string | null;
          category_id: string;
          short_line: string;
          description: string;
          features?: string[];
          retail_price_pence: number;
          visible_to_public?: boolean;
          visible_to_trade?: boolean;
          is_best_seller?: boolean;
          is_new_arrival?: boolean;
          is_special_offer?: boolean;
          offer_price_pence?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          code?: string;
          barcode?: string | null;
          category_id?: string;
          short_line?: string;
          description?: string;
          features?: string[];
          retail_price_pence?: number;
          visible_to_public?: boolean;
          visible_to_trade?: boolean;
          is_best_seller?: boolean;
          is_new_arrival?: boolean;
          is_special_offer?: boolean;
          offer_price_pence?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      product_trade_prices: {
        Row: {
          product_id: string;
          wholesale_pack_price_pence: number;
          units_per_pack: number;
          min_packs: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          wholesale_pack_price_pence: number;
          units_per_pack?: number;
          min_packs?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          wholesale_pack_price_pence?: number;
          units_per_pack?: number;
          min_packs?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_trade_prices_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          path: string;
          alt: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          path: string;
          alt?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          path?: string;
          alt?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      product_videos: {
        Row: {
          id: string;
          product_id: string | null;
          url: string;
          title: string;
          sort_order: number;
          show_on_home: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          url: string;
          title: string;
          sort_order?: number;
          show_on_home?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          url?: string;
          title?: string;
          sort_order?: number;
          show_on_home?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'product_videos_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      stock: {
        Row: {
          product_id: string;
          packs_in_stock: number;
          low_stock_at: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          packs_in_stock?: number;
          low_stock_at?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          packs_in_stock?: number;
          low_stock_at?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stock_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      stands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_path: string;
          stand_unit_price_pence: number | null;
          fixed_price_pence: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          image_path: string;
          stand_unit_price_pence?: number | null;
          fixed_price_pence?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          image_path?: string;
          stand_unit_price_pence?: number | null;
          fixed_price_pence?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stand_items: {
        Row: {
          id: string;
          stand_id: string;
          product_id: string;
          packs: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stand_id: string;
          product_id: string;
          packs: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          stand_id?: string;
          product_id?: string;
          packs?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stand_items_stand_id_fkey';
            columns: ['stand_id'];
            referencedRelation: 'stands';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stand_items_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          description: string;
          audience: PromoAudience;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          product_id: string | null;
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          audience?: PromoAudience;
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
          product_id?: string | null;
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          audience?: PromoAudience;
          starts_at?: string;
          ends_at?: string;
          is_active?: boolean;
          product_id?: string | null;
          category_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'promotions_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promotions_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string | null;
          rating: number;
          body: string;
          author_name: string;
          town: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          rating: number;
          body: string;
          author_name: string;
          town: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          rating?: number;
          body?: string;
          author_name?: string;
          town?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          }
        ];
      };
      settings: {
        Row: {
          id: number;
          free_delivery_threshold_pence: number;
          trade_delivery_charge_pence: number;
          public_delivery_charge_pence: number;
          vat_rate_bp: number;
          contact_phone: string;
          contact_email: string;
          social_facebook: string | null;
          social_instagram: string | null;
          social_tiktok: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          free_delivery_threshold_pence?: number;
          trade_delivery_charge_pence?: number;
          public_delivery_charge_pence?: number;
          vat_rate_bp?: number;
          contact_phone?: string;
          contact_email?: string;
          social_facebook?: string | null;
          social_instagram?: string | null;
          social_tiktok?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          free_delivery_threshold_pence?: number;
          trade_delivery_charge_pence?: number;
          public_delivery_charge_pence?: number;
          vat_rate_bp?: number;
          contact_phone?: string;
          contact_email?: string;
          social_facebook?: string | null;
          social_instagram?: string | null;
          social_tiktok?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          channel: OrderChannel;
          user_id: string | null;
          email: string;
          contact_name: string;
          full_name?: string | null;
          phone: string;
          address?: string | null;
          city?: string | null;
          postcode?: string | null;
          billing_same?: boolean | null;
          delivery_address: Json;
          billing_address: Json;
          subtotal_pence: number;
          delivery_pence: number;
          vat_pence: number;
          total_pence: number;
          subtotal?: number | null;
          delivery_fee?: number | null;
          total?: number | null;
          currency?: string | null;
          order_type?: 'retail' | 'trade' | null;
          status: OrderStatus;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: number;
          channel?: OrderChannel;
          user_id?: string | null;
          email: string;
          contact_name?: string;
          full_name?: string | null;
          phone: string;
          address?: string | null;
          city?: string | null;
          postcode?: string | null;
          billing_same?: boolean | null;
          delivery_address?: Json;
          billing_address?: Json;
          subtotal_pence?: number;
          delivery_pence?: number;
          vat_pence?: number;
          total_pence?: number;
          subtotal?: number | null;
          delivery_fee?: number | null;
          total?: number | null;
          currency?: string | null;
          order_type?: 'retail' | 'trade' | null;
          status?: OrderStatus;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: number;
          channel?: OrderChannel;
          user_id?: string | null;
          email?: string;
          contact_name?: string;
          full_name?: string | null;
          phone?: string;
          address?: string | null;
          city?: string | null;
          postcode?: string | null;
          billing_same?: boolean | null;
          delivery_address?: Json;
          billing_address?: Json;
          subtotal_pence?: number;
          delivery_pence?: number;
          vat_pence?: number;
          total_pence?: number;
          subtotal?: number | null;
          delivery_fee?: number | null;
          total?: number | null;
          currency?: string | null;
          order_type?: 'retail' | 'trade' | null;
          status?: OrderStatus;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          stand_id: string | null;
          name_snapshot: string;
          product_name?: string | null;
          quantity: number;
          unit_price_pence: number;
          line_total_pence: number;
          unit_price?: number | null;
          line_total?: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          stand_id?: string | null;
          name_snapshot: string;
          product_name?: string | null;
          quantity: number;
          unit_price_pence: number;
          line_total_pence: number;
          unit_price?: number | null;
          line_total?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          stand_id?: string | null;
          name_snapshot?: string;
          product_name?: string | null;
          quantity?: number;
          unit_price_pence?: number;
          line_total_pence?: number;
          unit_price?: number | null;
          line_total?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_stand_id_fkey';
            columns: ['stand_id'];
            referencedRelation: 'stands';
            referencedColumns: ['id'];
          }
        ];
      };
      stand_requests: {
        Row: {
          id: string;
          user_id: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      public_stock: {
        Row: {
          product_id: string;
          status: 'in_stock' | 'low_stock' | 'out_of_stock';
        };
        Relationships: [];
      };
      stand_wholesale_prices: {
        Row: {
          stand_id: string;
          calculated_wholesale_pence: number;
          fixed_price_pence: number | null;
          effective_wholesale_pence: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_approved_trade: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      decrement_stock: {
        Args: {
          order_id: string;
        };
        Returns: void;
      };
      decrement_stock_on_paid_order: {
        Args: {
          p_order_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      account_status: AccountStatus;
      order_channel: OrderChannel;
      order_status: OrderStatus;
      promo_audience: PromoAudience;
    };
  };
}

