var d3 = require('d3')

import {label_, x1, y1, map_, k} from './app.js'

export function drawArc(r_, k){

    var drawArc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(r_/k)
                    .startAngle(0.5)
                    .endAngle(0.5+Math.PI);

    return drawArc;

}

export function hoverCir(g, k){

    g.select('.dot').transition("mousehover")
        .duration(60)
        .attr("r", 15/k)

    g.select('.arc').transition("mousehover")
        .duration(60)
        .attr('d', drawArc(14.8, k));

}

export function unhoverCir(g, k){

    g.select('.dot').transition("mousehover")
        .duration(60)
        .attr("r", 7/k)

    g.select('.arc').transition("mousehover")
        .duration(60)
        .attr('d', drawArc(6.6, k));

}

export function grid(g, x, y){

    var grid = (g, x, y) => g
            .attr("stroke", "#7f609e")
            .attr("stroke-opacity", 0.3)
            .call(g => g
                .selectAll(".x")
                .data(x.ticks(15))
                .join(
                    enter => enter.append("line").attr("class", "x").attr("y2", 500),
                    update => update,
                    exit => exit.remove()
                )
                .attr("x1", d => 0.5 + x(d))
                .attr("x2", d => 0.5 + x(d)))
            .call(g => g
                .selectAll(".y")
                .data(y.ticks(15))
                .join(
                    enter => enter.append("line").attr("class", "y").attr("x2", 500),
                    update => update,
                    exit => exit.remove()
                )
                .attr("y1", d => 0.5 + y(d))
                .attr("y2", d => 0.5 + y(d)));

    return grid;

}

export function adjust_zoom_hover(canvas1, canvas, k, zoom){

    //maintain size ratio
    canvas1.selectAll('.dot').attr('r', 7/k).attr('stroke-width', 0.3/k)
    canvas1.selectAll('.arc').attr('d', drawArc(6.6, k))
    canvas1.selectAll('.contour').attr("stroke-width", 1.0/k)

    canvas1.select('.cir_highlight')
        .attr('r', 20/k)
        .attr('stroke-width', 0.3/k)

    canvas1.select('.arc_highlight')
        .attr('d',drawArc(19.8, k))

    setCircleHover(canvas1, canvas, k, zoom);

}

export function adjust_zoom_grid(canvas, x2, y2){

    const gGrid = canvas.select("g");
    const zx = d3.event.transform.rescaleX(x2).interpolate(d3.interpolateRound);
    const zy = d3.event.transform.rescaleY(y2).interpolate(d3.interpolateRound);
    gGrid.call(grid(), zx, zy);

}

var tooltip = d3.select('.canvas').append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .attr("id", "textbox")
                .style("background-color", "white")
                .style("position", "absolute")
                .style("border", "solid")
                .style("border-width", "1.5px")
                .style("border-radius", "5px")
                .style("border-color", "#a5a4a3")
                .style("padding", "5px")
                .style("font-family", "Courier")
                .style("font-size", "15px")

export function textbox(g, d, i){

    tooltip.html("Instance #" + String(i) + " <br>Label: " + label_[d.target] + " <br>Pred.: " + label_[d.pred] + " ")
            .style("left", (d3.event.pageX + "px"))
            .style("top", (d3.event.pageY - 170 + "px"))
            .style("opacity", 1)

}

export function remove_textbox(){
    tooltip.style("opacity", 0);
}

export function setCircleHover(canvas1, canvas, k, zoom){

    canvas1.selectAll('.circle_group')
        .on("mouseover", function(d, i) {
            hoverCir(d3.select(this), k);
            textbox(canvas, d, i);
        })
        .on("mousemove", function(d, i) {
            textbox(canvas, d, i);
        })
        .on("mouseout", function(d, i) {
            unhoverCir(d3.select(this), k);
            //remove textbox
            remove_textbox();
        })
        .on("click", function(d, i) {

            remove_textbox();//for safari

            canvas1.select(".dot_highlight").remove();

            //obtain the properties of the circle we're trying to replicate
            var trans_ = d3.select(this).attr("transform")
            var cir_color = d3.select(this).select('.dot').style("fill")
            var arc_color = d3.select(this).select('.arc').style("fill")

            var dot_highlight = canvas1.append('g')
                .attr('class', 'dot_highlight')
                .append('svg')
                .append('g')
                .attr('class', 'highlight_group')
                .attr('idx', i)
                .attr('transform', String(trans_))

            dot_highlight.append('circle')
                .attr('class', 'cir_highlight')
                .attr('r', 15/k)
                .style("fill", cir_color)
                .attr('stroke', '#111010')
                .attr('stroke-width', 0.3/k)

            dot_highlight.append("path")
                .attr('class', 'arc_highlight')
                .style("fill", arc_color)
                .attr('d',drawArc(14.6, k))

            dot_highlight.call(expandCir, d, i)

            var x = -x1(d.x) + 250/k;
            var y = -y1(d.y) + 250/k;

            canvas1.transition()
                .duration(600)
                .ease(d3.easeBack)
                .call(
                    zoom.transform,
                    d3.zoomIdentity.translate(0, 0).scale(k).translate(x, y)
                );

        })

}

