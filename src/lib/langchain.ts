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
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { Document, type DocumentInput } from 'langchain/document';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { ChatPromptTemplate } from 'langchain/prompts';
import { HumanMessage, SystemMessage } from 'langchain/schema';

export const insertDocuments = async (
	documents: DocumentInput[],
	model: string = 'nomic-embed-text'
) => {
	await QdrantVectorStore.fromTexts(
		documents.map((d) => d.pageContent),
		documents.map((d) => ({ metadata: d.metadata })),
		new OllamaEmbeddings({ model, baseUrl: OLLAMA_URL }),
		{
			url: QDRANT_URL,
			collectionName: EMBEDDINGS_COLLECTION_NAME
		}
	);
};

export const insertPDF = async (file: Blob) => {
	const loader = new PDFLoader(file, {
		splitPages: false
	});

	const docs = await loader.load();

	await insertDocuments(docs);

	return docs;
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
	return await promptLLMWithKnowledge(question, undefined, model);
};

export const promptLLMWithDocument = async (
	question: string,
	docId: string,
	model: string = 'llama3'
) => {
	const document = await getPoint(docId).then((d) => d?.payload?.content as string | undefined);
	if (!document) {
		throw new Error('Document not found');
	}

	console.log('Document:\n', document);

	return await promptLLMWithKnowledge(question, document, model);
};

const promptLLMWithKnowledge = async (
	question: string,
	document?: string,
	model: string = 'llama3'
) => {
	const llm = createOllamaLLM(model);
	const prompt = ChatPromptTemplate.fromMessages([
		[
			'system',
			`Answer any use questions based solely on the context below:

<context>
{context}
</context>`
		],
		['human', '{input}']
	]);

	const documentChain = await createStuffDocumentsChain({
		llm,
		prompt
	});

	let response: string;
	if (document) {
		console.log('Have a document');
		response = await documentChain.invoke({
			input: question,
			context: [new Document({ pageContent: document })]
		});
	} else {
		const retriever = await createQdrantRetriever();

		const retrievalChain = await createRetrievalChain({
			combineDocsChain: documentChain,
			retriever
		});

		response = await retrievalChain
			.invoke({
				input: question
			})
			.then((r) => r.answer);
	}

	console.log('LLM response:\n', response);

	return response;
};

export const chatLLM = async (question: string, model: string = 'llama3') => {
	const llm = createOllamaLLM(model);

	const messages = [
		new SystemMessage('Please try to provide useful, helpful and actionable answers.'),
		new HumanMessage(question)
	];

	return llm.pipe(new HttpResponseOutputParser()).stream(messages);
};
