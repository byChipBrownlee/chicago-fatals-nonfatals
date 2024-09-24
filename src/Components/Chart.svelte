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
    axisLeft,
    pointer,
    line as d3Line,
  } from "d3";

  // Set up variables
  let svgRef, gRef, width, tooltipRef, arrowRef, tooltipData, tooltipTarget;
  let data = [];

  // Mount and fetch data
  onMount(() => {
    fetchData();
  });

  // Fetching data
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

  $: {
    if (width && data.length > 0) {
      drawChart();
    }
  }

  // Drawing function
  function drawChart() {
    let key = "percent";

    // DOM refs
    const svg = select(svgRef);
    const g = select(gRef);
    g.selectAll("*").remove();

    // Dimensions etc
    const margin = {
      top: 10,
      bottom: width >= 600 ? 27 : 24.5,
      left: width >= 600 ? 32 : 28,
      right: 0,
    };
    const strokeWidth = width >= 600 ? 4 : 2.5;
    const pointRadius = width >= 600 ? 0 : 0;
    const innerWidth = width - margin.left - margin.right;
    const height = width >= 600 ? width / 2.5 : width / 2;
    const innerHeight = height - margin.top - margin.bottom;
    svg.attr("width", width).attr("height", height);
    g.attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales and scale data
    let xScale = scaleBand().range([0, innerWidth]);
    let yScale = scaleLinear().range([innerHeight, 0]);
    let filteredData = data.map((d) => ({
      ...d,
      nonfatal: d.total - d.fatal,
    }));
    const maxAnnualTotal = 20;
    xScale.domain(filteredData.map((d) => d.year));
    yScale.domain([10, maxAnnualTotal]);

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .tickValues(
            width > 600
              ? xScale.domain().filter((i) => i % 2 === 0)
              : xScale.domain().filter((i) => i % 2 === 0)
          )
          .tickSize(15)
      );
    xAxis.selectAll(".tick line").attr("display", "none");
    xAxis.select("path.domain").attr("display", "none");
    xAxis.selectAll(".tick text").attr("class", "label");

    // Y Axis
    const yAxis = g.append("g").call(
      axisLeft(yScale)
        .ticks(3)
        .tickSize(-innerWidth)
        .tickFormat((d) => d + "%")
    );
    yAxis
      .selectAll(".tick line")
      .attr("stroke-dasharray", "3")
      .attr("stroke-width", width <= 600 ? 0.5 : 1)
      .attr("stroke", "var(--charcoal20)");
    yAxis.selectAll(".tick text").attr("x", -10).style("text-anchor", "end");
    yAxis.selectAll(".tick text").attr("class", "label");
    yAxis.select("path.domain").attr("display", "none");

    // Line generator and drawing line
    const line = d3Line()
      .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
      .y((d) => yScale(d[key]));

    g.append("path")
      .datum(filteredData.filter((d) => d.year < 2024))
      .attr("fill", "none")
      .attr("stroke", "var(--blue100)")
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linecap", "round")
      .attr("d", line);

    g.append("path")
      .datum(filteredData.filter((d) => d.year >= 2023))
      .attr("fill", "none")
      .attr("stroke", "var(--blue100)")
      .attr("stroke-width", strokeWidth)
      .attr("stroke-dasharray", "2")
      .attr("opacity", "0.5")
      .attr("d", line);

    // Add in-chart value labels for context
    const firstPoint = filteredData[filteredData.length - 15];
    const lastPoint = filteredData[filteredData.length - 2];
    const yOffset = width < 600 ? 1.5 : 1.75;
    const yOffsetTop = width < 600 ? -0.6 : -1;
    const fontSize = width < 600 ? 9 : 12;

    g.append("text")
      .attr("x", xScale(lastPoint.year) + xScale.bandwidth() / 2)
      .attr("y", yScale(lastPoint[key]))
      .attr("dy", `${yOffsetTop}em`)
      .attr("class", "line-label")
      .attr("text-anchor", "middle")
      .text(`${lastPoint[key].toFixed(1)}%`)
      .style("font-size", `${fontSize}px`)
      .style("fill", "var(--blue100)");

    g.append("text")
      .attr("x", xScale(firstPoint.year) + xScale.bandwidth() / 2)
      .attr("y", yScale(firstPoint[key]))
      .attr("dy", `${yOffset}em`)
      .attr("class", "line-label")
      .attr("text-anchor", "middle")
      .text(`${firstPoint[key].toFixed(1)}%`)
      .style("font-size", `${fontSize}px`)
      .style("fill", "var(--blue100)");

    // Tooltip dot (hidden until tooltip engaged)
    g.selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", key)
      .attr("cx", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d[key]))
      .attr("r", pointRadius)
      .attr("fill", "var(--blue100)");

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

    // Functions to handle moseover and moseout
    function handleMouseout() {
      if (tooltipRef) tooltipRef.style.visibility = "hidden";
      if (arrowRef) arrowRef.style.visibility = "hidden";
      tooltipData = null;
      tooltipTarget = null;

      g.selectAll("circle")
        .attr("stroke", null)
        .attr("stroke-width", null)
        .attr("r", pointRadius);

      g.selectAll(".line-label").transition().duration(500).style("opacity", 1);
    }

    let pointsData = {};

    function handleMousemove(event) {
      const x0 = pointer(event, this)[0];
      const hoveredYear = xScale.domain().find((year) => {
        const start = xScale(year);
        const end = start + xScale.bandwidth();
        return x0 >= start && x0 < end;
      });

      if (!hoveredYear) return;

      pointsData = data.filter((d) => d.year === hoveredYear);

      if (pointsData.length === 0) return;

      g.selectAll("circle")
        .attr("stroke", null)
        .attr("stroke-width", null)
        .attr("r", pointRadius);

      g.selectAll(".line-label").style("opacity", 0); // Hides in-chart labels

      tooltipData = pointsData;

      pointsData.forEach((d) => {
        g.selectAll("circle")
          .filter((data) => data.year === d.year)
          .attr("r", pointRadius + 5);
      });

      // Positions the tooltip
      const closestPoint = pointsData[0];
      const pointElement = g
        .selectAll("circle")
        .filter((data) => data.year === closestPoint.year)
        .node();

      if (tooltipRef && pointElement) {
        computeTooltip({ target: pointElement }, tooltipRef, arrowRef);
      }
    }
  }
</script>

<Header
  hed={`Chicago’s Shootings Have Become Deadlier`}
  dek={`Since 2010, a greater percentage of Chicago’s shooting victims have died from gunfire.`}
/>

<div class="lethality-percent-chart" bind:clientWidth={width}>
  <svg bind:this={svgRef}>
    <g bind:this={gRef}></g>
  </svg>
  <Tooltip bind:tooltipRef bind:arrowRef {tooltipData} />
</div>

<div class="legend">
  <span class="legend-color"></span>
  <span class="legend-text"
    >Percentage of shooting victims that were killed</span
  >
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
  }

  .legend-text {
    color: var(--charcoal100);
  }

  .legend-color {
    border-radius: 2px;
    background-color: var(--blue100);
    width: 1em;
    height: 3px;
    display: inline-block;
    margin-right: 0.5em;
  }
</style>
