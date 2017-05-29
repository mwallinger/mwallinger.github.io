function Value(name, attrName, index, sum, relevance, color, xWeight, yWeight, xCoord, yCoord){
    this.name = name;
    this.attrName = attrName;
    this.index = index;
    this.sum = sum;
    this.relevance = relevance;
    this.color = color;
    this.xWeight = xWeight;
    this.yWeight = yWeight;
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.id = 0;
    this.area = 0;
    
    this.next = null;
    this.last = null;
    
    this.getName = function (){
        if(this.next === null)
            return this.name;
        else
            return this.name + ", " + this.next.getName();
    }
    
    this.getIndex = function () {
        if(this.last === null){
            return this.index;
        } else {
            return this.last.getIndex();
        }
    }
    
    this.removeFromList = function(){
        this.next = null;
        this.last = null;
    }
    
    this.setNext = function(next){
        this.next = next;
    }
    
    this.setLast = function(last){
        this.last = last;
    }
    
    this.getHead = function(){
        if(this.next === null){
            return this;
        } else {
            return this.next.getHead();
        }
    }
    
    this.setIndex = function(index){
        this.index = index;
        
        if(this.next)
            this.next.setIndex(index);
    }
    
    this.getNext = function(){
        return this.next;
    }
    
    this.getLast = function(){
        return this.last;
    }
}

function Attribute(name, values, relevance, color, xWeight, yWeight, errorWeight, filtered){
    this.name = name;
    this.values = values;
    this.relevance = relevance;
    this.color = color;
    this.xWeight = xWeight;
    this.yWeight = yWeight;
    this.errorWeight = errorWeight;
    this.filtered = filtered;
    
    this.getName = function(){return this.name};
}

