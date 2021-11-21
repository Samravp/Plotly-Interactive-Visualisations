// configure front user input field
var select = d3.select("#selDataset");

// Demographics information table
var demoTable = d3.select("#sample-metadata");

// Bar chart
var barChart = d3.select("#bar");

// Bubble chart
var bubbleChart = d3.select("bubble");

// The gauge chart - advanced component
var gaugeChart = d3.select("gauge");

// create a function to populate dropdown menu and display default visualisation
function init() {
    clearData();

    // read the samples data from JSON file in data folder
    d3.json("data/samples.json").then((data => {
        data.names.forEach((name => {
            var option = select.append("option");
            option.text(name);
        }));
        //default id to display charts
        var initId = select.property("value")
        plotCharts(initId);

    }));

}

// create a function to reset the selection and clear previuosly displayed data
function clearData() {

    demoTable.html("");
    barChart.html("");
    bubbleChart.html("");
    gaugeChart.html("");

};

// create a function to read JSON and display plot charts
function plotCharts(id) {
    d3.json("data/samples.json").then((data => {

        // filter metadata by selected ID
        var idMetadata = data.metadata.filter(participant => participant.id == id)[0];

        // Iterate through each key and value in metadata
        Object.entries(idMetadata).forEach(([key, value]) => {

            var newList = demoTable.append("ul");
            newList.attr("class", "list-group list-group-flush");

            // append a li item to the unordered list tag
            var listItem = newList.append("li");

            // change the class attributes of the list item for styling
            listItem.attr("class", "list-group-item p-1 demo-text bg-transparent");
            listItem.text(`${key}: ${value}`);

        });

        // filter the samples by the ID chosen
        var idSample = data.samples.filter(sample => sample.id == id)[0];

        // Initialise arrays to store sample data
        var otuIds = [];
        var otuLabels = [];
        var sampleValues = [];

        // Iterate through each key and value in the samples to retrieve data for plotting
        Object.entries(idSample).forEach(([key, value]) => {

            switch (key) {
                case "otu_ids":
                    otuIds.push(value);
                    break;
                case "sample_values":
                    sampleValues.push(value);
                    break;
                case "otu_labels":
                    otuLabels.push(value);
                    break;
                default:
                    break;
            } 

        });

        // slice and reverse the arrays to get the top 10 values, labels and IDs
        var topOtuIds = otuIds[0].slice(0, 10).reverse();
        var topOtuLabels = otuLabels[0].slice(0, 10).reverse();
        var topSampleValues = sampleValues[0].slice(0, 10).reverse();

        // Store the IDs with "OTU" for labelling y-axis
        var topOtuIdsFormatted = topOtuIds.map(otuID => "OTU " + otuID);

        // create a trace
        var traceBar = {
            x: topSampleValues,
            y: topOtuIdsFormatted,
            text: topOtuLabels,
            type: 'bar',
            orientation: 'h',
            marker: {
                color: 'rgb(29,145,192)'
            }
        };

        // create the data array for plotting
        var dataBar = [traceBar];

        // define the plot layout
        var layoutBar = {
            height: 500,
            width: 600,
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand'
                }
            },
            title: {
                text: `<b>Top OTUs for Test Subject ${id}</b>`,
                font: {
                    size: 18,
                    color: 'rgb(34,94,168)'
                }
            },
            xaxis: {
                title: "<b>Sample values<b>",
                color: 'rgb(34,94,168)'
            },
            yaxis: {
                tickfont: { size: 14 }
            }
        }


        // plot the bar chart to the "bar" div
        Plotly.newPlot("bar", dataBar, layoutBar);


        // create trace
        var traceBub = {
            x: otuIds[0],
            y: sampleValues[0],
            text: otuLabels[0],
            mode: 'markers',
            marker: {
                size: sampleValues[0],
                color: otuIds[0],
                colorscale: 'YlGnBu'
            }
        };

        // create the data array for the plot
        var dataBub = [traceBub];

        // define the plot layout
        var layoutBub = {
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand'
                }
            },
            xaxis: {
                title: "<b>OTU Id</b>",
                color: 'rgb(34,94,168)'
            },
            yaxis: {
                title: "<b>Sample Values</b>",
                color: 'rgb(34,94,168)'
            },
            showlegend: false,
        };

        // plot the bubble chat to the related div
        Plotly.newPlot('bubble', dataBub, layoutBub);


    })); 

}; // close plotCharts() function

// when there is a change in the dropdown select menu, this function is called with the ID as a parameter
function optionChanged(id) {

    // reset the data
    clearData();

    // plot the charts for this id
    plotCharts(id);


} 

init();
