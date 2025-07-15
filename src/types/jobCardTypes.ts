export interface JobCard {
  id: string;
  job_number: string;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  company_name: string | null;
  abn: string | null;
  mobile: string | null;
  email: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_month: string | null;
  vehicle_year: number | null;
  vehicle_kms: number | null;
  fuel_type: string | null;
  vin: string | null;
  rego: string | null;
  vehicle_state: string | null;
  tyre_size: string | null;
  next_service_kms: number | null;
  vehicle_type: string[] | null;
  service_selection: string | null;
  job_start_date: string | null;
  expected_completion_date: string | null;
  completed_date: string | null;
  approximate_cost: number | null;
  assigned_worker: string | null;
  assigned_parts: string | null;
  customer_declaration_authorized: boolean | null;
  customer_signature: string | null;
  is_archived: boolean;
  is_worker_assigned_complete: boolean;
  is_parts_assigned_complete: boolean;
  payment_status: string;
  service_progress: ServiceTask[] | null;
  trailer_progress: ServiceTask[] | null;
  parts_and_consumables: PartsAndConsumablesData | null;
  handover_valuables_to_customer: string | null;
  check_all_tyres: string | null;
  total_a: number | null;
  total_hours: number | null;
  future_work_notes: string | null;
  image_front: string | null;
  image_back: string | null;
  image_right_side: string | null;
  image_left_side: string | null;
  supervisor_signature: string | null;
  grand_total: number | null;
}

export interface ServiceTask {
  task: string;
  status: 'tick' | 'cross' | 'n/a' | null;
  description: string;
  done_by: string;
  hours: number | null;
  section?: string;
}

export interface TrailerProgressData {
  inspection_date: string | null;
  kilometers: number | null;
  plant_number: string | null;
  tasks: ServiceTask[];
}

export interface OtherProgressData {
  tasks: ServiceTask[];
}

export interface PartAndConsumable {
  part_number: string;
  description: string;
  price: number | null;
  qty_used: number | null;
  total_cost: number | null;
  supplier: string;
  remarks: string;
}

export interface PartsAndConsumablesData {
  parts: PartAndConsumable[];
  total_b: number | null;
}

export interface Lubricant {
  name: string;
  grade: string;
  qty: number | null;
  cost_per_litre: number | null;
  total_cost: number | null;
  remarks: string;
}

export interface LubricantsUsedData {
  lubricants: Lubricant[];
  total_c: number | null;
}

export interface JobCardFormData {
  job_year: string;
  job_month: string;
  job_sequence: string;
  job_start_date: string;
  expected_completion_date: string;
  completed_date: string;
  approximate_cost: string;
  customer_name: string;
  company_name: string;
  abn: string;
  mobile: string;
  email: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_month: string;
  vehicle_year: string;
  vehicle_kms: string;
  fuel_type: string;
  vin: string;
  rego: string;
  vehicle_state: string;
  tyre_size: string;
  next_service_kms: string;
  vehicle_type: string[];
  service_selection: string;
  assigned_worker: string;
  assigned_parts: string;
  customer_declaration_authorized: boolean;
  customer_signature: string;
  service_progress: ServiceTask[] | null;
  trailer_progress: TrailerProgressData | null;
  other_progress: OtherProgressData | null;
  parts_and_consumables: PartsAndConsumablesData | null;
  lubricants_used: LubricantsUsedData | null;
  lubricants_used: LubricantsUsedData | null;
  handover_valuables_to_customer: string;
  check_all_tyres: string;
  total_a: string;
  total_hours: string;
  future_work_notes: string;
  invoice_number: string;
  invoice_date: string;
  invoice_value: string;
  part_location: string;
  issue_counter_sale: string;
  image_front: string;
  image_back: string;
  image_right_side: string;
  image_left_side: string;
  supervisor_signature: string;
  grand_total: string;
}