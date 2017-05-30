/**Store current attribute name for merging*/
mergeParent = "";

/**The data structure, which is defined in datastructure.js*/
datastructure = {};
/**List for elements to merge*/
merge = [];

//var width = 960, height = 960;

/**Scale for scaling the relevance bar*/
relevanceScale = d3.scaleLinear()
         .domain([0,1])
         .range([-0.1, 0.1]);

/**svg of the projection view*/
svg = d3.select("#projectionView")
    .attr("width", '100%')
    .attr("height", $("svg").width());

/**svg of the voronoi diagram*/
gVoronoi = svg.append("g")
    .attr("width", '100%')
    .attr("height", $("svg").width());

/**svg for the circles in the voronoi diagram*/
gVoronoiCircle = svg.append("g");

/**svg for the row projections (observations)*/
gRowProj = svg.append("g")
    .attr("width", '100%')
    .attr("height", $("svg").width());

/**The list for the dimensions view*/
ul = d3.select("#dimViewList")
    .attr("width", '100%')
    .attr("height", '100%');

/**Show the observations as overlay*/
showObservation = false;
d3.select("#cont1").style("min-height", $("svg").width());

/**Svg for the bar chart of the x-axis*/
barChartX = svg.append("svg");

/**Svg for the bar chart of the y-axis*/
barChartY = svg.append("svg");

/**Svg for the bar chart of the error-axis*/
barChartError = svg.append("svg");
dropdown = d3.select("#selectAttr")
filterList = d3.select("#filterViewList")

width = $("svg").width();
height = width;

/** Scale for the x-axis projection*/
xScale = d3.scaleLinear()
         .domain([-2,2])
         .range([0, width]);

/** Scale for the y-axis projection*/
yScale = d3.scaleLinear()
         .domain([-2,2])
         .range([0, height]);

/**Sort attributes by name*/
$("#attrClick").click(function(){
    ul.selectAll(".dimAttr").sort(function(a,b){ return stringCompare(a.name,b.name);});
});

/** sort values by total sum*/ 
$("#valueClick").click(function(){
    ul.selectAll(".dimVal").sort(function(a,b){ return a.sum < b.sum;});
});

/** sort attributes by relevance*/
$("#relevanceClick").click(function(){
    ul.selectAll(".dimAttr").sort(function(a,b){ return a.relevance < b.relevance;});
});

/**Helper for string comparison*/
function stringCompare(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : a == b ? 0 : -1;
}

/**open a certain view by button click*/
function openView(viewName) {
    var i;
    var x = document.getElementsByClassName("view");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(viewName).style.display = "block";
}

/**Apply value merging on datastructure*/
function mergeValues(){
    datastructure.merge(merge.sort(), mergeParent);
    selectChange(mergeParent)
}

/**Apply value splitting on datastructure*/
function splitValues(){
    datastructure.split(merge.sort(), mergeParent);
    selectChange(mergeParent);
}

/**Redraw all parts of the interface*/
function redraw(){
    datastructure.setCopyHeaderActive();
    
    calculateProjection(datastructure.indicatorMatrix);
    
    drawDimensionsView(datastructure.headerData);
    
    drawFilterView(datastructure.headerCopy);
}

/**Draw the dimensions view*/
function drawDimensionsView(data){

    xBarScale = d3.scaleLinear()
         .domain([0,1])
         .range([0, 200]);

    var parent = ul;

    parent.selectAll("div").remove();
    var gg = parent.selectAll("div")
        .data(data)
        .enter()

    var list = gg.append("div").filter(function(d) {;return !d.filtered}).classed("w3-cell-row", true).classed("dimAttr", true).style("width","100%");
    list.append("div")
        .filter(function(d) {;return !d.filtered})
        .style("width", "75%")
        .classed("w3-cell", true)
        .style("background-color", function(d){ return d.color;})
        .text(function (d, i) {
        return d.name;
    })
        .on("click", expand)

    list.append("div").classed("w3-cell", true).style("width", "25%").append("svg")
            .attr("height", 20)
            .append("rect")
            .attr("width", function(d, i) {return (d.relevance) * 100;})
            .attr("height", 20)
            .attr("fill", "steelblue");

    function expand() {
        var g = d3.select(this)
            .on("click", collapse)
            .append("div")
            .style("background-color", 'white')
            .selectAll("div")
            .data(function (d, i) {
                return d.values;
        }) .enter()


        var listElement = g.append("div")
            .style("background-color", 'white')
            .classed("w3-cell-row", true)
            .classed("dimVal", true);

        listElement.append("div").classed("w3-cell", true).classed("w3-container", true).text(function (d, i) { return d.getName() + "# ";}).style("width", "75%");
        listElement.append("div").classed("w3-cell", true).classed("w3-container", true).style("width", "20%").append("svg")
            .attr("height", 20)
            .append("rect")
            .attr("width", function(d) { return (d.sum) * 100;})
            .attr("height", 20)
            .attr("fill", "steelblue");
    }

    function collapse() {
        d3.select(this)
            .on("click", expand)
            .select("div")
            .remove();
    }

}

