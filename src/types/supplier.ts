export interface SupplierAttributes {
  supplier_id: number;
  name: string;
  contact_person?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}