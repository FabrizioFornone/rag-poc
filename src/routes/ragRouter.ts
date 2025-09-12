import { Router } from "express";
import { generateAndStoreEmbeddingsController,  handleQueryController} from "../controllers";

const ragRouter = Router();

ragRouter.post("/embed", generateAndStoreEmbeddingsController);

ragRouter.post("/query", handleQueryController);

export { ragRouter };
