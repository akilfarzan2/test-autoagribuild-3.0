export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  mobile: string | null;
  company_name: string | null;
  email: string | null;
  abn: string | null;
  rego: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_month: string | null;
  vehicle_year: number | null;
}

export interface CustomerFormData {
  id?: string;
  customer_name: string;
  mobile: string;
  company_name: string;
  email: string;
  abn: string;
  rego: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_month: string;
  vehicle_year: string;
}