var expandCir = function expandCircle(g, d, i) {

    g.select('circle')
        .transition()
        .duration(200)
        .attr('r', 20/k)

    g.select('path')
        .transition()
        .duration(200)
        .attr('d',drawArc(19.8, k))
        .on('end', function() {

            g.on('mouseover', function() {
                textbox(d3.select('.canvas'), d, i);

                //hovering circle enlarges it
                g.select('.cir_highlight').transition("mousehover")
                    .duration(60)
                    .attr("r", 25/k)

                g.select('.arc_highlight').transition("mousehover")
                    .duration(60)
                    .attr('d', drawArc(24.8, k));
            })
            .on('mousemove', function() {
                textbox(d3.select('.canvas'), d, i);
            })
            .on('mouseout', function() {
                remove_textbox();
                //reset circle size
                g.select('.cir_highlight').transition("mousehover")
                    .duration(60)
                    .attr("r", 20/k)

                g.select('.arc_highlight').transition("mousehover")
                    .duration(60)
                    .attr('d', drawArc(19.8, k));
            })

        })

}

export function removeHighlight(canvas1, data, k) {

    canvas1.select(".highlight_group")
        .transition()
        .duration(600)
        .attr("transform", function(d) {
            return "translate(" + x1(data[d3.select(this).attr('idx')].x)  + "," + y1(data[d3.select(this).attr('idx')].y)  + ")";
        })
        .on('end', function(){
            canvas1.select(".dot_highlight").remove();
        })

    canvas1.select('.cir_highlight')
        .transition()
        .duration(600)
        .attr('r', 0.1/k)
        .attr('stroke-width', 0.1/k)
        .style("opacity", 0)

    canvas1.select('.arc_highlight')
        .transition()
        .duration(600)
        .attr('d', drawArc(0.1, k))
        .style("opacity", 0)

}

export function initiateContour(canvas1, data) {

    for (let i = 0; i < 10; i++) {

        // compute the density data
        var densityData = d3.contourDensity()
                            .x(function(d) { return x1(d.x); })   // x and y = column name in .csv input data
                            .y(function(d) { return y1(d.y); })
                            .size([500, 500])  // smaller = more precision in lines = more lines
                            .bandwidth(20)
                            .thresholds([0.005])
                            (data.filter(function(d) { return d.pred == i;}))

        // Add the contour: several "path"
        canvas1.selectAll()
            .data(densityData)
            .enter()
            .select(".contour_container")
            .append("path")
            .attr("class", "contour")
            .attr("id", "contour" + i)
            .attr("d", d3.geoPath())
            .attr("fill", map_[i])
            .attr("fill-opacity", 0.2)
            .attr("stroke", map_[i])
            .attr("stroke-opacity", 0.5)
            .attr("stroke-linejoin", "round")
            .style("opacity", 0)
            .attr("transform", "translate(0,0)");

    }

}

export function loadContour(canvas1, data, k, contour_on){

    //testing contour
    for (let i = 0; i < 10; i++) {

        // compute the density data
        var densityData = d3.contourDensity()
                            .x(function(d) { return x1(d.x); })   // x and y = column name in .csv input data
                            .y(function(d) { return y1(d.y); })
                            .size([500, 500])  // smaller = more precision in lines = more lines
                            .bandwidth(20)
                            .thresholds([0.005])
                            (data.filter(function(d) { return d.pred == i;}))

        canvas1.selectAll()
            .data(densityData)
            .enter()
            .select(".contour_container")
            .append("path")
            .attr("class", "temp_contour")
            .attr("id", "contour" + i)
            .attr("d", d3.geoPath())
            .attr("fill", map_[i])
            .attr("fill-opacity", 0.2)
            .attr("stroke", map_[i])
            .attr("stroke-opacity", 0.5)
            .attr("stroke-linejoin", "round")
            .style("opacity", 0)
            .attr("transform", canvas1.select('.contour').attr("transform"))
            .attr("stroke-width", 1.0/k)
    }

}

//separated from loadContour for safari
export function changeContour(canvas1, contour_on) {

    canvas1.selectAll('.contour')
        .attr("id", "contour_remove")
        .transition()
        .duration(360)
        .style("opacity", 0)
        .on("end", function(){d3.select(this).remove();})

    canvas1.selectAll('.temp_contour')
        .transition()
        //.delay(240)
        .duration(360)
        .style("opacity", contour_on && 1)
        .on("end", function(){d3.select(this).attr("class", "contour");})

}

export function pathTween(d1, precision, self) {

    return function() {
        var path0 = self,
            path1 = path0.cloneNode(),
            n0 = path0.getTotalLength(),
            n1 = (path1.setAttribute("d", d1), path1).getTotalLength();

        // Uniform sampling of distance based on specified precision.
        var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
        while ((i += dt) < 1) distances.push(i);
        distances.push(1);

        // Compute point-interpolators at each distance.
        var points = distances.map(function(t) {
            var p0 = path0.getPointAtLength(t * n0),
                p1 = path1.getPointAtLength(t * n1);
            return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
        });

        return function(t) {
            return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : d1;
        };
    };
}

//original code for pathTween animation
/*
const contour = document.getElementsByClassName('contour');

const temp_contour = canvas1
                        .selectAll("contour")
                        .data(densityData)
                        .enter()
                        .append("path")
                        .attr('id','temp_contour')
                        .attr('visibility', 'hidden')
                        .attr("d", d3.geoPath())

// Add the contour: several "path"
canvas1.selectAll("contour")
    .data(densityData)
    .enter()
    .select("#contour" + i)
    .transition()
    .duration(360)
    .attr("d", d3.geoPath())
    .attrTween("d", scatter_utils.pathTween(temp_contour.attr('d'), 4, contour[i]))

temp_contour.remove();
*/
