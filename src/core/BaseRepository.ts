export interface BaseRepository<T, ID = string> {
  findById(id: ID, workspaceId: string): Promise<T | null>;
  findAll(workspaceId: string, limit?: number, offset?: number): Promise<T[]>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, workspaceId: string, entity: Partial<T>): Promise<T>;
  delete(id: ID, workspaceId: string): Promise<boolean>;
}
