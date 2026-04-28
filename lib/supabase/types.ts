// Hand-written types for the Supabase schema. Regenerate with the Supabase
// CLI if the schema drifts: `supabase gen types typescript --project-id ...`.

export type License =
  | "CC0"
  | "CC-BY"
  | "CC-BY-SA"
  | "CC-BY-NC"
  | "CC-BY-NC-SA"
  | "CC-BY-ND"
  | "CC-BY-NC-ND"
  | "Custom"
  | "Unknown";

export interface BeyModelRow {
  id: string;
  bey_id: string;
  storage_path: string;
  format: "glb" | "gltf";
  attribution: string | null;
  license: License;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export type BeyModelInsert = Omit<BeyModelRow, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type BeyModelUpdate = Partial<BeyModelInsert>;

export interface Database {
  public: {
    Tables: {
      bey_models: {
        Row: BeyModelRow;
        Insert: BeyModelInsert;
        Update: BeyModelUpdate;
      };
    };
  };
}
