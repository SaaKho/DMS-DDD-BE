// src/utils/Pagination.ts

export class Pagination<T> {
  private items: T[];
  private totalItems: number;
  private currentPage: number;
  private itemsPerPage: number;

  constructor(items: T[], totalItems: number, page: number, limit: number) {
    this.totalItems = totalItems;
    this.itemsPerPage = limit;
    this.currentPage = page;
    this.items = this.paginateItems(items);
  }

  // Helper to paginate items based on current page and limit
  private paginateItems(items: T[]): T[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return items.slice(start, start + this.itemsPerPage);
  }

  // Check if there's a next page
  hasNextPage(): boolean {
    return this.currentPage < this.totalPages();
  }

  // Check if there's a previous page
  hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  // Get the next page number
  nextPage(): number | null {
    return this.hasNextPage() ? this.currentPage + 1 : null;
  }

  // Get the previous page number
  prevPage(): number | null {
    return this.hasPrevPage() ? this.currentPage - 1 : null;
  }

  // Calculate total pages
  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Get paginated data with metadata
  getPaginatedData(): {
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  } {
    return {
      data: this.items,
      totalItems: this.totalItems,
      totalPages: this.totalPages(),
      currentPage: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    };
  }
}
