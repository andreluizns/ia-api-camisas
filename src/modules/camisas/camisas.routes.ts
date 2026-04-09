import type { FastifyInstance } from "fastify";
import { CamisasController } from "./camisas.controller.js";
import { CamisasRepository } from "./camisas.repository.js";
import {
  camisaResponseSchema,
  createCamisaSchema,
  searchRequestSchema,
  searchResponseSchema,
} from "./camisas.schema.js";
import { CamisasService } from "./camisas.service.js";
import { AiSearchAgentService } from "./search/ai-search-agent.service.js";

const repository = new CamisasRepository();
const searchAgent = new AiSearchAgentService(repository);
const service = new CamisasService(repository, searchAgent);
const controller = new CamisasController(service);

export async function camisasRoutes(app: FastifyInstance) {
  app.post(
    "/camisas",
    {
      schema: {
        summary: "Criar camisa",
        description: "Cadastra uma nova camisa de futebol no sistema.",
        tags: ["Camisas"],
        body: createCamisaSchema,
        response: {
          200: camisaResponseSchema,
        },
      },
    },
    controller.createCamisa,
  );

  app.post(
    "/camisas/search",
    {
      schema: {
        summary: "Buscar camisas",
        description:
          "Realiza busca semântica por camisas usando linguagem natural. Retorna lista de camisas correspondentes e uma resposta em linguagem natural.",
        tags: ["Camisas"],
        body: searchRequestSchema,
        response: {
          200: searchResponseSchema,
        },
      },
    },
    controller.searchCamisas,
  );
}
