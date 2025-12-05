export class View {
	constructor() {
		this.container = document.querySelector("main");
	}

	renderQuestion(question) {
		// Generate HTML for answers
		const answers_html = question.answers
			.map(
				(answer, index) =>
					`<li id="${index}" class="answer">${answer.text}</li>`,
			)
			.join("");

		this.container.innerHTML = `
			<article id="question">
				<h1 id="questionText">${question.text}</h1>
				<ul id="answers">
					${answers_html}
				</ul>
			</article>
		`;
	}

	renderPrevBtn(handler) {
		this.container.insertAdjacentHTML(
			"beforeend",
			`<button id="prev-btn">Previous</button>`,
		);
		this.container
			.querySelector("#prev-btn")
			.addEventListener("click", handler);
	}

	renderNextBtn(handler) {
		this.container.insertAdjacentHTML(
			"beforeend",
			`<button id="next-btn">Next</button>`,
		);
		this.container
			.querySelector("#next-btn")
			.addEventListener("click", handler);
	}

	showLoading() {
		this.container.innerHTML = "<p>Loading questions...</p>";
	}

	showError(error) {
		document.body.innerHTML += `<div class="error">${error}</div>`;
	}
}
