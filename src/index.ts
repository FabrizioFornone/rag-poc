import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  try {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`[server]: Swagger docs at http://localhost:${port}/api-docs`);
    });
  } catch (error: unknown) {
    console.error(error);
    process.exit(1);
  }
};

void start();
