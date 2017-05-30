/**
 * Represents a value. A value always belongs to an attribute. An attribute can have multiple values, which are in an array, and if two values are merged, one value is removed to from the array and appended to the reference
 * @constructor
 * @param {string} name - The name of the value.
 * @param {string} attrName - Name of the parent attribute.
 * @param {int} index - Index for reference in the visualization.
 * @param {int} sum - Total sum of entrys with this value.
 * @param {float} relevance - Value of relevance calculated by the MCA.
 * @param {d3.color} color - Color of the value in the visualization.
 * @param {float} xWeight - Contribution to the x-axis during the MCA.
 * @param {float} yWeight - Contribution to the y-axis during the MCA.
 * @param {float} xCoord - Coordinate on the x-Axis of the visualization.
 * @param {float} yCoord - Coordinate on the y-Axis of the visualization.
 */


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
    
    /** ID is used in the visualization to group voronoi cells by distance.*/
    this.id = 0;
    /** Area is the size of the area of the voronoi cell in % of the whole area.
    this.area = 0;
    
    /** Next element in the double linked list*/
    this.next = null;
    /** Last element in the double linked list*/
    this.last = null;
    
    /** Returns the name of itself, or recursivly of all appended values. */
    this.getName = function (){
        if(this.next === null)
            return this.name;
        else
            return this.name + ", " + this.next.getName();
    }
    
    /** Returns the index of itself, or recursivly of the first element in the list. */
    this.getIndex = function () {
        if(this.last === null){
            return this.index;
        } else {
            return this.last.getIndex();
        }
    }
    
    /** Remove element from list. */
    this.removeFromList = function(){
        this.next = null;
        this.last = null;
    }
    
    /** Set next element of list. */
    this.setNext = function(next){
        this.next = next;
    }
    
    /** Set last element of list. */
    this.setLast = function(last){
        this.last = last;
    }
    
    /** Get List head. */
    this.getHead = function(){
        if(this.next === null){
            return this;
        } else {
            return this.next.getHead();
        }
    }
    
    /** Set index of itself, and for all appended elements. */
    this.setIndex = function(index){
        this.index = index;
        
        if(this.next)
            this.next.setIndex(index);
    }
    
    /** Get next element in list*/
    this.getNext = function(){
        return this.next;
    }
    
    /** Get last element in list*/
    this.getLast = function(){
        return this.last;
    }
}


