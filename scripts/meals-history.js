const APIURL = "http://localhost:3000/";
const LAST_MEAL_DIV = document.querySelector(".unfinished");
const MAIN_CONTAINER = document.querySelector(".main-container");
const SELECT1 = document.getElementById("meal-category");
const SELECT2 = document.getElementById("carb");
const SELECT3 = document.getElementById("carbs-range");
const CHECKBOX1 = document.getElementById("only-first-meals");
const CHECKBOX2 = document.getElementById("include-first-meals");
const CHECKBOX3 = document.getElementById("exclude-physical-activity-meals");

const getMeals = async () => {
	try {
		const meals = await axios.get(APIURL + "meals");
		return meals.data;
	} catch (err) {
		console.log(err);
	}
};

const createMealCards = (array) => {
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
		MAIN_CONTAINER.prepend(MEAL_DIV);
	});
};

const createUnfinishedMealCards = (array) => {
	array.forEach((meal) => {
		const MEAL_DIV = document.createElement("div");
		MEAL_DIV.classList.add("unfinished");
		const H3 = document.createElement("h3");
		H3.textContent = meal.carbsTypes.map((item) => item.carb).join(" & ");
		const FORM = document.createElement("form");
		FORM.name = "lastData";
		FORM.autocomplete = "off";
		const SUGAR_DIV = document.createElement("div");
		SUGAR_DIV.classList.add("post-meal-sugar");
		const SUGAR_P = document.createElement("p");
		SUGAR_P.textContent = "Post-meal blood sugar";
		const SUGAR_INPUT = document.createElement("input");
		SUGAR_INPUT.type = "text";
		SUGAR_INPUT.name = "postMealSugar";
		SUGAR_INPUT.id = meal.id;
		const SUGAR_LABEL = document.createElement("label");
		SUGAR_LABEL.for = "postMealSugar";
		SUGAR_LABEL.textContent = "mg/dL";
		const SPORT_DIV = document.createElement("div");
		SPORT_DIV.classList.add("physical-activity2");
		const SPORT_INPUT = document.createElement("input");
		SPORT_INPUT.type = "checkbox";
		SPORT_INPUT.name = "physicalActivity2";
		SPORT_INPUT.id = meal.id + "/sport";
		const SPORT_LABEL = document.createElement("label");
		SPORT_LABEL.for = "physicalActivity2";
		SPORT_LABEL.textContent = "Physical activity";
		const CHECK_IMG = document.createElement("img");
		CHECK_IMG.src = "../images/checked.png";
		CHECK_IMG.class = "checked";
		CHECK_IMG.alt = "check meal button";

		MAIN_CONTAINER.prepend(MEAL_DIV);
		MEAL_DIV.append(H3, FORM);
		FORM.append(SUGAR_DIV, SPORT_DIV, CHECK_IMG);
		SUGAR_DIV.append(SUGAR_P, SUGAR_INPUT, SUGAR_LABEL);
		SPORT_DIV.append(SPORT_INPUT, SPORT_LABEL);

		CHECK_IMG.addEventListener("click", async () => {
			try {
				const lastData = {
					postMealBloodSugar: document.getElementById(meal.id).value,
					postMealPhysicalActivity: document.getElementById(meal.id + "/sport")
						.checked,
				};
				await axios.patch(APIURL + "meals/" + meal.id, lastData);
			} catch (err) {
				console.log(err);
			}
		});
	});
};

const showMeals = async () => {
	try {
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		createMealCards(filteredMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
};

showMeals();

const selectOptions = async () => {
	try {
		const options = await axios.get(APIURL + "carbsOptions");
		options.data.forEach((carb) => {
			const SELECT_OPTION = document.createElement("option");
			SELECT_OPTION.textContent = carb.name;
			SELECT_OPTION.value = carb.name;
			SELECT2.append(SELECT_OPTION);
		});
	} catch (err) {
		console.log(err);
	}
};

selectOptions();

SELECT1.addEventListener("change", async () => {
	try {
		SELECT2.value = "all";
		SELECT3.value = "all";
		CHECKBOX1.checked = false;
		CHECKBOX2.checked = false;
		CHECKBOX3.checked = false;
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		let finalMeals;
		const selectedCategory = SELECT1.value;
		switch (selectedCategory) {
			case "most-recent":
				finalMeals = filteredMeals;
				break;
			case "right-units":
				finalMeals = filteredMeals.filter((meal) => {
					return (
						Math.abs(meal.postMealBloodSugar - meal.preMealBloodSugar) < 20
					);
				});
				break;
			case "too-many":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.postMealBloodSugar - meal.preMealBloodSugar < -20;
				});
				break;
			case "too-few":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.postMealBloodSugar - meal.preMealBloodSugar > 20;
				});
				break;
			default:
				alert("Wut");
		}
		createMealCards(finalMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
});

