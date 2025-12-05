export class Model {
	constructor() {
		this.questions = [];
		this.currentIndex = 0;
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
