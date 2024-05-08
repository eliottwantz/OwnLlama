import { embed } from "./ollama";
import { ensureCollection, qdrant } from "./qdrant";

const COLLECTION_NAME = "knwoledge_base";
const DOCUMENTS = [
  "Qdrant is an open-source vector database that allows developers to efficiently store and query large-scale vector data. It is designed to work seamlessly with popular deep learning frameworks like PyTorch and TensorFlow, making it an ideal choice for applications that require fast and efficient vector search and retrieval. Qdrant's architecture is highly scalable and can handle large volumes of data, making it suitable for use cases such as recommendation systems, facial recognition, and natural language processing.",
  "Docker is a popular containerization platform that allows developers to package, ship, and run applications in containers. Containers provide a lightweight and portable way to deploy applications, making it easy to manage and scale applications in a variety of environments. Docker is widely used in production environments and is supported by a large community of developers and companies.",
  "PyTorch is a popular open-source machine learning framework that provides a dynamic computation graph and automatic differentiation. It is widely used for building and training machine learning models, particularly in the areas of computer vision, natural language processing, and reinforcement learning. PyTorch is known for its ease of use, flexibility, and scalability, making it a popular choice among researchers and developers.",
  "Postgres is a popular open-source relational database management system that provides a robust and scalable way to store and manage data. It is widely used in a variety of applications, including web applications, data analytics, and business intelligence. Postgres is known for its reliability, security, and performance, making it a popular choice among developers and companies.",
  "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints. It is designed to be highly performant, scalable, and easy to use. FastAPI is built on top of standard Python type hints and supports asynchronous programming, making it ideal for building high-performance web applications.",
];

export const run = async () => {
  const embeddings = await createEmbeddings();
  if (!embeddings) return;

  await insertDocuments(embeddings);
};

const createEmbeddings = async () => {
  await ensureCollection(COLLECTION_NAME);

  const embeddings = await Promise.all(DOCUMENTS.map((d) => embed(d))).catch(
    (e) => {
      console.log("Error creating ebeddings", e);
      return null;
    }
  );

  if (!embeddings) return;

  console.log("length of embeddings:", embeddings[0]?.length);

  return embeddings;
};

const insertDocuments = async (embeddings: number[][]) => {
  const upsertResult = await qdrant
    .upsert(COLLECTION_NAME, {
      points: embeddings.map((e) => ({
        id: crypto.randomUUID(),
        vector: e,
        payload: {
          document: DOCUMENTS[embeddings.indexOf(e)],
        },
      })),
    })
    .catch((e) => {
      console.log("Error upserting", e);
      return null;
    });

  if (!upsertResult) return;

  console.log("upsertResult", upsertResult);
};
