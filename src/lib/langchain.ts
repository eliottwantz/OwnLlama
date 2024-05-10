import { OLLAMA_URL, createOllamaLLM } from '$lib/ollama';
import {
	EMBEDDINGS_COLLECTION_NAME,
	QDRANT_URL,
	createQdrantRetriever,
	getPoint
} from '$lib/qdrant';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { Document, type DocumentInput } from 'langchain/document';
import { ChatPromptTemplate } from 'langchain/prompts';
import { RunnableMap } from 'langchain/runnables';
import { StringOutputParser } from 'langchain/schema/output_parser';

export const insertDocuments = async (
	documents: DocumentInput[],
	model: string = 'nomic-embed-text'
) => {
	const store = await QdrantVectorStore.fromTexts(
		documents.map((d) => d.pageContent),
		documents.map((d) => ({ metadata: d.metadata })),
		new OllamaEmbeddings({ model, baseUrl: OLLAMA_URL }),
		{
			url: QDRANT_URL,
			collectionName: EMBEDDINGS_COLLECTION_NAME
		}
	);

	return store;
};

export const generateEmbeddings = async (documents: DocumentInput[]) => {
	const embeddings = new OllamaEmbeddings({
		model: 'nomic-embed-text',
		baseUrl: OLLAMA_URL
	});
	const documentEmbeddings = await embeddings.embedDocuments(documents.map((d) => d.pageContent));
	return documentEmbeddings;
};

export const promptLLM = async (prompt: string, model: string = 'llama3') => {
	const llm = createOllamaLLM(model);
	return await llm.invoke(prompt);
};

export const promptLLMWithKnowledgeBase = async (question: string, model: string = 'llama3') => {
	const llm = createOllamaLLM(model);
	const retriever = await createQdrantRetriever();
	const prompt = ChatPromptTemplate.fromMessages([
		[
			'ai',
			`You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know and that you will do your research on that. Always add an emoji at the end of your answer.

			Context: {context}.
			Question:`
		],
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

export const promptLLMWithDocument = async (
	question: string,
	docId: string,
	model: string = 'llama3'
) => {
	const document = await getPoint(docId).then(
		(d) => d.data.result?.payload?.content as string | undefined
	);
	if (!document) {
		throw new Error('Document not found');
	}

	const llm = createOllamaLLM(model);
	const prompt = ChatPromptTemplate.fromMessages([
		[
			'ai',
			`You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know and that you will do your research on that. Always add an emoji at the end of your answer.

			Context: {context}.
			Question:`
		],
		['human', '{question}'],
		['assistant', 'Answer:']
	]);

	const chain = prompt.pipe(llm).pipe(new StringOutputParser());

	const response = await chain.invoke({
		question,
		context: [
			new Document({
				pageContent: document
			})
		]
	});

	console.log('LLM response:\n', response);

	return response;
};
