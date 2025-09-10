import { ErrorResponse, SuccessResponse } from "../types";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { openai } from "../config/openai";
import { supabaseConnection as supabase } from "../config/database";

export const generateAndStoreEmbeddingsService = async (): Promise<
  SuccessResponse<{ message: string }> | ErrorResponse
> => {
  try {
    const loader = new CheerioWebBaseLoader("https://www.inboxpurge.com/faq");
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitDocuments(docs);

    const promises = chunks.map(async (chunk) => {
      const cleanChunk = chunk.pageContent.replace(/\n/g, " ");

      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: cleanChunk,
      });

      const [{ embedding }] = embeddingResponse.data;

      const { error } = await supabase.from("documents").insert({
        content: cleanChunk,
        embedding,
      });

      if (error) {
        throw error;
      }
    });

    await Promise.all(promises);

    return {
      code: 201,
      data: { message: "Embeddings generated and stored successfully" },
    };
  } catch (error: unknown) {
    console.error("Error in generateAndStoreEmbeddingsService:", error);
    return {
      error: true,
      code: 500,
      errorMessage: "Error generating and storing embeddings",
    };
  }
};

export const handleQueryService = async (
  query: string
): Promise<SuccessResponse<{ response: string | null }> | ErrorResponse> => {
  try {
    const input = query.replace(/\n/g, " ");

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input,
    });

    const [{ embedding }] = embeddingResponse.data;

    const { data: documents, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 10,
    });

    if (error) throw error;

    let contextText = "";

    interface DocumentMatch {
      content: string;
      [key: string]: any;
    }

    const docs = documents as DocumentMatch[];

    contextText += docs
      .map((document: DocumentMatch) => `${document.content.trim()}---\n`)
      .join("");

    const messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[] = [
      {
        role: "system",
        content: `You are a representative that is very helpful when it comes to talking about InboxPurge, Only ever answer
      truthfully and be as helpful as you can!`,
      },
      {
        role: "user",
        content: `Context sections: "${contextText}" Question: "${query}" Answer as simple text:`,
      },
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-5-nano",
      temperature: 0.8,
    });

    return {
      code: 200,
      data: { response: completion.choices[0].message.content },
    };
  } catch (error: unknown) {
    console.error("Error in handleQueryService:", error);
    return {
      error: true,
      code: 500,
      errorMessage: "Error handling query",
    };
  }
};
