export interface CategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  children: CategoryResponse[];
}
