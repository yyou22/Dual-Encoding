var d3 = require('d3')

import {label_} from './app.js'

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

export function adjust_zoom_hover(canvas, k){

    //maintain size ratio
    canvas.selectAll('.dot').attr('r', 7/k).attr('stroke-width', 0.3/k)
    canvas.selectAll('.arc').attr('d', drawArc(6.6, k))
    canvas.selectAll('.contour').attr("stroke-width", 1.0/k)

    //FIXME: could possibly be combined
    canvas.selectAll('.circle_group')
        .on("mouseover", function(d, i) {
            hoverCir(d3.select(this), k);
            textbox(canvas, d, i);
        })
        .on("mousemove", function(d, i) {
            textbox(canvas, d, i);
        })
        .on("mouseout", function(d, i) {
            unhoverCir(d3.select(this), k);
            remove_textbox();
        })

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

export function setCircleHover(canvas1, canvas, k){

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
