import express, { Express } from "express";
import { router } from "./routes/router";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./config/swagger";

const app: Express = express();

app.use(express.json());

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//routes
app.use("/api", router);

export default app;
