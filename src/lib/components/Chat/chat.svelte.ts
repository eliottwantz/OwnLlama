export type ChatMessage = {
	question: string;
	answer: string;
	model: string;
	documentId?: string;
	timestamp: Date;
};

class ChatStore {
	messages = $state<ChatMessage[]>([
		{
			answer: `Hello there! How can I assist you today? Whether it's answering questions or providing guidance on a specific topic, I'm here to help. Just let me know what you need.\nBonus: Remember that seeking knowledge is the first step towards growth and understanding; don't hesitate to ask anything!`,
			model: 'phi3',
			question: 'Hi',
			timestamp: new Date()
		}
	]);

	latestChat = $derived(this.messages.at(-1));

	constructor() {}

	addQuestion(question: string, model: string, documentId?: string) {
		this.messages.push({ question, answer: '', model, timestamp: new Date(), documentId });
	}
}

export const useChatHistory = () => new ChatStore();
