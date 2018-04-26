// Initial render
render("1996");

// Render function
function render(year) {
    $("#range").text(year);

    //Load data
    d3.json("assets/data/sankey/json/data-"+year+".json", function(error, data){

        // Variables
        var nodes = data.nodes;
        var links = data.links;

        var svg = d3.select("#graph").append("svg")
            .attr("id","sankeyGraph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g");

        var sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(5)
            .links(links)
            .size([width, height])
            .iterations(32); // Some vague render that generates the layout of the diagram

        // Initialize
        sankey(data);

        var node = svg.append("g").selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("name", function(d,i){return d.name})
            .attr("group", function(d,i){return d.group})
            .attr("id", function(d,i){return i});

        node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("fill", function(d) { return color(d.name)})
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);


        // Create Legend
        var titleOfLegend = document.getElementById("information-title").getAttribute("class");
        if(titleOfLegend){
            generateLegend(data.nodes[titleOfLegend]);
        }
        node.on("click", function(d,i) {
            // Function generates the legend and filters the Source and the Link
            generateLegend(d);
        });

        // add in the title for the nodes
        node.append("text")
            .attr("x", function(d) { return d.x1 - 6; })
            .attr("y", function(d) { return (d.y1 + d.y0) / 2; })
            .attr("text-anchor", "end")
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x0 < width / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");


        var link = svg.append("g")
            .attr("class", "links")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.2)
            .selectAll("path");

        link.data(links)
            .enter().append("path")
            .attr("source", function (d) { return d.source.index})
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke", function(d){ return d.color = color(d.source.name)})//add this to return the color of link
            .attr("stroke-width", function(d) { return Math.max(1, d.width); })
            .on("mouseover", handleMouseOverLink)
            .on("mouseout", handleMouseOutLink);

        link.append("title")
            .text(function(d) { return d.source.name + " → " + d.target.name + "\n"; });

    });
    d3.select("#sankeyGraph").remove();
}

/*
// Render again if the input changes
d3.select('#year').on('input', function (data) {
    console.log(FFFF)
    var value = this.value;
    render(value);
});*/


// Generates the Legend
function generateLegend(d) {

    var names = [{}];
    var columns = ["afkomst", "immigranten"];
    var section = d3.select("#information").html(" ");

    var table = d3.select('#information').append('table');
    table.attr("class","uk-table uk-table-striped")
        .style("width", "100%");
    var thead = table.append("thead");
    var	tbody = table.append('tbody');

    if(!d.targetLinks.length == 0) {
        d.targetLinks.map(function (d,i) {
            names[i] = {
                afkomst : d.source.name,
                immigranten :  (d.value).toLocaleString('nl'),
            };
        });

        d3.select("#information-title").html(d.name).attr("class", d.index);

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .text(function (column) {
                return column;
            });

        // console.log(names)
        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(names)
            .enter()
            .append('tr');

        // create a cell in each row for each column
        var cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append('td')
            .text(function (d) { return d.value; });

    } else {
        d.sourceLinks.map(function (d,i) {
            names[i] = {
                afkomst : d.target.name,
                immigranten : d.value
            };
        });

        d3.select("#information-title").html(d.name).attr("class", d.index);

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .text(function (column) {
                return column;
            });
        // console.log(names)
        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(names)
            .enter()
            .append('tr');

        // create a cell in each row for each column
        var cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]};
                });
            })
            .enter()
            .append('td')
            .text(function (d) { return d.value; });
    }
}

// If hover than highlight the path and the node
function handleMouseOver(d) {
    d3.select(this).attr("fill", "#00c")
    d3.selectAll("path[source='"+d.index+"']").style("stroke", function(d){ return d.color = "#00c"})
}

// If hover is over than return to normal color
function handleMouseOut(d) {
    d3.select(this).attr("fill", function(d) { return color(d.name)});
    d3.selectAll("path[source='"+d.index+"']").style("stroke", function(d){ return d.color = color(d.source.name)})//add this to return the color of link
}

// If hover over the paths than highlight the path
function handleMouseOverLink(d) {  // Add interactivity
    d3.selectAll("path[source='"+d.source.index+"']").style("stroke", "#00c")
}
// If hover is over than return to normal color
function handleMouseOutLink(d) {
    d3.selectAll("path[source='"+d.source.index+"']").style("stroke", function(d){ return d.color = color(d.source.name)})//add this to return the color of link
}