// D3 Scatterplot Assignment

// Students:
// =========
// Follow your written instructions and create a scatter plot with D3.js.
// Using the D3 techniques we taught you in class, create a scatter plot that 
// represents each state with circle elements. You'll code this graphic in the 
// app.js file of your homework directory—make sure you pull in the data from 
// data.csv by using the d3.csv function.
// Define SVG area dimensions
var svgWidth = 400;
var svgHeight = 400;

// Define the chart's margins as an object
var chartMargin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 30
};

// Define dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
    .select("#chart")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);
console.log("made it here 1")
// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Initial Params
var chosenYAxis = "smokes";


// function used for updating y-scale var upon click on axis label
// NOTE: The chosenAxis is just a  text string of the key from the
// csv file that we are working with. That way the function can call
// it below.
function yScale(stateDatapoint, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateDatapoint, d => d[chosenYAxis]) * 0.8,
        d3.max(stateDatapoint, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newYScale, chosenYaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYaxis]));

    return circlesGroup;
}
console.log("made it here 2")
// function used for updating circles group with new tooltip
function updateToolTip(chosenYaxis, circlesGroup) {

    if (chosenYAxis === "smokes") {
        var label = "Smokers % of Population";
    }
    else if (chosenYaxis === "obesity") {
        var label = "Obesity Rates of Population (%)";
    }
    else {
        var label = "Health Care Coverage of Population (%)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenYAxis]}`);
        });
    console.log("what about here?")
    circlesGroup.call(toolTip);
    // Show data when the mouse hovers over and then nothing when it doesn't
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });
    console.log("or here?")
    return circlesGroup;

}
// Load data from CSV
var file = "data.csv"
d3.csv(file).then(successHandle, errorHandle);
console.log(file)
// Function that deals with error (if an error occurs)
function errorHandle(error) {
    return console.warn(error);
}

function successHandle(stateData) {
    console.log("made it here 3")
    console.log(stateData);

    // parse data
    stateData.forEach(function (data) {
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes
        data.poverty = +data.poverty
        data.state = +data.state

        // xLinearScale function above csv import
        var yLinearScale = yScale(data, chosenYAxis);

        // Create y scale function
        var xLinearScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.income)])
            .range([0, width])

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        chartGroup.append("g")
            .call(bottomAxis);
        // append y axis
        console.log("made it here 4")
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(leftAxis);
        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.income))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("fill", "pink")
            .attr("opacity", ".5");
        // Create group for  2 x- axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        xlabelsGroup.append("text")
            .attr("value", "Income")
            .attr("x", 0)
            .attr("y", 20)
            .text("Income");

 

        // append y axis
        var labelsGroup = chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - chartMargin.left)
            .attr("x", 0 - (height / 2))
            // .attr("dx", "1em")
            .classed("axis-text", true);


        var obesityLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "obesity") // value to grab for event listener
            .classed("inactive", true)
            .text("");

        var smokeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "smokes") // value to grab for event listener
            .classed("active", true)
            .text("% of Smokers per State Population");

        var healthcareLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "healthcare") // value to grab for event listener
            .classed("inactive", true)
            .text("% of Population with Healthcare");
        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
        // y axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenXAxis with value
                    chosenYAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    yLinearScale = yScale(data, chosenYAxis);

                    // updates x axis with transition
                    yAxis = renderAxes(yLinearScale, yAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "smokes") {
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "obesity") {

                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {

                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });


    }
    )
};



