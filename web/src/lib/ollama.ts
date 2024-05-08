import ollama from "ollama";
import { Document } from "./document";

export const embed = async (document: Document): Promise<number[] | null> => {
  const res = await ollama
    .embeddings({
      model: "nomic-embed-text",
      prompt: document.content,
    })
    .then((res) => res.embedding)
    .catch(() => null);

  return res;
};
