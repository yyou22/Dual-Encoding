var d3 = require('d3')

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

    canvas.selectAll('.circle_group')
        .on("mouseover", function(d, i) {
            hoverCir(d3.select(this), k);
        })
        .on("mouseout", function(d, i) {
            unhoverCir(d3.select(this), k);
        })

}

export function adjust_zoom_grid(canvas, x2, y2){

    const gGrid = canvas.select("g");
    const zx = d3.event.transform.rescaleX(x2).interpolate(d3.interpolateRound);
    const zy = d3.event.transform.rescaleY(y2).interpolate(d3.interpolateRound);
    gGrid.call(grid(), zx, zy);

}

export function textbox(g, d, i) {

        //add textbox
        g.append("rect")
            .attr("id", "r" + i)
            .attr('x', function() {
                return d3.mouse(this)[0] + 10;
            })
            .attr('y', function() {
                return d3.mouse(this)[1] - 85;
            })
            .attr("height", 70)
            .attr("width", function() {
                if (d.target == 0 || d.pred == 0) {
                    return 150;
                }
                if (d.target == 1 || d.pred == 1) {
                    return 170;
                }
                return 120;
            })
            .attr("fill", "#fef7f3")
            .attr("stroke", "#a5a4a3")

}