/**Draw the voronoi diagram of the projection of the attributes of the values*/
function drawColumnProjection(delta = 0.000000000001){
    var width = $("svg").width();
    var height = width;

    var dataset = datastructure.getFlatJSON(delta);

    //create a new view on the dataset, where the data on <delta distance is rolled up
    var datasetRollup = d3.nest()
      .key(function(d) { return d.id; })
      .rollup(function(v) { return {
        count: v.length,
        color: v.map(function(d) {return d.color}),
        xCoord: d3.mean(v, function(d) { return d.xCoord; }),
        yCoord: d3.mean(v, function(d) { return d.yCoord; }),
        relevance: d3.mean(v, function(d) { return d.relevance; }),
        name:  v.map(function(d) {return {attrName: d.attrName, name: d.getName()}; })
      }; })
      .entries(dataset);

    //Filter data which is merged by distance
    var datasetRollupFiltered = datasetRollup.filter(function(d){return d.value.count > 1});


    xScale = d3.scaleLinear()
         .domain([-1,1])
         .range([0, width]);

    yScale = d3.scaleLinear()
         .domain([-1,1])
         .range([0, height]);

    xScale.domain([1.1 * d3.min(datasetRollup, function(d) { return d.value.xCoord; }), 1.1 * d3.max(datasetRollup, function(d) { return d.value.xCoord; })]);            
    yScale.domain([1.1 * d3.min(datasetRollup, function(d) { return d.value.yCoord; }), 1.1 * d3.max(datasetRollup, function(d) { return d.value.yCoord; })]);
    relevanceScale.domain([1.1 * d3.min(datasetRollup, function(d) { return d.value.relevance; }), 1.1 * d3.max(datasetRollup, function(d) { return d.value.relevance; })]);


      // transition
      var t = d3.transition()
          .duration(750);

      // voronoi tesselation
      var voronoi = d3.voronoi()
        .extent([[-1, -1], [width + 1, height + 1]])
        .x(function(d) { return xScale(d.value.xCoord); })
        .y(function(d) { return yScale(d.value.yCoord); });


      // JOIN
        var voronoiGroup = gVoronoi.selectAll(".voronoi")
        .data(voronoi(datasetRollup).polygons(), function(d){return d.key;})
        .attr('pointer-events', 'all')

      // EXIT
      voronoiGroup.exit()
          .style("fill", function(d,i) {if(d.data.value.count > 1) return d3.rgb(211,211,211); else return d.data.value.color;})
        .transition(t)
          .style("opacity", 1e-6)
          .remove();

      // UPDATE
      voronoiGroup
        .transition(t)
          .delay(250)
          .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
          .style("fill", function(d,i) {if(d.data.value.count > 1 || showObservation) return d3.rgb(211,211,211); else return d.data.value.color;});

      // ENTER
      voronoiGroup.enter().append("path")
      .on("mouseover", (d) => tip.show(d.data.value))
        .on("mouseout",  tip.hide)
          .attr("class", "voronoi")
          .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
          //.attr("class", function(d,i) { return "voronoi " + d.key; })
          .style("fill", function(d,i) {if(d.data.value.count > 1) return d3.rgb(211,211,211); else return (d.data.value.color)[0].darker(relevanceScale(d.data.value.relevance)*3);})
          .style("opacity", 1e-6)
          .transition(t)
          .delay(250)
          .style("opacity", 1)

      /* Draw center of the voronoi diagrams
    var points =  gVoronoi.selectAll("circle").data(datasetRollup, function(d) { return d; });


    points.enter().append("circle")
          .attr("cx", function(d) { return xScale(d.value.xCoord); })
          .attr("cy", function(d) { return yScale(d.value.yCoord); })
          .attr("r", function (d) { return 3; })
          .style("fill", function(d) { return "red"; })
          .style("opacity", 1)
          .merge(points);

    points.exit().remove(); */

    gVoronoiCircle.selectAll("g").remove();

    //draw the center points for distance merged cells
    var points2 = gVoronoiCircle.selectAll("g").data(datasetRollupFiltered, function(d) {return d});
    points2.remove();

    if(delta * width / 10 < 5 )
        delta = 50 / width;

    var points2Circle = points2.enter()
                            .append("g")
                            .selectAll("circle")
                            .data(function(d) {return d.value.color})
                            .enter()
                            .append("circle")
                            .attr("cx", function(d) {return xScale((d3.select(this.parentNode).data()[0]).value.xCoord); })
                            .attr("cy", function(d) { return yScale((d3.select(this.parentNode).data()[0]).value.yCoord); })
                            .on("mouseover", function(d) { tip.show((d3.select(this.parentNode).data()[0]).value) })
                            .on("mouseout",  tip.hide)
                            .style("fill", function(d) { return d; })
                            .attr("r", function (d,i) {return delta * width / 10 - i * 0.1 * width * delta / (d3.select(this.parentNode).data()[0]).value.count; })
                            .transition(t).delay(250);


    //calculate Area of polygons
    var voronoi2 = d3.voronoi()
        .extent([[-1, -1], [width - 1, height - 1]])
        .x(function(d) { return xScale(d.xCoord); })
        .y(function(d) { return yScale(d.yCoord); });
    var polygons = voronoi2.polygons(dataset);
    
    var area = {};
    var sumArea = 0;

    polygons.forEach(function(polygon){
        var sum = 0;
        for(var i = 1; i <= polygon.length; i++){
               sum += polygon[i % polygon.length][0] * (polygon[(i-1) % polygon.length][1] - polygon[(i+1) % polygon.length][1]);
        } 
        sum = sum / 2;
        sumArea += sum;

        area[polygon.data.index] = sum;
    });

    for(var key in area) {
        if(area.hasOwnProperty(key)) {
            area[key] *= 100 / sumArea;
        }
    }
    datastructure.setArea(area);

    }

