// plot the actual graph
plotGraph()

// plot the red trend
d3.select("#redTrend").on("change", function() {
    if (this.checked == true) {
      d3.select("svg").remove()
      console.log(this.checked)
      addRedTrend()
    }
  });

// plot the blue trend
d3.select("#blueTrend").on("change", function() {
    if (this.checked == true) {
      d3.select("svg").remove()
      console.log(this.checked)
      addBlueTrend()
    }
  });

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 


// load data
function plotGraph() {

    var margin = {top: 20, right: 20, bottom: 30, left: 300},
    width = 1220 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // setup x 
    var xValue = function(d) { return d.Employment / 1000000;}, // data -> value, in millions
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d["Export (in millions)"] / 10000;}, // data -> value, in 10 billions $
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // define actual line 
    var actualLine = d3.svg.line()
        .x(function(d) { return xScale(d.Employment / 1000000); })
        .y(function(d) { return yScale(d["Export (in millions)"] / 10000); });

    // setup fill color
    var cValue = function(d) { return d.Year;},
        color = d3.scale.linear()
                .domain([1997, 1998, 1999, 2000, 2001, 2002,
                         2003, 2004, 2005, 2006, 2007, 2008, 
                         2009, 2010, 2011, 2012, 2013, 2014])
                .range(["#ffe6e6", "#ffb3b3", "#ff8080", "#ff4d4d", "#ff1a1a", "#000000",  
                        "#e6f2ff", "#b3d9ff", "#80bfff", "#4da6ff", "#1a8cff", "#0073e6", "#A52A2A",
                        "#ecf9ec", "#b3e6b3", "#79d279", "#40bf40", "#2d862d"]);

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    d3.csv("../datasets/food.csv", function(error, data) {

      // change string (from CSV) into number format
      data.forEach(function(d) {
        d.Employment = +d.Employment;
        d["Export (in millions)"] = +d["Export (in millions)"];
      });

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // x-axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Employment (in millions)");

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Export Amount (in 10 billion $)");

      // draw dots on real line
      svg.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 8)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + "<br/>" + "Employment (in millions): " + xValue(d) 
              + "<br/>" + "Export (in billions $): " + yValue(d) * 10)
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "3px")
                   .style("height", "50px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

    // add the actual line
      svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", actualLine(data))
        .style("stroke", "grey")
        .style("stroke-width", "3px")
        .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("This line is based on actual data,"+ "<br>" + "that includes the two financial crisis.")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "2px")
                   .style("height", "40px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})
    });
}

function addRedTrend() {
    
    var margin = {top: 20, right: 20, bottom: 30, left: 300},
    width = 1220 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    // setup x 
    var xValue = function(d) { return d.Employment / 1000000;}, // data -> value, in millions
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d["Export (in millions)"] / 10000;}, // data -> value, in 10 billions $
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // define red line 
    var line = d3.svg.line()
        .x(function(d) { return xScale(d.HypotheticalEmploymentRed / 1000000); })
        .y(function(d) { return yScale(d.HypotheticalExportRed / 10000); });

    // define actual line 
    var actualLine = d3.svg.line()
        .x(function(d) { return xScale(d.Employment / 1000000); })
        .y(function(d) { return yScale(d["Export (in millions)"] / 10000); });

    // setup fill color
    var cValue = function(d) { return d.Year;},
        color = d3.scale.linear()
                .domain([1997, 1998, 1999, 2000, 2001, 2002,
                         2003, 2004, 2005, 2006, 2007, 2008, 
                         2009, 2010, 2011, 2012, 2013, 2014])
                .range(["#ffe6e6", "#ffb3b3", "#ff8080", "#ff4d4d", "#ff1a1a", "#000000",  
                        "#e6f2ff", "#b3d9ff", "#80bfff", "#4da6ff", "#1a8cff", "#0073e6", "#A52A2A",
                        "#ecf9ec", "#b3e6b3", "#79d279", "#40bf40", "#2d862d"]);

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
      // load data
    d3.csv("../datasets/food.csv", function(error, data) {

      // change string (from CSV) into number format
      data.forEach(function(d) {
        d.Employment = +d.Employment;
        d["Export (in millions)"] = +d["Export (in millions)"];
        d.HypotheticalEmploymentRed = +d.HypotheticalEmploymentRed;
        d.HypotheticalExportRed = +d.HypotheticalExportRed;
      });

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // x-axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Employment (in millions)");

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Export Amount (in 10 billion $)");

      // draw dots on real line
      svg.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 8)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + "<br/>" + "Employment (in millions): " + xValue(d) 
              + "<br/>" + "Export (in billions $): " + yValue(d) * 10)
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "3px")
                   .style("height", "50px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

    // add the red line 
      svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", line(data))
        .style("stroke", "red")
        .style("stroke-width", "3px")
        .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Projection of the data if dot-com crash " + "<br>" + "didn't happened, based on data from 1997 to 2001")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "3px")
                   .style("height", "40px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw dots on the red line 
      svg.selectAll(".point")
          .data(data)
        .enter().append("circle")
          .attr("class", "point")
          .attr("r", 5)
          .attr("cx", function(d) { return xScale(d.HypotheticalEmploymentRed / 1000000); })
          .attr("cy", function(d) { return yScale(d.HypotheticalExportRed / 10000); }) 
          .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + "<br/>" + "Employment (in millions): " + d["HypotheticalEmploymentRed"]
              + "<br/>" + "Export (in billions $): " + d["HypotheticalExportRed"] * 10)
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "2px")
                   .style("height", "50px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

    // add the actual line
      svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", actualLine(data))
        .style("stroke", "grey")
        .style("stroke-width", "3px")
        .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("This line is based on actual data,"+ "<br>" + "that includes the two financial crisis.")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "2px")
                   .style("height", "40px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})
    });
}

