export interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  role: 'customer' | 'admin';
  created_at?: Date;
  updated_at?: Date;
  is_active: boolean;
}
export interface RegisUserAttributes {
  username: string;
  password_hash: string;
  email: string;
}
export interface UpdateUserAttributes {
  email?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  send_verify_email?: boolean;
}