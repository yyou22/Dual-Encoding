import './assets/scss/app.scss'
import * as scatter_utils from './scatter_utils.js';

//FIXME: clicking a circle then attack

var $ = require('jquery')
var d3 = require('d3')

var map_ = ['#f48382', '#f8bd61', '#ece137', '#c3c580', '#82a69a', '#80b2c5', '#8088c5', '#a380c5', '#c77bab', '#9a9494'];
var map_contour = ['#f48382', '#f8bd61', '#ece137', '#c3c580', '#82a69a', '#80b2c5', '#8088c5', '#a380c5', '#c77bab', '#9a9494'];
var perturb = ['None', '0.01', '0.02', '0.03'];
const label_ = ['Airplane', 'Automobile', 'Bird', 'Cat', 'Deer', 'Dog', 'Frog', 'Horse', 'Ship', 'Truck']
var k = 1.0;
var translateVar = [0, 0];
var contour_on = 0;
var attack_button_on = 1;
var cur_perturb = "0"

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

export {label_, x1, y1, map_, k}

// create dummy pie data for angle degrees
var pie_data = {a: 50, b:50}

const canvas = d3.select('.canvas');
const canvas1 = d3.select('.canvas1');

$('#slider1').on('input', e => $('span').text(perturb[e.target.value]));

$(document).ready(function() {

    const gGrid = canvas1.append("g");

    var zoom = d3.zoom()
                .scaleExtent([0.5, 100])
                .on("zoom", function () {
                    k = d3.event.transform.k;
                    translateVar[0] = d3.event.transform.x;
                    translateVar[1] = d3.event.transform.y;

                    //move circles and contours around
                    canvas1.selectAll('.container_,.contour,.dot_highlight').attr("transform", d3.zoomTransform(this))
                    //hover feature
                    scatter_utils.adjust_zoom_hover(canvas1, canvas, k, zoom);
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

        scatter_utils.initiateContour(canvas1, data);

        //FIXME: testing brush
        //canvas1.call(d3.brush());

        //call grid
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
        scatter_utils.setCircleHover(canvas1, canvas, k, zoom);

        canvas1.call(zoom);

    })

    //reset button
    d3.select("#reset1").on("click", function() {

        canvas1.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);

    })

    //contour button
    d3.select("#contour_button").on("click", function() {

        if (canvas1.selectAll('.contour').style("opacity") == 1){
            contour_on = 0
            canvas1.selectAll('.contour')
                .transition()
                .duration(300)
                .style("opacity", 0);
        }
        else if (canvas1.selectAll('.contour').style("opacity") == 0){
            contour_on = 1
            canvas1.selectAll('.contour')
                .transition()
                .duration(300)
                .style("opacity", 1);
        }

    })

    d3.select("#trans1").on("click", function() {

        var slider = document.getElementById('slider1');
        var perturb_filename = String(slider.value);
        var filename = '/data/data' + perturb_filename + '.csv';

        if (attack_button_on && cur_perturb != perturb_filename){

            attack_button_on = 0;
            cur_perturb = perturb_filename;

            d3.csv(filename, function(d, i) {
                // convert to numerical values
                d.x = +d.xposp
            	d.y = +d.yposp
            	d.pred = +d.pred
            	d.target = +d.target
                d.idx = i

                return d
            }).then(function(data) {

                scatter_utils.loadContour(canvas1, data, k, contour_on);
                scatter_utils.changeContour(canvas1, contour_on);

                scatter_utils.removeHighlight(canvas1, data, k);

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
                    .on("end", function(){
                        attack_button_on = 1;
                    })
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

        }

    })
})