/**Overlay for hovering a voronoi cell */
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-1, 0])
  .direction('e')
  .html(function(d,i) {
        var string = "<div class='tooltip'>";

      var dRollup = d3.nest()
        .key(function(d) { return d.attrName; })
        .entries(d.name);

    dRollup.forEach(function(elem){
        string = string + "<strong>" + elem.key + ":</strong> ";
        elem.values.forEach(function(value){
            string = string + value.name + ", ";
        });
        string = string + "<br>";
    });
        //"              
    return string + "</div>";
  });
gVoronoi.call(tip);


/**Overlay for hovering a observation */
var tipPoint = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-1, 0])
  .direction('e')
  .html(function(d,i) {
        if(!d)
            return "";

        var string = "<div class='tooltip'>";
        string =  string + d;   
    return string + "</div>";
  });
gRowProj.call(tipPoint);

/**Update delta if the slider is moved*/
function updateSlider(value){
    drawColumnProjection(value);
}


/**Draw the overlay of observations*/
function drawRowProjection(attrName){

    var width = $("svg").width();
    var height = width;


    gRowProj.style("opacity", showObservation ? 1.0 : 0.0);    

    var colorArray = datastructure.getColorByObservation(attrName);

    var points =  gRowProj.selectAll("circle").data(colorArray, function(d) { return d; });
    points.enter().append("circle")
          .attr("cx", function(d) { return xScale(d.coord.x); })
          .attr("cy", function(d) { return yScale(d.coord.y); })
          .attr("r", function (d) { return 3; })
          .style("fill", function(d) { return d.color; })
          .style("opacity", 0.7)
          .on("mouseover", (d) => tipPoint.show(d.name))
          .on("mouseout",  tipPoint.hide)
          .attr('pointer-events', showObservation ? 'all' : 'none')
          .merge(points);

    points.exit().remove(); 


}

