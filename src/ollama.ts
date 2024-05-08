import ollama from "ollama";

export const embed = async (document: string): Promise<number[]> => {
  const res = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: document,
  });

  return res.embedding;
};
