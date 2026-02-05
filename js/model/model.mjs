import { AnswerStore } from "./answerStore.mjs";

export class Model {
	constructor() {
		this.questions = [];
		this.currentIndex = 0;
		this.results = [];
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

	calculateResults() {
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

		this.results = Object.keys(scores)
			.sort((a, b) => scores[b] - scores[a])
			.slice(0, 3);
	}

	getResultImage() {
		return `./assets/backgrounds/${this.results[0]}.png`;
	}

	getResults() {
		const result_objects = [];

		for (let i = 0; i < this.results.length; i++) {
			result_objects.push(formatResult(this.results[i]));
		}

		return result_objects;
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

const labels = {
	tei: {
		title: "Informations- och medieteknik",
		info: "Inriktningen fokuserar på datorkommunikation, programmering och webbutveckling. Du lär dig hur datorer fungerar och kommunicerar över nätverk.",
	},
	tet: {
		title: "Teknikvetenskap",
		info: "Inriktningen teknikvetenskap omfattar kunskaper om och färdigheter i teknikvetenskapens arbetsmetoder och verktyg för matematisk modellering, simulering, styrning och reglering.",
	},
	ted: {
		title: "Design och produktutveckling",
		info: "Inriktningen ska ge dig kunskaper och färdigheter i design och produktutveckling. Idag är självklart datorstyrd design och konstruktion det centrala metoderna. ",
	},
	tes: {
		title: "Samhällsbyggande och miljö",
		info: "Inriktningen ska ge dig kunskaper om och färdigheter i samhällsbyggande, miljö och arkitektur. Såväl byggande som miljö ska ses från många perspektiv; tekniskt, estetiskt, socialt, ekonomiskt och ekologiskt.",
	},
	tep: {
		title: "Produktionsteknik",
		info: "Inriktningen ska ge dig kunskaper och färdigheter i produktion och företagande. Det innebär att behandla automation, hur produktionslinjer styrs och produktionskunskaper inom olika områden.",
	},
	indDrift: {
		title: "Driftsäkerhet och underhåll",
		info: "Inriktningen ska ge dig kunskaper om det strategiska och systematiska underhållets betydelse för utrustningars funktionalitet och en säker drift.",
	},
	indProcess: {
		title: "Processteknik",
		info: "Inriktningen ska ge dig kunskaper om kemiska eller mekaniska industriprocesser, kvalitetskontroll samt styr- och reglerteknik.",
	},
	indProduct: {
		title: "Produkt och maskinteknik",
		info: "Inriktningen ska ge dig kunskaper om hantering av verktyg och industriella utrustningar samt om hantering och bearbetning av ett visst material.",
	},
	indSvets: {
		title: "Svetsteknik",
		info: "Inriktningen ska ge dig kunskaper om och handlag med olika svetstekniker, plåtbearbetning och tillhörande arbetsmoment.",
	},
};

function formatResult(key) {
	return labels[key] ?? key;
}
