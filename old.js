var dataset = {
  nodes: [
    {
      name: "A",
    },
    {
      name: "B",
    },
    {
      name: "C",
    },
  ],
  edges: [
    {
      source: 0,
      target: 0,
    },
    {
      source: 1,
      target: 0,
    },
    {
      source: 2,
      target: 1,
    },
  ],
  stringName: [
    {
      name: "a+b",
    },
    {
      name: "a+c",
    },
    {
      name: "b",
    },
  ],
};

var w = 1200;
var h = 920;
//distance between nodes
var linkDistance = 200;
var colors = d3.scale.category10();
let svg;

var force = "";
var edges = "";
var nodes = "";
var nodelabels = "";
var edgelabels = "";

function initiateSVG() {
  svg = d3.select(".svg").append("svg").attr({
    width: w,
    height: h,
  });
}

function initChart() {
  force = d3.layout
    .force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([w, h])
    .linkDistance([linkDistance])
    .charge([-500])
    .theta(0.1)
    .gravity(0.05)
    .start();

  edges = svg
    .selectAll("path")
    .data(dataset.edges)
    .enter()
    .append("path")
    .style("fill", "none")
    .attr("id", function (d, i) {
      return "edge" + i;
    })
    .attr("marker-end", function (d) {
      return d.source == d.target ? "" : "url(#arrowhead)";
    })
    .style("stroke", "#ccc")
    .style("pointer-events", "none");

  nodes = svg
    .selectAll("circle")
    .data(dataset.nodes)
    .enter()
    .append("circle")
    .attr({
      r: 15,
    })
    .style("fill", function (d, i) {
      return colors(4);
    })
    .call(force.drag);

  nodelabels = svg
    .selectAll(".nodelabel")
    .data(dataset.nodes)
    .enter()
    .append("text")
    .attr({
      x: function (d) {
        return d.x;
      },
      y: function (d) {
        return d.y;
      },
      class: "nodelabel",
      stroke: "black",
    })
    .text(function (d) {
      return d.name;
    });

  edgelabels = svg
    .selectAll(".edgelabel")
    .data(dataset.edges)
    .enter()
    .append("text")
    .style("pointer-events", "none")
    .attr({
      class: "edgelabel",
      id: function (d, i) {
        return "edgelabel" + i;
      },
      "font-size": 20,
      fill: "#aaa",
    });

  edgelabels
    .append("textPath")
    .attr("link:href", function (d, i) {
      return "#edge" + i;
    })
    .style("pointer-events", "none")
    .text(function (d, i) {
      // console.log(dataset.stringName[i].name);
      return dataset.stringName[i].name;
    });

  svg
    .append("defs")
    .append("marker")
    .attr({
      id: "arrowhead",
      viewBox: "-0 -5 10 10",
      refX: 25,
      refY: 0,
      orient: "auto",
      markerWidth: 10,
      markerHeight: 10,
      xoverflow: "visible",
    })
    .append("svg:path")
    .attr("d", "M 0,-5 L 10 ,0 L 0,5")
    .attr("fill", "#ccc")
    .attr("stroke", "#ccc");

  force.on("tick", function () {
    edges.attr("d", function (d) {
      var x1 = d.source.x,
        y1 = d.source.y,
        x2 = d.target.x,
        y2 = d.target.y,
        dx = x2 - x1,
        dy = y2 - y1,
        dr = Math.sqrt(dx * dx + dy * dy),
        // Defaults for normal edge.
        drx = dr,
        dry = dr,
        xRotation = 0, // degrees
        largeArc = 0, // 1 or 0
        sweep = 1; // 1 or 0

      // Self edge.
      if (x1 === x2 && y1 === y2) {
        // Fiddle with this angle to get loop oriented.
        xRotation = -45;

        // Needs to be 1.
        largeArc = 1;

        // Change sweep to change orientation of loop.
        //sweep = 0;

        // Make drx and dry different to get an ellipse
        // instead of a circle.
        drx = 30;
        dry = 20;

        // For whatever reason the arc collapses to a point if the beginning
        // and ending points of the arc are the same, so kludge it.
        x2 = x2 + 1;
        y2 = y2 + 1;
      }

      return (
        "M" +
        x1 +
        "," +
        y1 +
        "A" +
        drx +
        "," +
        dry +
        " " +
        xRotation +
        "," +
        largeArc +
        "," +
        sweep +
        " " +
        x2 +
        "," +
        y2
      );
    });

    nodes.attr({
      cx: function (d) {
        return d.x;
      },
      cy: function (d) {
        return d.y;
      },
    });

    edgelabels
      .selectAll("textPath")
      .attr("xlink:href", function (d, i) {
        return "#edge" + i;
      })
      .attr("startOffset", function (d, i) {
        var arcLength = d3
          .select("#edge" + i)
          .node()
          .getTotalLength();
        var textLength = d3
          .select("#edgelabel" + i)
          .node()
          .getComputedTextLength();
        var offset = (arcLength - textLength) / 2;
        return offset;
      });
    nodelabels
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      });
  });
}

function clearGraph() {
  let alpha; // This will save alpha when stopped.

  // Stop and remove after 1 second.
  alpha = force.alpha(); // Save alpha.
  force.stop(); // Stop the force.
  svg.remove(); // Dump the SVG.
}

function onAddNode() {
  clearGraph();
  // adding a new node, edge and string
  const nodeName = `${$("#nodeName").val()}`;
  const edgeInput = `${$("#edgeInput").val()}`;
  const edgeSource = `${$("#edgeSource").val()}`;
  const edgeTarget = `${$("#edgeTarget").val()}`;

  dataset["nodes"].push({
    name: nodeName || "D",
  });
  dataset["stringName"].push({
    name: edgeInput || "c",
  });
  dataset["edges"].push({
    source: parseInt(edgeSource) || 2,
    target: parseInt(edgeTarget) || 3,
  });
  initiateSVG();
  initChart();
}
$(document).ready(function () {
  initiateSVG();
  initChart();
});
