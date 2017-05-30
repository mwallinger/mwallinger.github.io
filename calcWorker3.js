onmessage = function(data){
                self.importScripts("lib/lalolib/lalolib.js");

    
                var SX = zeros(size(data.data[0].sqrtInvDr,1),2) ;
                set( SX,0,0, get( data.data[1].USV.s,0) ) ;
                set( SX,1,1, get( data.data[1].USV.s,1) ) ;

                //project observations to new coordinate system
                var xCoord = mul(mul( data.data[0].sqrtInvDr , data.data[1].USV.U), SX);

                postMessage({xCoord: xCoord});
            }