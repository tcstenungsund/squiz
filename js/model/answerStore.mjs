export class AnswerStore {
	constructor(storage_key = "userAnswers") {
		this.storageKey = storage_key;
		this.answers = this.load();
	}

	load() {
		const raw = localStorage.getItem(this.storageKey);
		return raw ? JSON.parse(raw) : {};
	}

	save() {
		localStorage.setItem(this.storageKey, JSON.stringify(this.answers));
	}

	setAnswer(question_id, answer_index, answer) {
		this.answers[question_id] = {
			selected: answer_index,
			score: answer.score,
		};
		this.save();
	}

	getAnswer(question_id) {
		return this.answers[question_id] ?? null;
	}

	getAllAnswers() {
		return { ...this.answers };
	}

	clear() {
		this.answers = {};
		localStorage.removeItem(this.storageKey);
	}
}
