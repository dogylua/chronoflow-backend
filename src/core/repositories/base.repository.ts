import {
  Repository,
  FindOptionsWhere,
  FindOptionsRelations,
  ObjectLiteral,
  FindOptionsOrder,
  DeepPartial,
  UpdateResult,
} from "typeorm";
import { Logger } from "@nestjs/common";
import { AppError } from "../error/app-error";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    repositoryName: string
  ) {
    this.logger = new Logger(repositoryName);
  }

  async findById(id: string | number): Promise<T | null> {
    return this.executeWithErrorHandling(
      () =>
        this.repository.findOne({
          where: { id } as unknown as FindOptionsWhere<T>,
        }),
      "find by id"
    );
  }

  async findAll(): Promise<T[]> {
    return this.executeWithErrorHandling(
      () => this.repository.find(),
      "find all"
    );
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>
  ): Promise<T | null> {
    return this.executeWithErrorHandling(
      () => this.repository.findOne({ where, relations }),
      "find one record"
    );
  }

  async findMany(
    where?: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>
  ): Promise<T[]> {
    return this.executeWithErrorHandling(
      () => this.repository.find({ where, relations }),
      "find many records"
    );
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return this.executeWithErrorHandling(
      () => this.repository.save(data as DeepPartial<T>),
      "create record"
    );
  }

  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    return this.executeWithErrorHandling(async () => {
      const updateResult = await this.repository.update(
        id,
        data as unknown as Partial<T>
      );

      if (updateResult.affected === 0) {
        return null;
      }

      return this.findById(id);
    }, "update record");
  }

  async delete(id: string | number): Promise<boolean> {
    return this.executeWithErrorHandling(async () => {
      const result = await this.repository.delete(id);
      return result.affected > 0;
    }, "delete record");
  }

  async paginate(
    options: PaginationOptions,
    where?: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>
  ): Promise<PaginatedResult<T>> {
    return this.executeWithErrorHandling(async () => {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const [items, total] = await this.repository.findAndCount({
        where,
        relations,
        skip: (page - 1) * limit,
        take: limit,
        order: { [sortBy]: sortOrder } as unknown as FindOptionsOrder<T>,
      });

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }, "paginate records");
  }

  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(
        `Error in ${context}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(`Failed to ${context}`, 500);
    }
  }
}
