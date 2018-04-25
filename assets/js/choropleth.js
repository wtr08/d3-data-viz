var margin = { top: 50, right: 50, bottom: -20, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var projection = d3.geoMercator()
    .center([4.090973, 51.951368])
    .scale(6000)
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select('#map')
    .attr('width', 100 + '%')
    .attr('height', 500 + 'px');

// Load JSON
d3.json('assets/data/choropleth/json/nederland.json', function (error, json) {
    if (error) throw error;

    var periode = {};
    var migrationPercentage = {};
    var totalPopulation = {};
    var migrationPopulation = {};

    var tooltip = d3.tip()
        .attr('class', 'd3-tooltip')
        .html(function (d) {
            return "<span class='province-name'>" + d.properties.provincien + "</span>" +
                "<hr/>" +
                "<p class='province-population'>Totale populatie: " + (totalPopulation[d.properties.id]).toLocaleString('nl') + "</p>" +
                "<p class='province-population'>Aantal migranten: " + (migrationPopulation[d.properties.id]).toLocaleString('nl') + " (" + (migrationPercentage[d.properties.id] * 100).toFixed(1) + "%)</p>"
        });

    var mapProvinces = svg.append('g')
        .attr('id', 'province')
        .style('fill', '#dedee0')
        .style('stroke', '#666')
        .style('stroke-width', 0.5);

    mapProvinces.call(tooltip);

    mapProvinces
        .selectAll('path')
        .data(json.features)
        .enter().append('path')
        .attr('d', path);

    d3.csv('assets/data/choropleth/csv/migratie.csv', function (data) {

        // Convert period to integer
        data.forEach(function (d) {
            d.periode = +d.periode;
            d.percentage = +d.percentage;
        });

        minYear = d3.min(data, function (d) { return d.periode; });
        maxYear = d3.max(data, function (d) { return d.periode; });
        maxPercentage = d3.max(data, function (d) { return d.percentage; });
        roundPercentage = (Math.ceil(maxPercentage * 20) / 20).toFixed(2);

        // Create color scheme
        color1 = d3.scaleQuantize()
            .domain([0, roundPercentage])
            .range(d3.schemeBlues[7]);

        createLegend(color1);


        // Create dashboard cards
        div = d3.select('.svg-cards').insert('div')
            .insert('div')
            .attr('class', 'current-year uk-card-default uk-card-body uk-padding-small uk-text-center');

        div.insert('h4')
            .attr('class', 'uk-card-title')
            .text('Jaar');

        div.insert('p');

        div2 = d3.select('.svg-cards').insert('div')
            .insert('div')
            .attr('class', 'uk-card-default uk-padding-small uk-card-body uk-text-center');

        div2.insert('h4')
            .attr('class', 'uk-card-title')
            .text('Totale populatie');

        div2.insert('p');

        div3 = d3.select('.svg-cards').insert('div')
            .insert('div')
            .attr('class', 'uk-card-default uk-card-body uk-padding-small uk-text-center');

        div3.insert('h4')
            .attr('class', 'uk-card-title')
            .text('Aantal migranten');

        div3.insert('p');

        fillMap(data);
    });

    function fillMap(data) {

        // Filter data to have only data from the first year
        var newData = data.filter(function (d) { return d.periode === minYear });
        updateMap(newData, minYear);

        // Slider move function
        d3.select('#year').on('input', function () {
            var value = this.value;
            d3.select('#current-year').text(value);
            // Filter data to have only data that is equal to a specific period
            var newData = data.filter(function (d) { return d.periode === +value });
            updateMap(newData, value);
            render(value);

        })
    }

    function updateMap(data, value) {
        data.forEach(function (d) {
            // Strings to int
            d.migratieachtergrond = +d.migratieachtergrond;
            d.totaal = +d.totaal;
            d.percentage = +d.percentage;

            // Readable for json
            periode[d.id] = +d.periode;
            migrationPopulation[d.id] = +d.migratieachtergrond;
            totalPopulation[d.id] = +d.totaal;
            migrationPercentage[d.id] = +d.percentage;
        });

        // map population of all provinces
        var population = data.map(function (d) {
            return d.totaal;
        });

        // map migrations of all provinces
        var migration = data.map(function (d) {
            return d.migratieachtergrond;
        });

        // sum population
        var sumPopulation = population.reduce(add, 0);
        // sum migrations
        var sumMigration = migration.reduce(add, 0);
        // calculate percentage migrations vs all
        var percentageMigration = ((sumMigration / sumPopulation) * 100).toFixed(1);

        function add(a, b) {
            return a + b;
        }

        // update text of dashboard cards
        div.select('p').text(value);
        div2.select('p').text(sumPopulation.toLocaleString('nl'));
        div3.select('p').text(sumMigration.toLocaleString('nl') + ' ('  + (percentageMigration) + '%)');

        mapProvinces
            .selectAll('path')
            .attr('class', function(d) { return migrationPercentage[d.properties.id]; })
            .attr('fill', function(d) { return color1(migrationPercentage[d.properties.id]); })
            .on('mouseover', tooltip.show) // show tooltip
            .on('mouseout', tooltip.hide); // hide tooltip
    }

    function createLegend(color1) {
        var legendSize = 30; // size of each rect

        var yScale = d3.scaleLinear()
            .domain([0, roundPercentage])
            .range([legendSize * 7, 0]);

        var yAxis = d3.axisRight()
            .scale(yScale)
            .tickFormat(function (d) {
                return (d * 100).toFixed(0) + '%'
            });

        var legend = svg.append('g')
            .attr('class', 'legend-g')
            .attr('transform', 'translate(' + 20 + ',' + 20 + ')')
            .selectAll('g')
            .data(legendDomain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                var height = legendSize;
                var x = 0;
                var y = i * height;
                return 'translate(' + x + ',' + y + ')';
            })
            .on('mouseover', function (d) {
                legendMouseOver(d, color1)
            })
            .on('mouseout', function () {
                legendMouseOut()
            });

        svg.select('.legend-g').append('g')
            .call(yAxis)
            .attr('transform', 'translate(' + legendSize + ',' + 0 + ')');

        legend
            .append('rect')
            .attr('width', legendSize)
            .attr('height', legendSize)
            .style('fill', color1)
            .style('stroke', color1);
    }

    // Change opacity to 0 of all provinces that meet the condition
    function legendMouseOver(d, color1) {
        d3.selectAll("path:not([fill = '"+ color1(d) +"'])")
            .attr('fill-opacity', 0)
    }

    // Change opacity to 1 of all provinces that meet the condition
    function legendMouseOut() {
        d3.selectAll("path[fill-opacity = '"+ 0 +"']")
            .attr('fill-opacity', 1)
    }

    // Create array for domain of legend
    function legendDomain() {
        var array = [];
        for (var i = 0; i < roundPercentage; i += 0.05) {
            array.push(Math.round(i * 100) / 100)
        }
        return array.reverse();
    }
});