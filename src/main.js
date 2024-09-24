import "./app.scss";
import Chart from "./Components/Chart.svelte";
import Victims from "./Components/Victims.svelte";

(async () => {
  try {
    new Chart({
      target: document.getElementById("chart"),
    });
    new Victims({
      target: document.getElementById("victims"),
    });
  } catch (error) {
    console.error("Error in chart insertion:", error);
  }
})();
