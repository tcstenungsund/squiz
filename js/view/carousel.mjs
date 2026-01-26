export class Carousel {
	constructor(root) {
		this.root = root;
		this.cards = Array.from(this.root.querySelectorAll(".card"));

		this.index = 0;

		this.root
			.querySelector(".prev")
			.addEventListener("click", () => this.prev());
		this.root
			.querySelector(".next")
			.addEventListener("click", () => this.next());

		this.update();
	}

	update() {
		this.cards.forEach((card, i) => {
			card.classList.toggle("active", i === this.index);
		});

		const card_width = this.cards[0].offsetWidth;
		const gap = 32; // must match CSS gap
		const offset = (card_width + gap) * this.index;

		this.root.style.transform = `translateX(calc(50% - ${offset}px - ${card_width / 2}px))`;
	}

	prev() {
		this.index = Math.max(this.index - 1, 0);
		this.update();
	}

	next() {
		this.index = Math.min(this.index + 1, this.cards.length - 1);
		this.update();
	}
}
