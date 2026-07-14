export enum UserRole {
  ADMIN = 'admin',
  MECHANIC = 'mechanic',
  STAFF = 'staff',
  CUSTOMER = 'customer'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  tractorModel: string;
  tractorNumber: string;
  joinedDate: string;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  brand: string;
  code: string;
  price: number;
  stock: number;
  supplier: string;
  minStockAlert: number;
  image?: string;
}

export enum RepairStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  UNDER_REPAIR = 'Under Repair',
  SPARE_PARTS_REQUIRED = 'Spare Parts Required',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered'
}

export interface TimelineEvent {
  status: RepairStatus;
  notes: string;
  updatedBy: string;
  timestamp: string;
}

export interface RepairRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tractorModel: string;
  tractorNumber: string;
  issueDescription: string;
  assignedMechanicId: string;
  assignedMechanicName: string;
  status: RepairStatus;
  estimatedCost: number;
  notes: string;
  timeline: TimelineEvent[];
  dateCreated: string;
}

export interface InvoiceItem {
  partId: string;
  partName: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  repairId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tractorModel: string;
  tractorNumber: string;
  mechanicId: string;
  mechanicName: string;
  sparePartsUsed: InvoiceItem[];
  repairCharges: number;
  discount: number;
  taxGst: number; // Percentage
  totalAmount: number;
  dateCreated: string;
  paymentStatus: 'Paid' | 'Pending';
  qrCodeValue: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  status: 'Active' | 'In Repair' | 'Off Duty';
  skills: string[];
}

export interface SystemSettings {
  shopName: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  workingHours: string;
}
