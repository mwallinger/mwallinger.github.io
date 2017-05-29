onmessage = function(data){
                self.importScripts("lib/lalolib/lalolib.js");
                console.log(data);
                //var SV = get( data.data[1].USV.s,range(0,2));
                
                

                //extract eigenvalues with highest factor
                //lab.do("SV = s[0:2]");
                
                //lab.do("EV = s^2")
                //lab.do("PI = EV ./ sum(EV)");
                
                //calculate row and column factors
                //lab.do("A = sqrt(Dr) * U");
                //lab.do("B = sqrt(Dc) * V");

                //var sqrtDr = sqrt(data.data[0].Dr)
                //var U = data.data[1].USV.U;
                //var A =mul( sqrtDr , U) ;

                //projection matrix for columns
                //lab.do("SY = zeros(size(Dc,1),2)");
                //lab.do("SY[0][0] = s[0]");
                //lab.do("SY[1][1] = s[1]");

                //projection matrix for rows
                //lab.do("SX = zeros(size(Dr,1),2)");
                //lab.do("SX[0][0] = s[0]");
                //lab.do("SX[1][1] = s[1]");
                var SX = zeros(size(data.data[0].sqrtInvDr,1),2) ;
                set( SX,0,0, get( data.data[1].USV.s,0) ) ;
                set( SX,1,1, get( data.data[1].USV.s,1) ) ;

                //project rows and set callback function
                //lab.do("xCoord = inv(Dr) * A * S[:][0:2]", 
                       //function ( result ) {setXCoord(result);});
                var xCoord = mul(mul( data.data[0].sqrtInvDr , data.data[1].USV.U), SX);
                //var xCoord = mul(mul( data.data[0].sqrtInvDr , data.data[1].USV.U ),get( SX,range(),range(0,2))) ;



                postMessage({xCoord: xCoord});
            }