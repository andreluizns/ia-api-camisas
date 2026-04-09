import type { FastifyReply, FastifyRequest } from "fastify";
import { createCamisaSchema, searchRequestSchema } from "./camisas.schema.js";
import { CamisasService } from "./camisas.service.js";

export class CamisasController {
  constructor(private readonly service: CamisasService) {}

  createCamisa = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createCamisaSchema.parse(request.body);
    const result = await this.service.createCamisa(body);

    return reply.status(200).send(result);
  };

  searchCamisas = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = searchRequestSchema.parse(request.body);
    const result = await this.service.searchCamisas(body);

    return reply.status(200).send(result);
  };
}
