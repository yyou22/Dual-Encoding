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
