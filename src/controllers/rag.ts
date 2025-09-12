import { Request, Response } from "express";

import { ErrorResponse, SuccessResponse } from "../types";
import { validateFields, convertToObject } from "../utils";
import {
  generateAndStoreEmbeddingsService,
  handleQueryService,
} from "../services";

import * as yup from "yup";

/**
 * @swagger
 * /rag/embed:
 *   post:
 *     summary: Generate and store embeddings
 *     tags: [Embeddings]
 *     responses:
 *       201:
 *         description: Embeddings generated and stored successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Embeddings generated and stored successfully.
 *       500:
 *         description: Internal server error.
 */
export const generateAndStoreEmbeddingsController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const result = await generateAndStoreEmbeddingsService();

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{ message: string }>;
  return res.status(code).json(data);
};

/**
 * @swagger
 * /rag/query:
 *   post:
 *     summary: Handle a query and return a response based on stored embeddings
 *     tags: [Query]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: What is the capital of France?
 *     responses:
 *       200:
 *         description: Successful response with the answer to the query.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   example: The capital of France is Paris.
 *       400:
 *         description: Bad request. Validation error for the input fields.
 *       500:
 *         description: Internal server error.
 */
export const handleQueryController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { body } = req;

  const querySchema = yup.object().shape({
    query: yup.string().required(),
  });

  const validationResponse = await validateFields(querySchema, body);

  if (validationResponse?.result) {
    return res.status(400).json(convertToObject(validationResponse));
  }

  const { query }: { query: string } = body;

  const result = await handleQueryService(query);

  if (result.error) {
    const { code, errorMessage } = result as ErrorResponse;
    return res.status(code).json({ error: errorMessage });
  }

  const { data, code } = result as SuccessResponse<{ response: string }>;
  return res.status(code).json(data);
};
