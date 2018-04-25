renderBubble("1996");

function renderBubble(year) {

    $("#rangeBubble").text(year);

    // var name = [];

    d3.csv("assets/data/bubble/data-"+year+".csv", function(d,i) {
        d.value = +d.value;
        if (d.value) return d;
    }, function(error, classes) {
        if (error) throw error;


        var svg = d3.select("#bubbleChart").append("svg")
            .attr("id", "bubbleGraph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g");

        var format = d3.format(",d");


        var pack = d3.pack()
            .size([width, height])
            .padding(1.5);

        // var expenseMetrics = d3.nest()
        //     .key(function(d) { return d.Regio; })
        //     .rollup(function(v) {
        //         return {
        //             childs: d3.map(v, function(d){ return d.Migratieachtergrond}),
        //             count: v.length,
        //             total: d3.sum(v, function(d) { return d.value; }),
        //             avg: d3.mean(v, function(d) { return d.value; })
        //     };
        //         })
        //     // .key(function(d){ return d.Migratieachtergrond})
        //     .entries(classes);


        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span>Background:</span> <span>" + d.data.Migratieachtergrond + "</span><br/>" +
                    "<span>Immigranten:</span> <span>" + d3.format(",.2r")(d.data.value); + "</span>";
            });

        svg.call(tip);


        // console.log(expenseMetrics);

        // var filteredMetrics = expenseMetrics.filter(function(d) { return d.key !== 'Nederland'; });

        var root = d3.hierarchy({children: classes})
            .sum(function(d) {
                if(d.Regio === "Nederland"){
                    return d.value;
                }
            }).sort(function(a, b) { return b.value - a.value; });


        // var root2 = d3.hierarchy({children: classes})
        //     .sum(function(d) {
        //             console.log(d)
        //     });

        pack(root);
        // console.log(root)
        var colorNode = d3.scaleOrdinal(d3.schemeSet3);
        var node = svg.selectAll(".node")
            .data(root.children)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        node.append("title")
            .text(function(d) { return d.data.className + ": " + format(d.value); });

        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) {
                return colorNode(d.data.Migratieachtergrond);
            })
            .on("mouseover", tip.show)
            .on('mouseout', tip.hide);



        node.append("text")
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.data.Migratieachtergrond.substring(0, d.r / 3); });



    });
    d3.select("#bubbleGraph").remove();

}


