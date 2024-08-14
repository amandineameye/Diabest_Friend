const APIURL = "http://localhost:3000/";
const NEXT_LINK = document.getElementById("next");
const SELECT1 = document.getElementById("carb1");
const SELECT2 = document.getElementById("carb2");
const SELECT3 = document.getElementById("carb3");
const INPUT1 = document.getElementById("grams1");
const INPUT2 = document.getElementById("grams2");
const INPUT3 = document.getElementById("grams3");
const CLOSE_BTN = document.getElementById("close");
const MODAL = document.querySelector(".modal");

const carbSelect = async () => {
	try {
		const res = await axios.get(APIURL + "carbsOptions");

		//Add each carbsOption to the 3 selects
		for (const carb of res.data) {
			for (let i = 1; i <= 3; i++) {
				const NEW_OPTION = document.createElement("option");
				NEW_OPTION.textContent = carb.name;
				NEW_OPTION.value = carb.name;
				document.getElementById(`carb${i}`).append(NEW_OPTION);
			}
		}
	} catch (err) {
		console.log(err);
	}
};

carbSelect();

NEXT_LINK.addEventListener("click", async () => {
	if (
		document.carb1.checkValidity() &&
		document.carb2.checkValidity() &&
		document.carb3.checkValidity()
	) {
		NEXT_LINK.href = "./new-step2.html";
		try {
			const uncompleteMeal = {
				carbsTypes: [
					{
						carb: SELECT1.value,
						grams: INPUT1.value,
					},
					{
						carb: SELECT2.value,
						grams: INPUT2.value,
					},
					{
						carb: SELECT3.value,
						grams: INPUT3.value,
					},
				],
			};
			const filteredCarbsTypes = uncompleteMeal.carbsTypes.filter(
				(carbType) => {
					return carbType.carb && carbType.grams;
				}
			);
			uncompleteMeal.carbsTypes = filteredCarbsTypes;
			await axios.post(APIURL + "meals", uncompleteMeal);
		} catch (err) {
			console.log(err);
		}
	} else {
		MODAL.classList.remove("hidden");
	}
});

CLOSE_BTN.addEventListener("click", () => {
	MODAL.classList.add("hidden");
});

window.addEventListener("click", (e) => {
	if (e.target === MODAL) {
		MODAL.classList.add("hidden");
	}
});
