export interface Payment {
  id: string;
  user_id: string;
  date: string;
  amount_paid: number;
  daily_income: number | null;
  receipt_url: string | null;
  confirmation_code: string | null;
  notes: string | null;
  created_at: string;
}

export interface MonthlyStats {
  month: string;
  total_paid: number;
  total_income: number;
  days_count: number;
  avg_daily_payment: number;
}
