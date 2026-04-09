import { and, eq, gte, ilike, lte, type SQL } from "drizzle-orm";
import { camisas } from "../../../db/schema/camisas.js";
import type { SearchFilters } from "../camisas.schema.js";

export function buildSearchQueryParts(filters: SearchFilters) {
  const parts: SQL[] = [];

  if (filters.club) {
    parts.push(ilike(camisas.club, `%${filters.club}%`));
  }

  if (filters.brand) {
    parts.push(ilike(camisas.brand, `%${filters.brand}%`));
  }

  if (filters.model) {
    parts.push(ilike(camisas.model, `%${filters.model}%`));
  }

  if (filters.year !== undefined) {
    parts.push(eq(camisas.year, filters.year));
  }

  if (filters.yearMin !== undefined) {
    parts.push(gte(camisas.year, filters.yearMin));
  }

  if (filters.yearMax !== undefined) {
    parts.push(lte(camisas.year, filters.yearMax));
  }

  if (!parts.length) {
    return {};
  }

  return { where: parts.length === 1 ? parts[0]! : and(...parts) };
}
