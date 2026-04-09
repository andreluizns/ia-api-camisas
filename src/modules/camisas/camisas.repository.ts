import { desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { camisas } from "../../db/schema/camisas.js";
import type { CreateCamisaInput, SearchFilters } from "./camisas.schema.js";
import { buildSearchQueryParts } from "./search/search-query-builder.js";

export class CamisasRepository {
  async createCamisa(data: CreateCamisaInput) {
    const [row] = await db
      .insert(camisas)
      .values({
        club: data.club,
        brand: data.brand,
        model: data.model,
        year: data.year,
        price: data.price.toFixed(2),
        imageUrl: data.imageUrl ?? "",
      })
      .returning();

    if (!row) {
      throw new Error("FALHA AO CADASTRAR CAMISA!");
    }

    return row;
  }

  async searchfilterCamisas(params: { filters: SearchFilters }) {
    const queryParts = buildSearchQueryParts(params.filters);

    let itemsQuery = db.select().from(camisas).$dynamic();

    if (queryParts.where) {
      itemsQuery = itemsQuery.where(queryParts.where);
    }

    const items = await itemsQuery.orderBy(desc(camisas.createdAt));

    return { items };
  }
}
