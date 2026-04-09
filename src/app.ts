import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { z } from "zod";
import { camisasRoutes } from "./modules/camisas/camisas.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Zod type provider: valida e serializa usando Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Camisas API",
        description: "API para gerenciamento de camisas de futebol",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
    },
  });

  app.get(
    "/teste",
    {
      schema: {
        summary: "Health check",
        tags: ["Health"],
        response: {
          200: z.object({
            status: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    async () => ({
      status: true,
      message: "Api funcionando!",
    })
  );

  app.register(camisasRoutes);

  return app;
}
