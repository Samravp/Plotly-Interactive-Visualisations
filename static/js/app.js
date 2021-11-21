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
        
        //guage chart information
        var washfreq = idMetadata.washfreq;

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

        /* Gauge chart(OPTIONAL)

        // if wash frequency has a null value, make it zero for calculating pointer later
        if (washfreq == null) {
            washfreq = 0;
        }

        // create an indicator trace for the gauge chart
        var traceGauge = {
            domain: { x: [0, 1], y: [0, 1] },
            value: washfreq,
            type: "indicator",
            mode: "gauge",
            gauge: {
                axis: {
                    range: [0, 9],
                    tickmode: 'linear',
                    tickfont: {
                        size: 15
                    }
                },
                bar: { color: 'rgba(8,29,88,0)' }, // making gauge bar transparent since a pointer is being used instead
                steps: [
                    { range: [0, 1], color: 'rgb(255,255,217)' },
                    { range: [1, 2], color: 'rgb(237,248,217)' },
                    { range: [2, 3], color: 'rgb(199,233,180)' },
                    { range: [3, 4], color: 'rgb(127,205,187)' },
                    { range: [4, 5], color: 'rgb(65,182,196)' },
                    { range: [5, 6], color: 'rgb(29,145,192)' },
                    { range: [6, 7], color: 'rgb(34,94,168)' },
                    { range: [7, 8], color: 'rgb(37,52,148)' },
                    { range: [8, 9], color: 'rgb(8,29,88)' }
                ]
            }
        };

        // determine angle for each wfreq segment on the chart
        var angle = (washfreq / 9) * 180;

        // calculate end points for triangle pointer path
        var degrees = 180 - angle,
            radius = .8;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: to create needle shape (triangle). Initial coordinates of two of the triangle corners plus the third calculated end tip that points to the appropriate segment on the gauge 
        // M aX aY L bX bY L cX cY Z
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            cX = String(x),
            cY = String(y),
            pathEnd = ' Z';
        var path = mainPath + cX + " " + cY + pathEnd;

        gaugeColors = ['rgb(8,29,88)', 'rgb(37,52,148)', 'rgb(34,94,168)', 'rgb(29,145,192)', 'rgb(65,182,196)', 'rgb(127,205,187)', 'rgb(199,233,180)', 'rgb(237,248,217)', 'rgb(255,255,217)', 'white']

        // create a trace to draw the circle where the needle is centered
        var traceNeedleCenter = {
            type: 'scatter',
            showlegend: false,
            x: [0],
            y: [0],
            marker: { size: 35, color: '850000' },
            name: washfreq,
            hoverinfo: 'name'
        };

        // create a data array from the two traces
        var dataGauge = [traceGauge, traceNeedleCenter];

        // define a layout for the chart
        var layoutGauge = {

            // draw the needle pointer shape using path defined above
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            font: {
                family: 'Quicksand'
            },
            hoverlabel: {
                font: {
                    family: 'Quicksand',
                    size: 16
                }
            },
            title: {
                text: `<b>Test Subject ${id}</b><br><b>Belly Button Washing Frequency</b><br><br>Scrubs per Week`,
                font: {
                    size: 18,
                    color: 'rgb(34,94,168)'
                },
            },
            height: 500,
            width: 500,
            xaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-1, 1],
                fixedrange: true // disable zoom
            },
            yaxis: {
                zeroline: false,
                showticklabels: false,
                showgrid: false,
                range: [-0.5, 1.5],
                fixedrange: true // disable zoom
            }
        };

        // plot the gauge chart
        Plotly.newPlot('gauge', dataGauge, layoutGauge); */


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