SELECT2.addEventListener("change", async () => {
	try {
		SELECT1.value = "most-recent";
		SELECT3.value = "all";
		CHECKBOX1.checked = false;
		CHECKBOX2.checked = false;
		CHECKBOX3.checked = false;
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		let finalMeals;
		if (SELECT2.value === "all") {
			finalMeals = filteredMeals;
		} else {
			finalMeals = filteredMeals.filter((meal) => {
				return meal.carbsTypes.some((carbType) => {
					return carbType.carb === SELECT2.value;
				});
			});
		}
		createMealCards(finalMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
});

SELECT3.addEventListener("change", async () => {
	try {
		SELECT1.value = "most-recent";
		SELECT2.value = "all";
		CHECKBOX1.checked = false;
		CHECKBOX2.checked = false;
		CHECKBOX3.checked = false;
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		let finalMeals;
		switch (SELECT3.value) {
			case "all":
				finalMeals = filteredMeals;
				break;
			case "0-20":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.carbsWeight > 0 && meal.carbsWeight <= 20;
				});
				break;
			case "21-40":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.carbsWeight > 20 && meal.carbsWeight <= 40;
				});
				break;
			case "41-60":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.carbsWeight > 40 && meal.carbsWeight <= 60;
				});
				break;
			case "61-80":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.carbsWeight > 60 && meal.carbsWeight <= 80;
				});
				break;
			case "more":
				finalMeals = filteredMeals.filter((meal) => {
					return meal.carbsWeight > 80;
				});
				break;
			default:
				console.log(wut);
		}
		createMealCards(finalMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
});

CHECKBOX1.addEventListener("change", async () => {
	try {
		SELECT1.value = "most-recent";
		SELECT2.value = "all";
		SELECT3.value = "all";
		CHECKBOX2.checked = false;
		CHECKBOX3.checked = false;
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		let finalMeals;

		if (CHECKBOX1.checked) {
			finalMeals = filteredMeals.filter((meal) => {
				return meal.firstMeal;
			});
		} else {
			finalMeals = filteredMeals;
		}
		createMealCards(finalMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
});

CHECKBOX2.addEventListener("change", async () => {
	try {
		SELECT1.value = "most-recent";
		SELECT2.value = "all";
		SELECT3.value = "all";
		CHECKBOX1.checked = false;
		CHECKBOX3.checked = false;
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		let finalMeals;

		if (CHECKBOX2.checked) {
			finalMeals = filteredMeals.filter((meal) => {
				return !meal.firstMeal;
			});
		} else {
			finalMeals = filteredMeals;
		}
		createMealCards(finalMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
});

CHECKBOX3.addEventListener("change", async () => {
	try {
		SELECT1.value = "most-recent";
		SELECT2.value = "all";
		SELECT3.value = "all";
		CHECKBOX1.checked = false;
		CHECKBOX2.checked = false;
		MAIN_CONTAINER.innerHTML = "";
		const allMeals = await getMeals();
		const filteredMeals = allMeals.filter((meal) => {
			return meal.postMealBloodSugar;
		});

		let finalMeals;

		if (CHECKBOX3.checked) {
			finalMeals = filteredMeals.filter((meal) => {
				return !meal.preMealPhysicalActivity && !meal.postMealPhysicalActivity;
			});
		} else {
			finalMeals = filteredMeals;
		}
		createMealCards(finalMeals);
		if (allMeals.length > filteredMeals.length) {
			const unfinishedMeals = allMeals.filter((meal) => {
				return !meal.postMealBloodSugar;
			});
			createUnfinishedMealCards(unfinishedMeals);
		}
	} catch (err) {
		console.log(err);
	}
});
