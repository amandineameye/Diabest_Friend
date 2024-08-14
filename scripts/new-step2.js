const APIURL = "http://localhost:3000/";
const THUMB_LINK = document.getElementById("thumb");
const TBODY = document.querySelector("tbody");
const TFOOT = document.querySelector("tfoot");
const FINAL_BOLUS = document.querySelector(".final-bolus div");
const MODAL = document.querySelector(".modal");
const CLOSE_BTN = document.getElementById("close");
const CARDS_DIV = document.querySelector(".carbs-cards");

let totalCarbsGrams = 0;
let mealBolus;
let correctionBolus;
let lastMealCarbsWeight;

console.log("1U = 5g in the morning");
console.log("1U = 6g the rest of the day");
console.log("Correction: 1U = 50 mg/dL");

const getMeals = async () => {
	try {
		const meals = await axios.get(APIURL + "meals");
		return meals.data;
	} catch (err) {
		console.log(err);
	}
};

const getCarbsOptions = async () => {
	try {
		const carbsOptions = await axios.get(APIURL + "carbsOptions");
		return carbsOptions.data;
	} catch (err) {
		console.log(err);
	}
};

const getLastMeal = async () => {
	try {
		const meals = await getMeals();
		return meals[meals.length - 1];
	} catch (err) {
		console.log(err);
	}
};

const fillInCarbsTable = async () => {
	try {
		const lastMeal = await getLastMeal();
		const carbsList = await getCarbsOptions();

		TBODY.innerHTML = "";
		TFOOT.innerHTML = "";

		lastMeal.carbsTypes.forEach(async (chosenCarb) => {
			const LINE = document.createElement("tr");
			const CARB_NAME = document.createElement("td");
			CARB_NAME.textContent = chosenCarb.carb;
			const TOTAL_WEIGHT = document.createElement("td");
			TOTAL_WEIGHT.textContent = chosenCarb.grams;

			const correspondingOption = carbsList.find((listedCarb) => {
				return listedCarb.name === chosenCarb.carb;
			});

			const PERCENTAGE = document.createElement("td");
			PERCENTAGE.textContent = correspondingOption.percentage;
			const CARBS_AMOUNT = document.createElement("td");
			lastMealCarbsWeight = parseFloat(
				(
					parseInt(chosenCarb.grams) *
					parseFloat(correspondingOption.percentage)
				).toFixed(2)
			);
			CARBS_AMOUNT.textContent = lastMealCarbsWeight;
			LINE.append(CARB_NAME, CARBS_AMOUNT, TOTAL_WEIGHT, PERCENTAGE);
			TBODY.append(LINE);
		});

		const TOTAL_LINE = document.createElement("tr");
		const TOTAL_TITLE = document.createElement("td");
		TOTAL_TITLE.textContent = "Total carbs";
		const TOTAL_DATA = document.createElement("td");
		lastMeal.carbsTypes.forEach((chosenCarb) => {
			const percentage = carbsList.find(
				(listedCarb) => listedCarb.name === chosenCarb.carb
			).percentage;
			const grams = percentage * chosenCarb.grams;
			totalCarbsGrams += parseFloat(grams.toFixed(2));
		});
		TOTAL_DATA.textContent = totalCarbsGrams + " g";
		TOTAL_LINE.append(TOTAL_TITLE, TOTAL_DATA);
		TFOOT.append(TOTAL_LINE);
	} catch (err) {
		console.log(err);
	}
};

fillInCarbsTable();

THUMB_LINK.addEventListener("click", async () => {
	if (document.bolusTable.checkValidity()) {
		THUMB_LINK.href = "./index.html";
		try {
			const mealBolusInfo = {
				carbsWeight: totalCarbsGrams,
				preMealBloodSugar: document.bolusTable.bloodSugar.value,
				bolus:
					parseInt(document.bolusTable.mealUnits.value) +
					parseInt(document.bolusTable.correctionUnits.value),
				firstMeal: document.bolusTable.firstMeal.checked,
				preMealPhysicalActivity: document.bolusTable.physicalActivity.checked,
			};
			const lastMeal = await getLastMeal();
			await axios.patch(APIURL + "meals/" + lastMeal.id, mealBolusInfo);
		} catch (err) {
			console.log(err);
		}
	} else {
		MODAL.classList.remove("hidden");
	}
});

document.bolusTable.mealUnits.addEventListener("keyup", () => {
	mealBolus =
		document.bolusTable.mealUnits.value !== ""
			? parseInt(document.bolusTable.mealUnits.value)
			: 0;
	correctionBolus =
		document.bolusTable.correctionUnits.value !== ""
			? parseInt(document.bolusTable.correctionUnits.value)
			: 0;
	FINAL_BOLUS.textContent = mealBolus + correctionBolus;
});

document.bolusTable.correctionUnits.addEventListener("keyup", () => {
	mealBolus =
		document.bolusTable.mealUnits.value !== ""
			? parseInt(document.bolusTable.mealUnits.value)
			: 0;
	correctionBolus =
		document.bolusTable.correctionUnits.value !== ""
			? parseInt(document.bolusTable.correctionUnits.value)
			: 0;
	FINAL_BOLUS.textContent = mealBolus + correctionBolus;
});

