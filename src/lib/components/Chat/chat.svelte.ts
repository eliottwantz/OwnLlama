export type ChatMessage = {
	question: string;
	answer: string;
	model: string;
	documentId?: string;
	timestamp: Date;
};

class ChatStore {
	messages = $state<ChatMessage[]>([]);

	latestChat = $derived(this.messages.at(-1));

	constructor() {}

	addQuestion(question: string, model: string, documentId?: string) {
		this.messages.push({ question, answer: '', model, timestamp: new Date(), documentId });
	}
}

export const useChatHistory = () => new ChatStore();