/**If the show Observations button is clicked, show the observations and set the color of the voronoi cells to a grayscale. If clicked again, reverse it*/
function showObservations(){
    showObservation = !showObservation;

    var t = d3.transition().duration(750);
    var opacity = showObservation ? 1 : 0;

    gRowProj.transition(t).delay(250).style("opacity", opacity);

    var voronoiGroup = gVoronoi.selectAll(".voronoi");
    voronoiGroup.transition(t).delay(250)
        .style("fill", function(d,i) {if(d.data.value.count > 1 || showObservation) return d3.rgb(211,211,211).darker(relevanceScale(d.data.value.relevance)); else return d.data.value.color;});

    if(showObservation){
        gVoronoi.selectAll(".voronoi").attr('pointer-events', 'none');
        gRowProj.selectAll("circle").attr('pointer-events', 'all');
    }
    else{
        gVoronoi.selectAll(".voronoi").attr('pointer-events', 'all');
        gRowProj.selectAll("circle").attr('pointer-events', 'none');
    }

}

/**Draw the bar chart for the y-axis of the projection*/
function drawYBarChart(){
    var widthSVG = $("svg").width();
    width = widthSVG/5;
    height = width/2;

    marginTop = width * 0.05;
    marginBottom = width * 0.10;
    marginLR = width * 0.05;

    widthChart = width - 2*marginLR;
    heightChart = height - marginBottom - marginTop;

    var data = datastructure.headerData.filter(function(d) {return !d.filtered; })

    var x = d3.scaleBand().rangeRound([0, widthChart]).padding(0.1),
        y = d3.scaleLinear().rangeRound([heightChart-1, 0]);

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d){ return d.yWeight;})]);

    barChartY.select(".bgRect").remove();
    barChartY.select("text").remove();

    //append a white rectangle as background
    barChartY.append("rect")
        .classed("bgRect", true)
        .style("fill", 'white')
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate("+ (widthSVG*0.05) +","+(widthSVG*0.05)+")")
        .style("opacity", 0.7);
    
    //append the text
    barChartY.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (widthSVG*0.05 + marginLR + widthChart/2) +","+ (widthSVG*0.05 + heightChart + marginTop +marginBottom * 0.66) +")")  // centre below axis
        .style("font-size", "0.7vw")
        .text("Dims. important for Y");

    //Draw new bars
    barChartY.selectAll(".bar").remove();
    var bars = barChartY.selectAll(".bar").data(data).enter().append("rect");

        bars.attr("class", "bar")
        .attr("x", function(d,i) { return x(d.name); })
        .attr("y", function(d) { return y(d.yWeight); })
        .style("fill", function(d) { return d.color;})
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return heightChart - y(d.yWeight); })
        .attr("oppacity", 0.7)
        .attr("transform", "translate("+ (widthSVG*0.05 + marginLR) +","+ (widthSVG*0.05 + marginTop) +")")
        .on('click', function(d,i){ drawRowProjection(d.name);});

}

/**Draw the bar chart for the x-axis of the projection. This is the same as for the y-bar chart*/
function drawXBarChart(){
    var widthSVG = $("svg").width();
    width = widthSVG/5;
    height = width/2;

    marginTop = width * 0.05;
    marginBottom = width * 0.10;
    marginLR = width * 0.05;

    widthChart = width - 2*marginLR;
    heightChart = height - marginBottom - marginTop;

    var data = datastructure.headerData.filter(function(d) {return !d.filtered; })

    var x = d3.scaleBand().rangeRound([0, widthChart]).padding(0.1),
        y = d3.scaleLinear().rangeRound([heightChart-1, 0]);

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d){ return d.xWeight;})]);

    barChartX.select(".bgRect").remove();
    barChartX.select("text").remove();

    barChartX.append("rect")
        .classed("bgRect", true)
        .style("fill", 'white')
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate("+ (widthSVG*0.95 - width) +","+(widthSVG*0.95 - height)+")")
        .style("opacity", 0.7);
    
    barChartX.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (widthSVG*0.95 + marginLR + widthChart/2 - width) +","+ (widthSVG*0.95 + heightChart + marginTop +marginBottom * 0.66  - height) +")")  // centre below axis
        .style("font-size", "0.7vw")
        .text("Dims. important for X");

    barChartX.selectAll(".bar").remove();

    var bars = barChartX.selectAll(".bar").data(data).enter().append("rect");

        bars.attr("class", "bar")
        .attr("x", function(d,i) { return x(d.name); })
        .attr("y", function(d) { return y(d.xWeight); })
        .style("fill", function(d) { return d.color;})
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return heightChart - y(d.xWeight); })
        .attr("oppacity", 0.9)
        .attr("z-index", 10)
        .attr("transform", "translate("+ (widthSVG*0.95 + marginLR - width) +","+ (widthSVG*0.95 + marginTop  - height) +")")
        .on('click', function(d,i){ drawRowProjection(d.name);});

}