CLOSE_BTN.addEventListener("click", () => {
	MODAL.classList.add("hidden");
});

window.addEventListener("click", (e) => {
	if (e.target === MODAL) {
		MODAL.classList.add("hidden");
	}
});

const filterItemsByCarbType = (items, selectedItem) => {
	// Extract the carb types from the selected item
	const selectedCarbTypes = selectedItem.carbsTypes.map((carb) => carb.carb);
	//[{"carb": "potatoes", "grams": 200}, {"carb": "ratatouille", "grams": 100}]
	//["potatoes", "ratatouille"]

	// Filter the items
	return items.filter(
		(item) =>
			item.carbsTypes.some((carbType) =>
				selectedCarbTypes.includes(carbType.carb)
			) && item.postMealBloodSugar
	);
};

const findSimilarMeals = async () => {
	try {
		const lastMeal = await getLastMeal();
		const allMeals = await getMeals();
		const filteredMeals = filterItemsByCarbType(allMeals, lastMeal);
		const sortedFilteredMeals = filteredMeals.sort(
			(a, b) =>
				Math.abs(b.carbsWeight - lastMealCarbsWeight) -
				Math.abs(a.carbsWeight - lastMealCarbsWeight)
		);
		const topMeals = sortedFilteredMeals.slice(0, 3);
		return topMeals;
	} catch (err) {
		console.log(err);
	}
};

const createCards = async (array) => {
	CARDS_DIV.innerHTML = "";
	array.forEach((meal) => {
		const MEAL_DIV = document.createElement("div");
		MEAL_DIV.classList.add("card");

		const MEAL_TITLE = document.createElement("h3");
		MEAL_TITLE.textContent = meal.carbsTypes
			.map((item) => item.carb)
			.join(" & ");

		const SPORT_IMG = document.createElement("img");
		const MORNING_IMG = document.createElement("img");
		SPORT_IMG.src = "../images/sport.png";
		MORNING_IMG.src = "../images/morning.png";
		SPORT_IMG.classList.add("sport");
		MORNING_IMG.classList.add("morning");

		if (!meal.firstMeal) {
			MORNING_IMG.style.display = "none";
		}

		if (!meal.preMealPhysicalActivity && !meal.postMealPhysicalActivity) {
			SPORT_IMG.style.display = "none";
		}

		const CARBS_DIV = document.createElement("div");
		CARBS_DIV.classList.add("carbs-div");
		const REST_DIV = document.createElement("div");
		REST_DIV.classList.add("rest-div");

		meal.carbsTypes.forEach((carb) => {
			const CARB_DIV = document.createElement("div");
			CARB_DIV.classList.add("card-data");
			const CARB_P = document.createElement("p");
			CARB_P.textContent = carb.carb;
			const GRAMS_P = document.createElement("p");
			GRAMS_P.textContent = carb.grams;
			CARB_DIV.append(CARB_P, GRAMS_P);
			CARBS_DIV.append(CARB_DIV);
		});

		if (meal.carbsTypes.length > 2) {
			MEAL_TITLE.style.fontSize = "0.8rem";
		}
		const BOLUS_DIV = document.createElement("div");
		BOLUS_DIV.classList.add("card-data");
		const BOLUS_TITLE = document.createElement("p");
		BOLUS_TITLE.textContent = "Bolus";
		const BOLUS_DATA = document.createElement("p");
		BOLUS_DATA.textContent = meal.bolus;
		BOLUS_DIV.append(BOLUS_TITLE, BOLUS_DATA);

		const SUGAR_CHANGE_DIV = document.createElement("div");
		SUGAR_CHANGE_DIV.classList.add("card-data");
		const SUGAR_CHANGE_TITLE = document.createElement("p");
		SUGAR_CHANGE_TITLE.textContent = "Sugar change";
		const SUGAR_CHANGE_DATA = document.createElement("p");
		SUGAR_CHANGE_DATA.textContent =
			parseInt(meal.postMealBloodSugar) - parseInt(meal.preMealBloodSugar);
		SUGAR_CHANGE_DIV.append(SUGAR_CHANGE_TITLE, SUGAR_CHANGE_DATA);

		const TOTAL_CARBS_DIV = document.createElement("div");
		TOTAL_CARBS_DIV.classList.add("card-data");
		const TOTAL_CARBS_TITLE = document.createElement("p");
		TOTAL_CARBS_TITLE.textContent = "Carbs";
		const TOTAL_CARBS_DATA = document.createElement("p");
		TOTAL_CARBS_DATA.textContent = meal.carbsWeight;
		TOTAL_CARBS_DIV.append(TOTAL_CARBS_TITLE, TOTAL_CARBS_DATA);

		MEAL_DIV.append(MEAL_TITLE, SPORT_IMG, MORNING_IMG, CARBS_DIV, REST_DIV);
		REST_DIV.append(BOLUS_DIV, SUGAR_CHANGE_DIV, TOTAL_CARBS_DIV);
		CARDS_DIV.append(MEAL_DIV);
	});
};

const createCardsWithTopMeals = async () => {
	const topMeals = await findSimilarMeals();
	createCards(topMeals);
};

createCardsWithTopMeals();
