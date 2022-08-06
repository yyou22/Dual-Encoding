import './assets/scss/app.scss'

import * as scatter_utils from './scatter_utils.js';

var $ = require('jquery')
var d3 = require('d3')

var map_ = ['#f48382', '#f8bd61', '#ece137', '#c3c580', '#82a69a', '#80b2c5', '#8088c5', '#a380c5', '#c77bab', '#9a9494'];
var perturb = ['None', '0.01', '0.02', '0.03'];
const label_ = ['Airplane', 'Automobile', 'Bird', 'Cat', 'Deer', 'Dog', 'Frog', 'Horse', 'Ship', 'Truck']
var k = 1.0;
var translateVar = [0, 0];

export {label_}

// create dummy pie data for angle degrees
var pie_data = {a: 50, b:50}

const canvas = d3.select('.canvas');
const canvas1 = d3.select('.canvas1');

$('#slider1').on('input', e => $('span').text(perturb[e.target.value]));

$(document).ready(function() {

    var x1 = d3.scaleLinear()
        .domain([0, 1.0])
        .range([50, 450])

    var y1 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([50, 450])

    var x2 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, 500])

    var y2 = d3.scaleLinear()
            .domain([0, 1.0])
            .range([0, 500])

    const gGrid = canvas1.append("g");

    var zoom = d3.zoom()
                .scaleExtent([0.5, 100])
                .on("zoom", function () {
                    k = d3.event.transform.k;
                    translateVar[0] = d3.event.transform.x;
                    translateVar[1] = d3.event.transform.y;

                    //move circles around
                    canvas1.selectAll('.container_').attr("transform", d3.zoomTransform(this))
                    //hover feature
                    scatter_utils.adjust_zoom_hover(canvas1, k);
                    //adjust grid
                    scatter_utils.adjust_zoom_grid(canvas1, x2, y2);

                })

    d3.csv('/data/data0.csv', function(d, i) {
        // convert to numerical values
        d.x = +d.xposp
    	d.y = +d.yposp
    	d.pred = +d.pred
    	d.target = +d.target
        d.idx = i

        return d
    }).then(function(data) {

        gGrid.call(scatter_utils.grid(), x2, y2);

        var s = canvas1.selectAll()
                    .data(data)
                    .enter()
                    .append('g')
                    .attr('class', 'container_')
                    .append('svg')
                    .append('g')
                    .attr('class', 'circle_group')
                    .attr("transform", function(d) {
                        return "translate(" + x1(d.x)  + "," + y1(d.y)  + ")"
                    });

        s.append('circle')
            .attr('class', 'dot')
            .attr('r', 7/k)
            .attr('stroke-width', 0.3/k)
            .style("fill", function(d) {
                    return map_[d.target];
                })

        s.append("path")
            .style("fill", function(d) {
                return map_[d.pred];
            })
            .attr('class', 'arc')
            .attr('d', scatter_utils.drawArc(6.6, k));

        //hover feature
        canvas1.selectAll('.circle_group')
            .on("mouseover", function(d, i) {
                scatter_utils.hoverCir(d3.select(this), k);
                scatter_utils.textbox(canvas, d, i);
            })
            .on("mousemove", function(d, i) {
                scatter_utils.textbox(canvas, d, i);
            })
            .on("mouseout", function(d, i) {
                scatter_utils.unhoverCir(d3.select(this), k);
                //remove textbox
                scatter_utils.remove_textbox();
            })

        canvas1.call(zoom);

    })

    //reset button
    d3.select("#reset1").on("click", function() {

        canvas1.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);

    })

    d3.select("#trans1").on("click", function() {

        var slider = document.getElementById('slider1');
        var perturb_filename = String(slider.value);
        var filename = '/data/data' + perturb_filename + '.csv';

        d3.csv(filename, function(d, i) {
            // convert to numerical values
            d.x = +d.xposp
        	d.y = +d.yposp
        	d.pred = +d.pred
        	d.target = +d.target
            d.idx = i

            return d
        }).then(function(data) {

            canvas1.selectAll('.circle_group')
                .data(data)
                .enter();

            canvas1.selectAll('.arc')
                .data(data)
                .enter();

            //move svg groups
            canvas1.selectAll('.circle_group')
                .transition()
                .ease(d3.easeSin)
                .duration(600)
                .attr("transform", function(d) {
                    return "translate(" + x1(d.x)  + "," + y1(d.y)  + ")";
                });

            canvas1.selectAll('.arc')
                .transition()
                .ease(d3.easeSin)
                .duration(600)
                .style("fill", function(d) {
                    return map_[d.pred];
                });

        })

    })
})
