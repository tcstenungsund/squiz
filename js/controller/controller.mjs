import { Model } from "../model/model.mjs";
import { View } from "../view/view.mjs";

class Controller {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	async initialize() {
		this.view.showLoading();

		try {
			await this.model.loadQuestions();
			this.render();
		} catch (error) {
			this.view.showError(error);
		}
	}

	render() {
		const question = this.model.getCurrentQuestion();
		const current_answer = this.model.getCurrentAnswer();
		const selected = current_answer ? current_answer.selected : null;

		this.view.renderQuestion(question, selected, (value) => {
			this.model.saveCurrentAnswer(value);
			this.view.activateNextBtn();
		});

		if (!this.model.isFirstQuestion()) {
			this.view.renderPrevBtn(() => {
				this.model.goPrevQuestion();
				this.render();
			});
		}

		if (this.model.isLastQuestion()) {
			this.view.renderSubmitBtn(() => {
				const results = this.model.getResults();
				this.view.renderResult(results);
			});
		} else {
			this.view.renderNextBtn(() => {
				this.model.goNextQuestion();
				this.render();
			}, selected === null);
		}
	}
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
controller.initialize();
