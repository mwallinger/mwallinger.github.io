/*second step of the calculation. This returns the SVD*/

onmessage = function(data){
                self.importScripts("lib/lalolib/lalolib.js");
                var USV = svd(data.data[0], true);
                postMessage({USV: USV});
            }