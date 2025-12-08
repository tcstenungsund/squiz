export class View {
	constructor() {
		this.container = document.querySelector("main");
	}

	renderQuestion(question) {
		// Generate HTML for answers
		const answers_html = question.answers
			.map(
				(answer, index) =>
					`<label><input id="${index}" name="answer" type="radio">${answer.text}</label>`,
			)
			.join("");

		this.container.innerHTML = `
			<article id="question">
				<h1 id="questionText">${question.text}</h1>
				<form id="answers">
					${answers_html}
				</form>
				<div id="btn-container"></div>
			</article>
		`;
	}

	renderPrevBtn(handler) {
		this.container
			.querySelector("#btn-container")
			.insertAdjacentHTML(
				"beforeend",
				`<button id="prev-btn">Previous</button>`,
			);
		this.container
			.querySelector("#prev-btn")
			.addEventListener("click", handler);
	}

	renderNextBtn(handler) {
		this.container
			.querySelector("#btn-container")
			.insertAdjacentHTML("beforeend", `<button id="next-btn">Next</button>`);
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
