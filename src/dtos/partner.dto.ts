export interface PartnerDto {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartnerDto {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  description?: string;
}

export interface UpdatePartnerDto {
  name?: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface PartnerWithProductsDto extends PartnerDto {
  products?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export interface PaginatedPartnersDto {
  partners: PartnerDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
