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
		this.view.renderQuestion(question);
		if (!this.model.isFirstQuestion()) {
			this.view.renderPrevBtn(() => {
				this.model.goPrevQuestion();
				this.render();
			});
		}
		if (!this.model.isLastQuestion()) {
			this.view.renderNextBtn(() => {
				this.model.goNextQuestion();
				this.render();
			});
		}
	}
}

const model = new Model();
const view = new View();
const controller = new Controller(model, view);
controller.initialize();
