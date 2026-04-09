import type { CamisasRepository } from "./camisas.repository.js";
import type { CreateCamisaInput, SearchCamisasRequestInput } from "./camisas.schema.js";
import type { AiSearchAgentService } from "./search/ai-search-agent.service.js";

export class CamisasService {
  constructor(
    private readonly repository: CamisasRepository,
    private readonly searchAgent: AiSearchAgentService,
  ) {}

  async createCamisa(input: CreateCamisaInput) {
    const created = await this.repository.createCamisa(input);
    return created;
  }

  async searchCamisas(input: SearchCamisasRequestInput) {
    const result = await this.searchAgent.run(input.search);
    return result;
  }
}
