import './assets/scss/app.scss'

var $ = require('jquery')
var d3 = require('d3')

var map_ = ['#f48382', '#f8bd61', '#ece137', '#c3c580', '#82a69a', '#80b2c5', '#8088c5', '#a380c5', '#c77bab', '#9a9494'];

// create dummy pie data for angle degrees
var pie_data = {a: 50, b:50}

var drawArc = d3.arc()
                .innerRadius(0)
                .outerRadius(9.6)
                .startAngle(0.5)
                .endAngle(0.5+Math.PI);

$(document).ready(function() {

    var x1 = d3.scaleLinear()
        .domain([0, 1.0])
        .range([50, 450])
    var y1 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([50, 450])

    var w = 500, h = 500

    d3.csv('/data/data.csv', function(d, i) {
        // convert to numerical values
        d.x = +d.xposp
    	d.y = +d.yposp
    	d.pred = +d.pred
    	d.target = +d.target
        d.idx = i

        return d
    }).then(function(data) {
        // Your d3 drawing code comes here
        // The below example draws a simple "scatterplot"

        var s = d3.select('.canvas')
            .selectAll('.dot')
            .data(data)
            .enter()
            .append('svg')
            .append('g')
            .attr("transform", function(d) {
                return "translate(" + x1(d.x)  + "," + y1(d.y)  + ")"
            });

        s.append('circle')
            .attr('class', 'dot')
            .attr('r', 10)
            .style("fill", function(d) {
                    return map_[d.target];
                })

        var arc = s.append("path")
                    .style("fill", function(d) {
                        return map_[d.pred];
                    })
                    .attr('class', 'arc')
                    .attr('d', drawArc);
    })
})
