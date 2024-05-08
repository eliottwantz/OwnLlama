import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  url: "http://127.0.0.1:6333",
});

export const ensureCollection = async (collectionName: string) => {
  const exists = await qdrant.collectionExists(collectionName);
  if (exists) return;

  console.log("Creating collection", collectionName);
  await qdrant.createCollection(collectionName, {
    vectors: {
      size: 768,
      distance: "Cosine",
    },
  });
};
