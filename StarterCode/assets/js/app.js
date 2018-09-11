// Define SVG - D
var width = parseInt(d3.select('#scatter').style("width"))*1;

// Graph Height
var height = width - width/3;

// Overall margin
var margin = 20;

// space for placing words
var labelArea = 110;

//  Text Padding
var padding = 45;

// create canvas for the graph - SVG object
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Labels for axes=================================
// First g - tag for Bottom axis css class
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");

// Transform to adjust for xText
var bottomTextX =  (width - labelArea)/2 + labelArea;
var bottomTextY = height - margin - padding;
xText.attr("transform",`translate(
    ${bottomTextX}, 
    ${bottomTextY})`
    );

// x-axis (bottom) ______________________________
// Build xText with information
xText.append("text")
    .attr("y", -19)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class","aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 19)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class","aText inactive x")
    .text("Household Income (Median)");

// y-axis (left)___________________________________
// Second g tag for yText
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");

// Transform to adjust for yText
var leftTextX =  margin + padding;
var leftTextY = (height + labelArea) / 2 - labelArea;
yText.attr("transform",`translate(
    ${leftTextX}, 
     ${leftTextY}
    )rotate(-90)`
    );


// y-axis (bottom) ______________________________
// Build yText with information
yText .append("text")
    .attr("y", -22)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText .append("text")
    .attr("y", 0)
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Smokes (%)");

yText .append("text")
    .attr("y", 22)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText inactive y")
    .text("Lacks Healthcare (%)");
    
// Dynamic circle radius
var cRadius;
function adjustRadius() {
  if (width <= 530) {
    cRadius = 7;
  }
  else { 
    cRadius = 10;
  }
}
adjustRadius();

// Visualize data  _______________________________________  
// Read in data as promise... and then... newer d3.js method
d3.csv("assets/data/data.csv").then(function(data) {
    visualize(data);
});

function visualize (theData) {
   var xMin;
   var xMax;
   var yMin;
   var yMax;

   // Current X axis selected, Current Y axis selected
   var currentX = "poverty";
   var currentY = "obesity";

   // Tool Tip enhancement
   var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([40, -60])
      .html(function(d) {
            //Build text box
            var stateLine = `<div>${d.state}</div>`;
            var yLine = `<div>${currentY}: ${d[currentY]}%</div>`;
            if (currentX === "poverty") {
                xLine = `<div>${currentX}: ${d[currentX]}%</div>`
            }
            else {
                xLine = `<div>${currentX}: ${parseFloat(d[currentX]).toLocaleString("en")}</div>`;
            } 
            // Display lines 
            return stateLine + xLine + yLine  
        });

    // Add toolTip to svg
    svg.call(toolTip);

    // Find the max & min values of the columns
    function xMinMax() {
      xMin = d3.min(theData, function(d) {
        return parseFloat(d[currentX]) * 0.90;
      });
      xMax = d3.max(theData, function(d) {
        return parseFloat(d[currentX]) * 1.10;
      });     
    }

    function yMinMax() {
      yMin = d3.min(theData, function(d) {
        return parseFloat(d[currentY]) * 0.90;
      });
      yMax = d3.max(theData, function(d) {
        return parseFloat(d[currentY]) * 1.10;
      }); 
    }

    // Update upon axis option clicked
    function  labelUpdate(axis, clickText) {
      // Switch active to inactive
      d3.selectAll(".aText")
          .filter("." + axis)
          .filter(".active")
          .classed("active", false)
          .classed("inactive", true);

      // switch the text just clicked to active
      clickText.classed("inactive", false).classed("active", true);
    }

    // Scatter plot
    xMinMax();
    yMinMax();

    // Build Scales using min and max
    var xScale = d3 
        .scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin])

    var yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin])

    // pass the scapes into the axis methods to create our axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // determine the x and y tick counts
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

    // append axis to the svg as group elements
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            0, 
            ${height - margin - labelArea})`
        );

    svg.append("g")
        .call(yAxis)
        .attr("class", "xAxis")
        .attr("transform", `translate(
            ${margin + labelArea}, 
            0 )`
        );

    // we append the circles for each row of data
    var theCircles = svg.selectAll("g theCircles").data(theData).enter();

    theCircles
        .append("circle")
        .attr("cx", function(d) {
            // xScale figures the pixels
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", cRadius)
        .attr("class", function(d) {
            return "stateCircle " + d.abbr;
        })
        .on("mouseover", function(d) {
            // data, current element - show tooltip when mouse is on circle
            toolTip.show(d, this);
            // highlight the state circles' boarder
            d3.select(this).style("stroke", "#323232");
        })
        .on("mouseout", function (d) {
            //remove the tooltip
            toolTip.hide(d);
            // remove the highlight
            d3.select(this).style("stroke", "#e3e3e3")
        });
        // dx and dy is location of the text on circles
        theCircles
            .append("text")
            .text(function(d) {
              return d.abbr;
            })
            .attr("dx", function(d) {
               return xScale(d[currentX]);
            })
            .attr("dy", function(d) {
              // When size of text is radius
              // Add a thrid of the radius to the height
              // Pushes it to the middle of the circle
              return yScale(d[currentY]) + cRadius / 2.5;
            })
            .attr("font-size", cRadius)
            .attr("class", "stateText")
            .on("mouseover", function(d) {
                toolTip.show(d);

                d3.select("." + d.abbr).style("stroke", "#323232");
            })
            .on("mouseout", function(d) {
              toolTip.hide(d);

              d3.select("." + d.abbr).style("stroke", "#e3e3e3");
          });


          // make the graph dynamic on click
          d3.selectAll(".aText").on("click", function() {
              var self = d3.select(this)

              // we only want to select inactive labels
              if (self.classed("inactive")) {
                // grab the name and axis saved in the label
                var axis = self.attr("data-axis")
                var name = self.attr("data-name")

                if (axis === "x") {
                  currentX = name;

                  // change the min and max
                  xMinMax();

                  //update the domain of x
                  xScale.domain([xMin, xMax]);
                  svg.select(".xAxis").transition().duration(300).call(xAxis);
                  
                  // with the axis change, change location of the circles
                  d3.selectAll("circle").each(function() {
                      d3.select(this)
                        .transition()
                        .attr("cx", function(d) {
                            return xScale(d[currentX]);                
                        })
                        .duration(300);
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3
                        .select(this)
                        .transition()
                        .attr("dx", function(d) {
                            return xScale(d[currentX]);                          
                        })
                        .duration(300);
                  });

                  // change the classes of to active and the clicked label
                  labelUpdate(axis, self);

                }
                else {
                  // when y is clicked, do this 
                  currentY = name;

                  // change the min and max of y axis
                  yMinMax();

                  // update y 
                  yScale.domain([yMin, yMax]);

                  // update the y axis
                  svg.select(".yAxis").transition(300).call(yAxis);

                  // with the axis change, change location of the circles
                  d3.selectAll("circle").each(function() {
                      d3.select(this)
                        .transition()
                        .attr("cy", function(d) {
                            return yScale(d[currentY]);                
                        })
                        .duration(300);
                  });   

                  d3.selectAll(".stateText").each(function() {
                      d3
                        .select(this)
                        .transition()
                        .attr("dy", function(d) {
                           // Center text
                            return yScale(d[currentY]) + cRadius/3;                          
                        })
                        .duration(300);
                  });

                  // change the classes of to active and the clicked label
                  labelUpdate(axis, self);
                }
              }
          });
}



















