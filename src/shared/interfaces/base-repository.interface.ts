export interface BaseRepository<T> {
  create(data: Partial<T>): T;
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  softDelete(id: string): Promise<void>;
}
