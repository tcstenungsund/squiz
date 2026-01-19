export class View {
	constructor() {
		this.container = document.querySelector("main");
	}

	renderResult(result, image_path) {
		let result_header;

		if (result.length === 1) {
			result_header = "Den linje som passar dig bäst är:";
		} else {
			result_header = "De linjer som passar dig bäst är;";
		}

		this.container.innerHTML = `
			<article id="results">
				<p>${result_header}</p>
				<h2>${formatResultText(result)}!</h2>
			</article>
		`;

		this.container.style.backgroundImage = `url(${image_path})`;
	}

	renderQuestion(question, selected_answer, on_answer_change) {
		const answers_html = question.answers
			.map((answer, index) => {
				const checked = index === selected_answer ? "checked" : "";
				return `
				<label>
					<input
						type="radio"
						name="answer"
						value="${index}"
						${checked}
					>
					${answer.text}
				</label>
			`;
			})
			.join("");

		this.container.innerHTML = `
			<article id="question">
				<h2 id="questionText">${question.text}</h2>
				<form id="answers">
					${answers_html}
				</form>
				<div id="btn-container"></div>
			</article>
		`;

		this.container.querySelector("#answers").addEventListener("change", (e) => {
			if (e.target.name === "answer") {
				on_answer_change(Number(e.target.value));
			}
		});
	}

	renderPrevBtn(handler) {
		this.container
			.querySelector("#btn-container")
			.insertAdjacentHTML("beforeend", `<button id="prev-btn"></button>`);
		this.container
			.querySelector("#prev-btn")
			.addEventListener("click", handler);
	}

	renderNextBtn(handler, disabled) {
		const disabled_attr = disabled ? "disabled" : "";
		this.container
			.querySelector("#btn-container")
			.insertAdjacentHTML(
				"beforeend",
				`<button id="next-btn" ${disabled_attr}></button>`,
			);
		this.container
			.querySelector("#next-btn")
			.addEventListener("click", handler);
	}

	renderSubmitBtn(handler) {
		this.container
			.querySelector("#btn-container")
			.insertAdjacentHTML("beforeend", `<button id="submit-btn"></button>`);
		this.container
			.querySelector("#submit-btn")
			.addEventListener("click", handler);
	}

	activateNextBtn() {
		this.container.querySelector("#next-btn").disabled = false;
	}

	showLoading() {
		this.container.innerHTML = `<div class="loader"></div>`;
	}

	showError(error) {
		document.body.innerHTML += `<div class="error">${error}</div>`;
	}
}

function formatResultText(result) {
	if (result.length === 0) return "";
	if (result.length === 1) return result[0];
	if (result.length === 2) return `${result[0]} eller ${result[1]}`;
	return `${result.slice(0, -1).join(", ")} eller ${result[result.length - 1]}`;
}
