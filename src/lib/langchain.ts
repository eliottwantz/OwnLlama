import type { Document } from '$lib/document';
import { OLLAMA_URL, createOllamaLLM } from '$lib/ollama';
import { EMBEDDINGS_COLLECTION_NAME, QDRANT_URL, createQdrantRetriever } from '$lib/qdrant';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { ChatPromptTemplate } from 'langchain/prompts';
import { StringOutputParser } from 'langchain/schema/output_parser';

export const insertDocuments = async (
	documents: Document[],
	model: string = 'nomic-embed-text'
) => {
	const store = await QdrantVectorStore.fromTexts(
		documents.map((d) => d.content),
		documents.map((d) => ({ metadata: d.metadata })),
		new OllamaEmbeddings({ model, baseUrl: OLLAMA_URL }),
		{
			url: QDRANT_URL,
			collectionName: EMBEDDINGS_COLLECTION_NAME
		}
	);

	return store;
};

export const generateEmbeddings = async (documents: Document[]) => {
	const embeddings = new OllamaEmbeddings({
		model: 'nomic-embed-text',
		baseUrl: OLLAMA_URL
	});
	const documentEmbeddings = await embeddings.embedDocuments(documents.map((d) => d.content));
	return documentEmbeddings;
};

export const promptLLM = async (prompt: string, model: string = 'llama3') => {
	const client = createOllamaLLM(model);
	return await client.invoke(prompt);
};

export const promptLLMWithKnowledgeBase = async (question: string, model: string = 'llama3') => {
	const llm = createOllamaLLM(model);
	const retriever = await createQdrantRetriever();
	const prompt = ChatPromptTemplate.fromMessages([
		[
			'system',
			"You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know and that you will do your research on that. Always add an emoji at the end of your answer."
		],
		['system', 'Context: {context} '],
		['system', 'Question:'],
		['human', '{question}'],
		['assistant', 'Answer:']
	]);

	const ragChain = await createStuffDocumentsChain({
		llm,
		prompt,
		outputParser: new StringOutputParser()
	});

	const retrievedDocs = await retriever.invoke(question);

	const response = await ragChain.invoke({
		question,
		context: retrievedDocs
	});

	console.log('LLM response:\n', response);

	return response;
};

// const response = await ragChain.invoke({
// 	question,
// 	context: [
// 		new DD({
// 			pageContent: 'Eliott is Italian. He is 26 years old. He likes ice cream.'
// 		})
// 	]
// });