/**
 * Represents a value. A value always belongs to an attribute. An attribute can have multiple values, which are in an array, and if two values are merged, one value is removed to from the array and appended to the reference
 * @constructor
 * @param {string} name - The name of the attribute.
 * @param {Array} values - Name of the parent attribute.
 * @param {int} relevance - Index for reference in the visualization.
 * @param {int} color - Total sum of entrys with this value.
 * @param {float} xWeight - Value of relevance calculated by the MCA.
 * @param {d3.color} yWeight - Color of the value in the visualization.
 * @param {float} errorWeight - Contribution to the x-axis during the MCA.
 * @param {float} yWeight - Contribution to the y-axis during the MCA.
 * @param {float} filtered - Coordinate on the x-Axis of the visualization.
 */
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
    /**Raw data */
    this.data = data;
    this.drawableData = [];
    /**Name of attributes and name of associated values of attribute. Used for parsing */
    this.attributes = {};
    /**Number of Attributes */
    this.numAttributes = 2;
    
    /**Indicator matrix for the MCA */
    this.indicatorMatrix = [];
    /**Header data */
    this.header = [];
    /**Datastructure used to store the attributes. */
    this.headerData = [];
    /**Copy of header data datastructure. Filter and merging operations are applied to this before swapping it with the header data for recalculation */
    this.headerCopy = [];
    /**Array of used colors*/
    this.colors = [];
    /**Stores the mapping for an Attributes values name to an index in the indicator matrix*/
    this.nameToIndexMap = {};
    /**Number of columns in the indicatormatrix (columns) */
    this.indicatorSize = 0;
    /**Number of columns in the indicatormatrix after applying the filtering/merging */
    this.newIndicatorSize = 0;
    /**Array of observations calculated 2D coordinates */
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
        this.calcIndicatorMatrix();
        
        this.colors = colorArray;
        this.mergeList = [];
        
        
        this.copyHeader();
    }
       
    /**
    Function to merge the values of an attribute. 
    @param {Array} mergeList - List of indices of values to merge.
    @param {string} mergeParent - The name of the attribute which contains the values to merge.
    */
    this.merge = function(mergeList, mergeParent){
        
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
                        }
                        else if(first){
                            next = child
                            first = false;
                            entry.values.splice(index, 1);
                        } else {
                            child.setNext(next);
                            next.setLast(child);
                            
                            next = child;
                          
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
        this.newIndicatorSize = ind;
    }

     /**
    Function to split merged values of an attribute. 
    @param {Array} splitList - List of indices of values to split.
    @param {string} splitParent - The name of the attribute which contains the values to split.
    */   
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
    
    /**Function to make a deep copy of the headerData datastructure */
    this.copyHeader = function(){
        var that = this;
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
        
        //this.headerCopy = headerCopy;
    }
    
    /**Swap the headerCopy with the headerData */
    this.setCopyHeaderActive = function(){

        this.headerData = this.headerCopy;
        this.indicatorSize = this.newIndicatorSize;
        
        this.createNameToIndexMap();
        this.calcIndicatorMatrix();
        
        this.copyHeader();
    }
    
    /** 
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
    }
    
    /**Calculate the indicator matrix from the raw data */
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
  
        this.indicatorMatrix = indicatorMatrix;
    }
    
    /**Set the column coordinates of a value of an attribute
     * @param{Array} x,y coordinates
     */
    this.setColumnCoordinate = function(coords){
        this.headerData.forEach(function(attribute){
            if(!attribute.filtered)
                attribute.values.forEach(function(value){
                    value.xCoord = coords[value.getIndex()].x;
                    value.yCoord = coords[value.getIndex()].y;
                });    
        });
    }
    
    /** Get a flat array for the visualization with d3. Also merge two values of an attribute if the distance is less than delta
     * @param{float} Threshold for merging two values by distance
    */
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

        for(var i = 0; i < flat.length; i++){
            for(var j = (i+1); j < flat.length; j++){
                if(isWithinDelta(delta, flat[i].xCoord, flat[i].yCoord, flat[j].xCoord, flat[j].yCoord)){
                    flat[j].id = flat[i].id;
                }
            }
        }
        
        return flat;
    }
    
    /** Set the state of an attribute to filtered. This omits it from MCA calculations and visualization
     * @param{String} Name of the attribute
     * @param{Bool} Boolean if a value should be filtered 
    */
    this.setFilteredAttribute = function(name, isFiltered){
        this.headerCopy.forEach(function(attribute){
            if(attribute.name == name){
                attribute.filtered = isFiltered;
            }
        });
    }
    
    /** Get an array of names, colors and coordinates for an Observation. The color is calculated by the value of the observation of the attribute specified with its name in the function head.
     * @param{String} Name of the attribute
     * */
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
        
        return colorArray;
    }
    
    /** Set the coordinates of Observations. This is no longer needed
     * @param{Array} Name of the attribute
     * */
    this.setRowCoordinates = function(coordinates){
        this.rowCoordinates = coordinates;
    }
    
    /** Set the size of the area of a voronoi region
     * @param{Array} Area of the voronoi region of all values
     * */
    this.setArea = function(area){
        this.headerCopy.forEach(function(entry){
            entry.values.forEach(function (child){
                child.area = area[child.index];
            });
        });    
        
    }
}

/**Helper function to calculate if the distance from (x1,y1) to (x2,y2) is less than delta 
 * @param{float} threshold value for the distance
 * @param{float} x1 coordinate
 * @param{float} x2 coordinate
 * @param{float} y1 coordinate
 * @param{float} y2 coordinate
*/
function isWithinDelta(delta, x1, y1, x2, y2){
    return (Math.pow((x1-x2),2) + Math.pow((y1-y2),2)) < delta*delta;
}

/**Helper function to return a color by index from a color mapping. A modulo is used for cyclic color return
 * @param(index) Index which selects the color to return.
 */
function getColor(index){
    var colors = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)'];
    var c = d3.hsl(colors[index % 10]);

    return c;
}