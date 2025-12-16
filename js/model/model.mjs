import { AnswerStore } from "./answerStore.mjs";

export class Model {
	constructor() {
		this.questions = [];
		this.currentIndex = 0;
		this.answerStore = new AnswerStore();
	}

	saveCurrentAnswer(answer_index) {
		const question = this.getCurrentQuestion();
		const answer = question.answers[answer_index];
		this.answerStore.setAnswer(question.id, answer_index, answer);
	}

	getCurrentAnswer() {
		const question = this.getCurrentQuestion();
		return this.answerStore.getAnswer(question.id);
	}

	getResults() {
		const scores = {
			tei: 0,
			tet: 0,
			ted: 0,
			tes: 0,
			tep: 0,
			ind: 0,
			indDrift: 0,
			indProcess: 0,
			indProduct: 0,
			indSvets: 0,
		};

		for (const question of this.questions) {
			const answer = this.answerStore.getAnswer(question.id);
			if (!answer || !answer.score) continue;

			for (const key in answer.score) {
				if (key in scores) {
					scores[key] += answer.score[key];
				}
			}
		}

		const max_score = Math.max(...Object.values(scores));
		const result = Object.keys(scores).filter(
			(key) => scores[key] === max_score && max_score > 0,
		);

		return result;
	}

	async loadQuestions() {
		const response = await fetch("./js/model/questions.json");
		const data = await response.json();
		this.questions = data.questions;
	}

	getCurrentQuestion() {
		return this.questions[this.currentIndex];
	}

	goPrevQuestion() {
		this.currentIndex -= 1;
	}

	goNextQuestion() {
		this.currentIndex += 1;
	}

	isFirstQuestion() {
		return this.currentIndex === 0;
	}

	isLastQuestion() {
		return this.currentIndex === this.questions.length - 1;
	}
}
