// D3 Challenge
// Placement, Margin & Spacing
var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 3.9;
var margin = 20;
var labelArea = 110;
var tPadBot = 40;
var tPadLeft = 40;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Assign radius to each circle
var circRadius;
function crGet() {
  if (width <= 530) {
    circRadius = 5;
  }
  else {
    circRadius = 10;
  }
}
crGet();

////////// Axes Labels //////////
// X Axis // 
// Use group element called xText to nest our bottom axes labels.
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xTextRefresh();

// Poverty //
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

// Y Axis // 
// Specify variables to make transform attributes more readable
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Use group element called xText to nest our bottom axes labels.
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yTextRefresh();

// Lacks Healthcare // 
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");

/////////// Import the csv file ///////////
d3.csv("data.csv").then(function(data) {
  visualize(data);
});

//Create function to vizualize the data
function visualize(censusData) {
  // Designate the values for curX & curY
  var curX = "poverty";
  var curY = "healthcare";

  //Create variables for min and max values
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Function to setup Tooltip rules
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function(d) {
      // Include state abbreviations in the circles
      var theState = "<div>" + d.state + "</div>";
      // Display the "lacks healthcare %" value
      var theY = "<div>" + curY + ": " + d[curY] + "%</div>";
      // Display the "In Poverty %" value
      var theX = "<div>" + curX + ": " + d[curX] + "%</div>";
      // Display everything above
      return theState + theX + theY;
    });
  // Call the toolTip function.
  svg.call(toolTip);

  ////////// Change the min and max for X axis //////////
  function xMinMax() {
    // min to grab the slammest value from dataset in column
    xMin = d3.min(censusData, function(d) {
      return parseFloat(d[curX]) * 0.90;
    });

    // max to grab the largest value from dataset in column
    xMax = d3.max(censusData, function(d) {
      return parseFloat(d[curX]) * 1.10;
    });
  }

  ////////// Change the min and max for Y axis //////////
  function yMinMax() {
    // min to grab the slammest value from dataset in column
    yMin = d3.min(censusData, function(d) {
      return parseFloat(d[curY]) * 0.90;
    });

    // max to grab the largest value from dataset in column
    yMax = d3.max(censusData, function(d) {
      return parseFloat(d[curY]) * 1.10;
    });
  }

  ////////// Create the Scatter Plot //////////

  // Start with min and max values to create values on axis scales
  xMinMax();
  yMinMax();

// Create our scales
  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // inverse height
    .range([height - margin - labelArea, margin]);

  // Pass scales into axis methods to create axes.
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Determine x and y tick counts.
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // We append the axes in group elements. By calling them, we include
  // all of the numbers, borders and ticks.
  // The transform attribute specifies where to place the axes.
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // Now let's make a grouping for our dots and their labels.
  var theCircles = svg.selectAll("g theCircles").data(censusData).enter();

  // We append the circles for each state
  theCircles
    .append("circle")
    // These attr's specify location, size and class.
    .attr("cx", function(d) {
      return xScale(d[curX]);
    })
    .attr("cy", function(d) {
      return yScale(d[curY]);
    })
    .attr("r", circRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // Hover rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      // Highlight the state circle's border
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke", "#e3e3e3");
    });

  // Append text to our circles
  theCircles
    .append("text")
    // Return abbr to .text, which returns the state's abbreviation
    .text(function(d) {
      return d.abbr;})
    // Place text using scale
    .attr("dx", function(d) {
      return xScale(d[curX]);})
    .attr("dy", function(d) {
      return yScale(d[curY]) + circRadius / 2.5;})
    .attr("font-size", circRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });
}