function addBlueTrend() {
    
    var margin = {top: 20, right: 20, bottom: 30, left: 300},
    width = 1220 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    // setup x 
    var xValue = function(d) { return d.Employment / 1000000;}, // data -> value, in millions
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d["Export (in millions)"] / 10000;}, // data -> value, in 10 billions $
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");
    
    // define red line 
    var line = d3.svg.line()
        .x(function(d) { return xScale(d.HypotheticalEmploymentRed / 1000000); })
        .y(function(d) { return yScale(d.HypotheticalExportRed / 10000); });

    // define blue line 
    var blueLine = d3.svg.line()
        .x(function(d) { return xScale(d.HypotheticalEmploymentBlue/ 1000000); })
        .y(function(d) { return yScale(d.HypotheticalExportBlue / 10000); });

    // define actual line 
    var actualLine = d3.svg.line()
        .x(function(d) { return xScale(d.Employment / 1000000); })
        .y(function(d) { return yScale(d["Export (in millions)"] / 10000); });

    // setup fill color
    var cValue = function(d) { return d.Year;},
        color = d3.scale.linear()
                .domain([1997, 1998, 1999, 2000, 2001, 2002,
                         2003, 2004, 2005, 2006, 2007, 2008, 
                         2009, 2010, 2011, 2012, 2013, 2014])
                .range(["#ffe6e6", "#ffb3b3", "#ff8080", "#ff4d4d", "#ff1a1a", "#000000",  
                        "#e6f2ff", "#b3d9ff", "#80bfff", "#4da6ff", "#1a8cff", "#0073e6", "#A52A2A",
                        "#ecf9ec", "#b3e6b3", "#79d279", "#40bf40", "#2d862d"]);

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // load data
    d3.csv("../datasets/food.csv", function(error, data) {

      // change string (from CSV) into number format
      data.forEach(function(d) {
        d.Employment = +d.Employment;
        d["Export (in millions)"] = +d["Export (in millions)"];
        d.HypotheticalEmploymentRed = +d.HypotheticalEmploymentRed;
        d.HypotheticalExportRed = +d.HypotheticalExportRed;
        d.HypotheticalEmploymentBlue = +d.HypotheticalEmploymentBlue;
        d.HypotheticalExportBlue = +d.HypotheticalExportBlue;
      });

      // don't want dots overlapping axis, so add in buffer to data domain
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // x-axis
      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", -6)
          .style("text-anchor", "end")
          .text("Employment (in millions)");

      // y-axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Export Amount (in 10 billion $)");

      // draw dots on real line
      svg.selectAll(".dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 8)
          .attr("cx", xMap)
          .attr("cy", yMap)
          .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + "<br/>" + "Employment (in millions): " + xValue(d) 
              + "<br/>" + "Export (in billions $): " + yValue(d) * 10)
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "3px")
                   .style("height", "50px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // add the red line 
      svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", line(data))
        .style("stroke", "red")
        .style("stroke-width", "3px")
        .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Projection of the data if dot-com crash " + "<br>" + "didn't happened, based on data from 1997 to 2001")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "3px")
                   .style("height", "40px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw dots on the red line 
      svg.selectAll(".point")
          .data(data)
        .enter().append("circle")
          .attr("class", "point")
          .attr("r", 5)
          .attr("cx", function(d) { return xScale(d.HypotheticalEmploymentRed / 1000000); })
          .attr("cy", function(d) { return yScale(d.HypotheticalExportRed / 10000); }) 
          .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + "<br/>" + "Employment (in millions): " + d["HypotheticalEmploymentRed"]
              + "<br/>" + "Export (in billions $): " + d["HypotheticalExportRed"] * 10)
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "2px")
                   .style("height", "50px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          })

    // add the blue line 
      svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", blueLine(data))
        .style("stroke", "blue")
        .style("stroke-width", "3px")
        .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Projection of the data if housing market crash " + "<br>" + "didn't happened, based on data from 2003 to 2008")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "3px")
                   .style("height", "40px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw dots on the blue line 
      svg.selectAll(".point")
          .data(data)
        .enter().append("circle")
          .attr("class", "point")
          .attr("r", 5)
          .attr("cx", function(d) { return xScale(d.HypotheticalEmploymentBlue / 1000000); })
          .attr("cy", function(d) { return yScale(d.HypotheticalExportBlue / 10000); }) 
          .style("fill", function(d) { return color(cValue(d));}) 
          .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("Year: " + d["Year"] + "<br/>" + "Employment (in millions): " + d["HypotheticalEmploymentBlue"]
              + "<br/>" + "Export (in billions $): " + d["HypotheticalExportBlue"] * 10)
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "2px")
                   .style("height", "150px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      
    // add the actual line
      svg.append("path")
        .data(data)
        .attr("class", "line")
        .attr("d", actualLine(data))
        .style("stroke", "grey")
        .style("stroke-width", "3px")
        .on("mouseover", function(d) {
              tooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              tooltip.html("This line is based on actual data,"+ "<br>" + "that includes the two financial crisis.")
                   .style("left", (d3.event.pageX + 5) + "px")
                   .style("top", (d3.event.pageY - 28) + "px")
                   .style("text-align", "center")
                   .style("background", "lightblue")
                   .style("border-radius", "2px")
                   .style("height", "40px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
          });

      // draw legend
      var legend = svg.selectAll(".legend")
          .data(color.domain())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      // draw legend colored rectangles
      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      // draw legend text
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d;})
    });
}
