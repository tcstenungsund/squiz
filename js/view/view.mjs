export class View {
	constructor() {
		this.container = document.querySelector("main");
	}

	renderResult(result, image_path) {
		const result_cards_html = result
			.map(
				(item, index) => `
                <div class="container">
                    <div class="card">
                        <div class="front">
                            <span>${index + 1}</span>
                            <h2>${item.title}</h2>
                            <p>Tryck för mer info</p>
                        </div>
                        <div class="back">
                            <p>${item.info}</p>
                        </div>
                    </div>
                </div>
            `,
			)
			.join("");
		this.container.innerHTML = `
        <article id="results">
            <div class="cards-wrapper">
                ${result_cards_html}
            </div>
            <button class="nav prev">previous</button>
            <button class="nav next">next</button>
        </article>
    `;

		// ADD THIS LINE - it was missing!
		const containers = document.querySelectorAll(".container");
		let current_index = 0;

		// Show first card
		if (containers.length > 0) {
			containers[0].classList.add("active");
		}

		// Navigation buttons
		document.querySelector(".nav.prev").addEventListener("click", () => {
			if (current_index > 0) {
				containers[current_index].classList.remove("active");
				current_index--;
				containers[current_index].classList.add("active");
			}
		});

		document.querySelector(".nav.next").addEventListener("click", () => {
			if (current_index < containers.length - 1) {
				containers[current_index].classList.remove("active");
				current_index++;
				containers[current_index].classList.add("active");
			}
		});

		this.container.style.backgroundImage = `url(${image_path})`;
		this.container.querySelectorAll(".container").forEach((container) => {
			container.addEventListener("click", function () {
				this.classList.toggle("flipped");
			});
		});
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
