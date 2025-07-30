export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      regular_expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          payment_date: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          payment_date: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: string;
          payment_date?: number;
          updated_at?: string;
        };
      };
      sporadic_expenses: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: string;
          date?: string;
        };
      };
      pending_loans: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          probability: number;
          expected_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          probability: number;
          expected_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          probability?: number;
          expected_date?: string | null;
          updated_at?: string;
        };
      };
      wishlist_items: {
        Row: {
          id: string;
          user_id: string;
          item: string;
          price: number;
          priority: "alta" | "media" | "baja";
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item: string;
          price: number;
          priority: "alta" | "media" | "baja";
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item?: string;
          price?: number;
          priority?: "alta" | "media" | "baja";
          category?: string;
          updated_at?: string;
        };
      };
      monthly_salaries: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          month: number;
          year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          month: number;
          year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          month?: number;
          year?: number;
          updated_at?: string;
        };
      };
    };
  };
}
