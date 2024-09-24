<script>
  import { onMount } from "svelte";
  import Header from "./Subcomponents/Header.svelte";
  import Footer from "./Subcomponents/Footer.svelte";
  import computeTooltip from "../Assets/computeTooltip";
  import Tooltip from "./Subcomponents/Tooltip.svelte";
  import {
    select,
    scaleBand,
    scaleLinear,
    axisBottom,
    max,
    axisLeft,
    pointer,
  } from "d3";

  let svgRef, gRef, width, tooltipRef, arrowRef, tooltipData, tooltipTarget;
  let data = [];

  onMount(() => {
    fetchData();
  });

  async function fetchData() {
    const url = "/chicago-lethality.json";
    const fullUrl =
      "https://chicago-lethality.netlify.app/chicago-lethality.json";
    try {
      const response = await fetch(fullUrl);
      const result = await response.json();

      if (Array.isArray(result)) {
        data = result;
        drawChart();
      } else {
        console.error("Fetched data is not an array:", result);
      }
    } catch (error) {
      try {
        const response = await fetch(url);
        const result = await response.json();

        if (Array.isArray(result)) {
          data = result;
          drawChart();
        } else {
          console.error("Fetched data is not an array:", result);
        }
      } catch {
        console.error("Error fetching data:", error);
      }
    }
  }

  $: if (width && data.length > 0) {
    drawChart();
  }

  function drawChart() {
    const svg = select(svgRef);
    const g = select(gRef);
    g.selectAll("*").remove();

    const margin = {
      top: 10,
      bottom: width >= 600 ? 27 : 24.5,
      left: width >= 600 ? 48 : 28,
      right: 0,
    };
    const innerWidth = width - margin.left - margin.right;
    const height = width / 2;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = scaleBand()
      .domain(data.map((d) => d.year))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.total)]) // Based on total shootings
      .range([innerHeight, 0]);

    // Add X axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(xScale).tickSize(5));

    xAxis.selectAll(".tick line").attr("opacity", 0);
    xAxis.select("path.domain").attr("display", "none");
    xAxis.selectAll(".tick text").attr("class", "label");

    // Add Y axis
    const yAxis = g
      .append("g")
      .call(axisLeft(yScale).ticks(5).tickSize(-innerWidth));

    yAxis
      .selectAll(".tick line")
      .attr("stroke-dasharray", "3")
      .attr("stroke-width", width <= 600 ? 0.5 : 1)
      .attr("stroke", "var(--charcoal20)");
    yAxis.selectAll(".tick text").attr("x", -10).style("text-anchor", "end");
    yAxis.selectAll(".tick text").attr("class", "label");
    yAxis.select("path.domain").attr("display", "none");

    // Add bars
    g.selectAll(".bar-fatal")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-fatal")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.fatal))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.fatal))
      .attr("fill", "var(--blue100)")
      .attr("opacity", (d) => (d.year <= 2023 ? 1 : 0.4));

    g.selectAll(".bar-nonfatal")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar-nonfatal")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(d.total))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.total - d.fatal))
      .attr("fill", "var(--blue50)")
      .attr("opacity", (d) => (d.year <= 2023 ? 1 : 0.5));

    g.append("g")
      .attr("class", "bottom-tick-group")
      .attr("transform", `translate(0,${innerHeight})`)
      .append(() => yAxis.select(".tick:first-of-type line").node())
      .attr("stroke-dasharray", "none")
      .attr("stroke-width", 1)
      .attr("stroke", "var(--charcoal100)");

    // Add interaction overlay
    g.append("rect")
      .attr("class", "overlay")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("cursor", "pointer")
      .style("fill", "none")
      .style("pointer-events", "all");

    g.select(".overlay")
      .on("mouseover", handleMousemove)
      .on("mousemove", handleMousemove)
      .on("mouseout", handleMouseout);

    function handleMouseout() {
      if (tooltipRef) tooltipRef.style.visibility = "hidden";
      if (arrowRef) arrowRef.style.visibility = "hidden";
      tooltipData = null;
      tooltipTarget = null;
    }

    function handleMousemove(event) {
      const x0 = pointer(event, this)[0];
      const hoveredYear = xScale.domain().find((year) => {
        const start = xScale(year);
        const end = start + xScale.bandwidth();
        return x0 >= start && x0 < end;
      });

      if (!hoveredYear) return;

      const pointsData = data.filter((d) => d.year === hoveredYear);

      if (pointsData.length === 0) return;

      tooltipData = pointsData;

      // Position the tooltip
      if (tooltipRef) {
        const closestRec = pointsData[0];
        const pointElement = g
          .selectAll(".bar-nonfatal")
          .filter((d) => d.year === closestRec.year)
          .node();
        if (pointElement) {
          computeTooltip({ target: pointElement }, tooltipRef, arrowRef);
        }
      }
    }
  }
</script>

<Header
  hed={`Work in progress option`}
  dek={`A comparison of fatal and non-fatal shooting victims in Chicago since 2010.`}
/>

<div class="victims-chart" bind:clientWidth={width}>
  <svg bind:this={svgRef}>
    <g bind:this={gRef}></g>
  </svg>
  <Tooltip bind:tooltipRef bind:arrowRef victims {tooltipData} />
</div>

<div class="legend">
  <div class="legend-item">
    <span class="legend-color fatal"></span>
    <span class="legend-text">Shooting victims killed</span>
  </div>
  <div class="legend-item">
    <span class="legend-color nonfatal"></span>
    <span class="legend-text">Shooting victims injured</span>
  </div>
</div>

<Footer
  link="https://www.chicago.gov/city/en/sites/vrd/home/violence-victimization.html"
  source={"City of Chicago"}
  notes="Data for 2024 is partial and includes the months January through August."
/>

<style>
  .legend {
    font-size: 0.75em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1em;
  }

  .legend-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .legend-color.fatal {
    background-color: var(--blue100);
    width: 1em;
    height: 1em;
    display: inline-block;
    margin-right: 5px;
  }

  .legend-color.nonfatal {
    background-color: var(--blue50);
    width: 1em;
    height: 1em;
    display: inline-block;
    margin-right: 5px;
  }
</style>