/**Draw the bar chart for the error-axis of the projection. This is the same as for the y-bar chart*/
function drawErrorBarChart(){
    var widthSVG = $("svg").width();
    width = widthSVG/5;
    height = width/2;

    marginTop = width * 0.05;
    marginBottom = width * 0.10;
    marginLR = width * 0.05;

    widthChart = width - 2*marginLR;
    heightChart = height - marginBottom - marginTop;

    var data = datastructure.headerData.filter(function(d) {return !d.filtered; })

    var x = d3.scaleBand().rangeRound([0, widthChart]).padding(0.1),
        y = d3.scaleLinear().rangeRound([heightChart-1, 0]);

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d){ return d.errorWeight;})]);

    barChartError.select(".bgRect").remove();
    barChartError.select("text").remove();

    barChartError.append("rect")
        .classed("bgRect", true)
        .style("fill", 'white')
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate("+ (widthSVG*0.95 - width) +","+(widthSVG*0.05)+")")
        .style("opacity", 0.7);
    
    barChartError.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (widthSVG*0.95 + marginLR + widthChart/2 - width) +","+ (widthSVG*0.05 + heightChart + marginTop +marginBottom * 0.66) +")")  // centre below axis
        .style("font-size", "0.7vw")
        .text("Projection Error");

    barChartError.selectAll(".bar").remove();

    var bars = barChartError.selectAll(".bar").data(data).enter().append("rect");

        bars.attr("class", "bar")
        .attr("x", function(d,i) { return x(d.name); })
        .attr("y", function(d) { return y(d.errorWeight); })
        .style("fill", function(d) { return d.color;})
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return heightChart - y(d.errorWeight); })
        .attr("oppacity", 0.9)
        .attr("z-index", 10)
        .attr("transform", "translate("+ (widthSVG*0.95 + marginLR - width) +","+ (widthSVG*0.05 + marginTop) +")")
        .on('click', function(d,i){ drawRowProjection(d.name);});

}

/**Populate the selector element with attributes*/
function drawFilterView(data){

    dropdown.selectAll("option").remove();

    var list = dropdown.selectAll("select")
        .data(data)
        .enter()
        .append("option")
        .text(function(d){return d.name;});
}

/**Draw the filter view when a attribute is selected*/
function selectChange(value){
    merge = [];
    mergeParent = value;
    var data = [];
    var checked = false;

    //console.log(datastructure.headerCopy);

    datastructure.headerCopy.forEach(function(entry){
        if(entry.name == value){
            data = entry.values;
            checked = entry.filtered;
        } 
    });

    $('#filterAttr').prop('checked', checked);
    $('#filterAttr').change(function () {
         datastructure.setFilteredAttribute(value, $("#filterAttr").is(":checked"));
   });

    filterList.selectAll("div").remove();

    filterList.selectAll("div")
        .data(data).enter()
        .append("div")
        .classed("w3-container", true)
        .classed("w3-theme-l4", function(d,i){return 0 != i % 2;})
        .classed("w3-theme-l4", function(d,i){return 0 == i % 2;})
        .html(function(d,i) {
             return '<div class="w3-container w3-half">' + d.getName() + '</div><div class="w3-container w3-half">' + parseFloat(d.area).toFixed(2) + '</div>';
         })
        .on("click", select);

    function select(){
        var elem = d3.select(this);

        elem.classed("w3-theme-l2", true)
            .on("click", deselect);

        merge.push(elem.data()[0].getIndex())
    }

    function deselect(){
        var elem = d3.select(this);

        elem.classed("w3-theme-l2", false)
            .on("click", select);

        var i = merge.indexOf(elem.data()[0].getIndex());
        if(i != -1) {
            merge.splice(i, 1);
        }
    }
}


/**Set the relevance of the values. This uses the callback from the background calculation
*param{array} Array of relevance values
*/
function setRelevance(relevance){

    datastructure.headerData.forEach(function(entry){
        var relevTemp = 0.0;

        entry.values.forEach(function(child){
           child.relevance = relevance[child.getIndex()];
           relevTemp = relevTemp + relevance[child.getIndex()];
        }); 

        entry.relevance = relevTemp;
    }); 

    drawDimensionsView(datastructure.headerData);
}

/**Set the column sum of the values. This uses the callback from the background calculation
*param{array} Array of column sum
*/
function setColSum(colSum){

    datastructure.headerData.forEach(function(entry){
        entry.values.forEach(function(child){
           child.sum = colSum.val[child.getIndex()];
        }); 
    });
}