/*
Datastructure is the container object for the datastructe of the underlying data. The constructor takes as input a CSV object (must be parsed by D3)
*/
function Datastructure(data){
    this.data = data;
    this.drawableData = [];
    this.attributes = {};
    this.numAttributes = 2;
    
    this.indicatorMatrix = [];
    this.header = [];
    this.headerData = [];
    this.headerCopy = [];
    this.colors = [];
    this.nameToIndexMap = {};
    this.indicatorSize = 0;
    this.newIndicatorSize = 0;
    this.rowCoordinates = [];
    
    /*
    Init must be called before using the data. It initializes the data structure.
    */
    this.init = function(){
        var that = this;
        this.attributes = {};
        
        //get keys of the variables in the data set
        var headers = d3.keys(this.data[0]);

        headers.forEach(function(d){
            that.attributes[d] = {"attr": {}, "index" : 0};
        });
            
        //parse all attributes and keep as json map in the associated variable
        this.data.forEach(function(d){
            var temp = d3.entries(d);

            for(j=0;j<temp.length;j++){

                if(!(temp[j].value in that.attributes[headers[j]].attr)){
                    that.attributes[headers[j]].attr[temp[j].value] = 0;
                }
            }
        });

        //set index and color index to zero.
        var ind = 0;
        var colorInd = 0;
        var headerData = [];
        var colorArray = [];

        for(var key in that.attributes){
            that.attributes[key].index = ind;
            var childEntry = [];

            var color = getColor(colorInd);

            for(key2 in that.attributes[key].attr){
                this.attributes[key].attr[key2] = ind;
                childEntry.push(new Value(key2, key, ind, 0.0, 0.0, color, 0.0, 0.0, 0.0, 0.0))
                colorArray.push(color);
                ind++;
            }

            var entry = new Attribute(key, childEntry, 0.0, color, 0.0, 0.0, 0.0, false);
            this.headerData.push(entry);

            colorInd++;
        }

        this.indicatorSize = ind;
        this.newIndicatorSize = ind;
        this.createNameToIndexMap();
        //console.log(this.nameToIndexMap);
        this.calcIndicatorMatrix();
        //console.log(this.indicatorMatrix);
        
        //console.log(headerData);

        //this.header = attributes;
        //this.headerData = headerData;
        this.colors = colorArray;
        this.mergeList = [];
        
        
        this.copyHeader();
        //console.log(headerCopy);
    }
    
    /*function which calculates the header in list format for D3.js
    */
    this.calculateHeader = function(){
        
    }
    
    /*
    Function to merge the values of an attribute. List with indices of values to merge. Attribute name of the values.
    */
    this.merge = function(mergeList, mergeParent){
        console.log(mergeList);
        console.log(mergeParent);
        
        if(mergeList.length <= 1)
            return;
        
        var ind = 0;
        var mergeCounter = mergeList.length - 1;
        var first = true;
        var colorInd = 0;
        var last;
        var next = null;
        
        this.headerCopy.forEach(function (entry){
            if(entry.name == mergeParent){
                ind = ind + entry.values.length - 1 - mergeList.length + 1;
                for(var index = entry.values.length - 1; index >= 0; index--){
                    var child = entry.values[index];
                    console.log(child.getIndex());
                    if(child.getIndex() == mergeList[mergeCounter]){
                        if(mergeCounter == 0){
                            child.setIndex(ind--);
                            last = child.getHead();
                            last.setNext(next);
                            next.setLast(last);
                            console.log(child.getName());
                        }
                        else if(first){
                            next = child
                            first = false;
                            entry.values.splice(index, 1);
                        } else {
                            child.setNext(next);
                            next.setLast(child);
                            
                            next = child;
                            console.log(index);
                            console.log("test");
                            
                            entry.values.splice(index, 1);
                        }
                        
                        mergeCounter--;
                    } else {
                        child.setIndex(ind--);
                    }
                }
                
                ind = ind + (entry.values.length - mergeList.length + 1) + 2;
            } else {
                entry.values.forEach(function (child){
                    child.setIndex(ind++);                       
                });
            }
        });
        console.log(this.headerCopy);
        this.newIndicatorSize = ind;
    }
    
    this.split = function(splitList, splitParent){
        
        var ind = 0;
        var splitCounter = 0;
        var colorInd = 0;
        var last;
        var next;
        
        this.headerCopy.forEach(function (entry){
            if(entry.name == splitParent){
                entry.values.forEach(function (child, index, object){
                    if(child.getIndex() == splitList[splitCounter]){

                        next = child.getNext();
                        child.removeFromList();
                        var indexToInsert = index;
                        
                        while(next !== null){
                            var tmp = next.getNext();
                            next.removeFromList();
                            object.splice(++indexToInsert, 0, next);
                            next.setIndex(ind++);
                            next = tmp;
                        }
                        
                        splitCounter++;
                    } else {
                        child.setIndex(ind++);                 
                    }
                });
            } else {
                entry.values.forEach(function (child){
                    child.setIndex(ind++);                       
                });
            }
        });

        this.newIndicatorSize = ind;
    }
    
    this.copyHeader = function(){
        var that = this;
        console.log("copying header");
        this.headerCopy = [];
        
        this.headerData.forEach(function(entry){
            var childEntry = [];

            entry.values.forEach(function (child){
                var newChild = new Value(child.name, child.attrName, child.index, child.sum, child.relevance, child.color, child.xWeight, child.yWeight, child.xCoord, child.yCoord);
                
                var next = child.getNext();
                var last = newChild;
                
                while(next){
                    newNext = new Value(next.name, next.attrName, next.index, next.sum, next.relevance, next.color, next.xWeight, next.yWeight, next.xCoord, next.yCoord);
                    last.next = newNext;
                    newNext.last = last;
                    
                    next = next.getNext();
                }
                
                childEntry.push(newChild);
            });

            that.headerCopy.push(new Attribute(entry.name, childEntry, entry.relevance, entry.color, entry.xWeight, entry.yWeight, entry.errorWeight, entry.filtered));
        });
        
        console.log(this.headerCopy);
        //this.headerCopy = headerCopy;
    }
    
    this.setCopyHeaderActive = function(){
        console.log("Set header copy active")
        console.log(this.headerCopy);
        this.headerData = this.headerCopy;
        console.log(this.headerData);
        
        this.indicatorSize = this.newIndicatorSize;
        
        console.log("Calculate name to index map")
        this.createNameToIndexMap();
        console.log(this.nameToIndexMap);
        
        console.log("Calculate Indicator matrix")
        
        this.calcIndicatorMatrix();
        console.log(this.indicatorMatrix);
        
        this.copyHeader();
    }
    
    /*
    Helper function to create an index map for values of the attributes. This is needed to create the indicator matrix
    */
    this.createNameToIndexMap = function(){
        indexMap = {};
        var ind = 0;
        
        this.headerData.forEach(function(entry){
            entry.values.forEach(function (child){
                if(entry.filtered)
                    child.setIndex(-1);
                else
                    child.setIndex(ind++);
            });
        });
        
        this.headerData.forEach(function(attribute){
           var valueMap = {};
           attribute.values.forEach(function(value){
              valueMap[value.name] = value.getIndex();
               
               next = value.getNext();
               
               while(next){
                    valueMap[next.name] = next.getIndex();
                    next = next.getNext();
               }
           });
            
            indexMap[attribute.name] = valueMap;
        });
        
        this.indicatorSize = ind;
        this.nameToIndexMap = indexMap;
        console.log(this.nameToIndexMap);
        console.log("header");
        console.log(this.headerData);
    }
    
    this.calcIndicatorMatrix = function(){
        var indicatorMatrix = []
        var that = this;
        
        this.data.forEach(function(d){
            var temp = d3.entries(d);
            var row = Array.apply(null, Array(that.indicatorSize)).map(Number.prototype.valueOf,0);
            
            for(j=0;j<temp.length;j++){
                var ind = that.nameToIndexMap[temp[j].key][temp[j].value];

                if(ind >= 0){
                    row[ind] = 1;
                }
            }

            indicatorMatrix.push(row);
        });
        console.log(indicatorMatrix);
        this.indicatorMatrix = indicatorMatrix;
    }
    
    this.setColumnCoordinate = function(coords){
        this.headerData.forEach(function(attribute){
            if(!attribute.filtered)
                attribute.values.forEach(function(value){
                    value.xCoord = coords[value.getIndex()].x;
                    value.yCoord = coords[value.getIndex()].y;
                });    
        });
    }
    
    /**/
    this.getFlatJSON = function(delta){
        var flat = [];
        var id = 0;
        
        this.headerData.forEach(function(attribute){
            if(!attribute.filtered)
                attribute.values.forEach(function(value){
                    value.id = id++;
                    flat.push(value);
                });    
        });
        console.log(delta);
        for(var i = 0; i < flat.length; i++){
            for(var j = (i+1); j < flat.length; j++){
                if(isWithinDelta(delta, flat[i].xCoord, flat[i].yCoord, flat[j].xCoord, flat[j].yCoord)){
                    flat[j].id = flat[i].id;
                }
            }
        }
        
        return flat;
    }
    
    this.setFilteredAttribute = function(name, isFiltered){
        this.headerCopy.forEach(function(attribute){
            if(attribute.name == name){
                attribute.filtered = isFiltered;
            }
        });
    }
    
    this.getColorByObservation = function(catName){
        var colorArray = [];
        var that = this;
        
        if(catName != null){
            this.data.forEach(function(d, i){
                    var name = d[catName];
                   colorArray.push({color:getColor(that.nameToIndexMap[catName][name]), name: name, coord: that.rowCoordinates[i]});
            });
        } else {
            this.data.forEach(function(d, i){
                var name = d[catName];
               colorArray.push({color:d3.rgb(0,0,0), name: name, coord: that.rowCoordinates[i]});
            });
        }
        console.log(colorArray);
        
        return colorArray;
    }
    
    this.setRowCoordinates = function(coordinates){
        this.rowCoordinates = coordinates;
    }
    
    this.setArea = function(area){
        this.headerCopy.forEach(function(entry){
            entry.values.forEach(function (child){
                child.area = area[child.index];
            });
        });    
        
        console.log(this.headerCopy);
    }
}

function isWithinDelta(delta, x1, y1, x2, y2){
    return (Math.pow((x1-x2),2) + Math.pow((y1-y2),2)) < delta*delta;
}

//helper function which returns a color from the color wheel. Colors taken from ColorBrewer2.0
function getColor(index){
    var colors = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)'];
    var c = d3.hsl(colors[index % 10]);

    return c;
}