/**Set the coordinates of the observations. This uses the callback from the background calculation
*param{array} Array of row coordinates (x AND y)
*/
function setXCoord(coords){

    var data = [];

    for(var i = 0; i < coords.val.length; i += 2){
        data.push({x : coords.val[i], y : coords.val[i+1]});
    }

    datastructure.setRowCoordinates(data);
    drawRowProjection(null);
}

/**Set the coordinates of the values. This uses the callback from the background calculation
*param{array} Array of column coordinates (x AND y)
*/
function setYCoord(coords){
    var data = [];

    for(var i = 0; i < coords.val.length; i += 2){
        data.push({x : coords.val[i], y : coords.val[i+1], color : datastructure.colors[(i/2)]});
    }

    datastructure.setColumnCoordinate(data);
    drawColumnProjection(0.0000001);
}

/**Set the x-weights of the values. This uses the callback from the background calculation
*param{array} Array of column x-weights
*/
function setXBarChart(result){
    datastructure.headerData.forEach(function(entry){
        var sum = 0;
        entry.values.forEach(function(child){
            sum += result[child.getIndex()];
            child.xWeight = result[child.getIndex()];
        }); 

        entry.xWeight = sum;
    });

    drawXBarChart();
}

/**Set the error-weights of the values. This uses the callback from the background calculation
*param{array} Array of column error-weights
*/
function setErrorBarChart(result){
    datastructure.headerData.forEach(function(entry){
        var sum = 0;
        entry.values.forEach(function(child){
            sum += result[child.getIndex()];
        }); 

        entry.errorWeight = sum;
    });

    drawErrorBarChart();
}

/**Set the y-weights of the values. This uses the callback from the background calculation
*param{array} Array of column y-weights
*/
function setYBarChart(result){
    datastructure.headerData.forEach(function(entry){
        var sum = 0;
        entry.values.forEach(function(child){
            sum += result[child.getIndex()];
            child.yWeight = result[child.getIndex()];
        }); 

        entry.yWeight = sum;
    });

    drawYBarChart();
}

/**The core of the program. Here the background calculation is initiated. Multiple web workers are used, which rely on calculations of previous web workers. This is necessary because of the garbage collector*/
function calculateProjection(data){
    
        //hide observations
        $( "#observationButton" ).prop( "disabled", true );
        showObservation = true;
        showObservations();


        //worker2.terminate();
        //worker3.terminate();
        //worker4.terminate();

        //initiate web workers
        worker = new Worker('calcWorker.js');
        worker2 = new Worker('calcWorker2.js');
        worker3 = new Worker('calcWorker3.js');
        worker4 = new Worker('calcWorker4.js');

        //start first webworker, which calculates everything up until the SVD
        worker.postMessage([datastructure.indicatorMatrix]);

        //on callback terminate itself and start webworker 2, which calculates the svd
        worker.onmessage = function(e) {
            worker.terminate();
            worker2.postMessage([e.data.Z]);

            //after the svd is calculated, the row and column calculations can be done seperately, which is good because the row calculations take much longer.
            worker2.onmessage = function(f) {
                worker2.terminate();
                worker3.postMessage([e.data, f.data]);
                worker4.postMessage([e.data, f.data, datastructure.headerData.length]);
            }
            //worker.terminate();
            setColSum(e.data.colSum);
        }

        //On callback of the row calculations, activate button to show observations
        worker3.onmessage = function(e) { 
            setXCoord(e.data.xCoord); 
            $( "#observationButton" ).prop( "disabled", false );
            worker3.terminate();
        };

        //On column worker callback draw voronoi and set bar charts and relevance
        worker4.onmessage = function(e) { 
            setRelevance(e.data.yx2);
            setYCoord(e.data.yCoord); 
            setXBarChart(e.data.wY1);
            setYBarChart(e.data.wY2);
            setErrorBarChart(e.data.wY3);
            worker4.terminate();
        };
}

/**Function which initiates the datastructure after a csv file is selected*/
function loadCSV(){
    var csv = $("#dataSelect").val();
    d3.csv(csv, function(data) {

        datastructure = new Datastructure(data);
        datastructure.init();

        calculateProjection(datastructure.indicatorMatrix);
        drawDimensionsView(datastructure.headerData);
        drawFilterView(datastructure.headerCopy);
    });
}