onmessage = function(data){
                //var lab = new Lalolab("lab", false, "lib/lalolib" ) ;
                self.importScripts("lib/lalolib/lalolib.js");
                var X = mat(data.data[0],true);
                //load the data into lalolab
                //lab.load(data, "X");

                //lab.do("s = size(X,1)");
                var s = size(X,1);
                console.log(data.data[0]);

                //lab.do("n = s[1]");
                var n = s;
                
                //calculate Matrix Total
                //lab.do("N = sum(X)");  
                var N = sum(X);
                
                //lab.do("sum(X,1) ./ X.m", function ( result ) {setColSum(result);});
                //calculate probability matrix
                //lab.do("P = X ./ N");
                var P = entrywisediv( X , N) ;
                X = null;
                //column and row sum
                //lab.do("r = sum(P,2)");
                //lab.do("c = sum(P,1)");
                var r = sum(P,2) ;
                var c = sum(P,1) ;

                //diagonal matrix of row and column sums
                //lab.do("Dr = diag(r)");
                //lab.do("Dc = diag(c')");
                var Dr = diag(r);
                var Dc = diag(transpose(c));
                console.log(c);

                //outer product of row sum and column sum vectors
                //lab.do("rc = mul(r,c)");
                var rc = mul(r,c);

                //calculate matrix for SVD 
                //lab.do("Z =  sqrt(inv(Dr)) * (P-rc) * sqrt(inv(Dc))");
                var Z =  mul(mul(sqrt(inv(Dr)) , (sub(P,rc)) ), sqrt(inv(Dc))) ;;
                P = null;
                //SVD
                //lab.do("USV = svd(Z, true)");
                //lab.do("s = USV.s");
                //lab.do("U = USV.U");
                //lab.do("V = USV.V");
                //lab.do("S = USV.S");
                console.log(Z)
                var USV = svd(Z, true);
                console.log("svd before")
                Z = null;
                var SV = get( USV.s,range(0,2)) ;
                

                //extract eigenvalues with highest factor
                //lab.do("SV = s[0:2]");
                
                //lab.do("EV = s^2")
                //lab.do("PI = EV ./ sum(EV)");
                
                var EV = pow( s,2);
                var PI =entrywisediv( EV , sum(EV));

                //calculate row and column factors
                //lab.do("A = sqrt(Dr) * U");
                //lab.do("B = sqrt(Dc) * V");
                var A =mul( sqrt(Dr) , USV.U) ;
                var B =mul( sqrt(Dc) , USV.V) ;

                //projection matrix for columns
                //lab.do("SY = zeros(size(Dc,1),2)");
                //lab.do("SY[0][0] = s[0]");
                //lab.do("SY[1][1] = s[1]");
                var SY = zeros(size(Dc,1),2) ;
                set( SY,0,0, get( USV.s,0) ) ;
                set( SY,1,1, get( USV.s,1) ) ;

                //projection matrix for rows
                //lab.do("SX = zeros(size(Dr,1),2)");
                //lab.do("SX[0][0] = s[0]");
                //lab.do("SX[1][1] = s[1]");
                var SX = zeros(size(Dc,1),2) ;
                set( SX,0,0, get( USV.s,0) ) ;
                set( SX,1,1, get( USV.s,1) ) ;

                //project rows and set callback function
                //lab.do("xCoord = inv(Dr) * A * S[:][0:2]", 
                       //function ( result ) {setXCoord(result);});
                var xCoord = mul(mul( inv(Dr) , A ),get( S,range(),range(0,2))) ;
                //project columns and set callback function
                //lab.do("yCoord = inv(Dc) * B * SY", 
                       //function ( result ) {setYCoord(result);});
                var yCoord =mul(mul( inv(Dc) , B ),get( SY,range(),range(0,2))) ;
                
                //lab.do("yy = yCoord^2", function(result){console.log(result);});
                //lab.do("wY1 = yy[:][0] ./ EV[0] ", function ( result ) {setXBarChart(result);});
                //lab.do("wY2 = yy[:][1] ./ EV[1]", function ( result ) {setYBarChart(result);});
                var yy =pow( yCoord,2) ;
                var wY1 =entrywisediv(get( yy,range(),0) ,get( EV,0) ) ;
                var wY2 =entrywisediv(get( yy,range(),1) ,get( EV,1) ) ;
                
                //calculate relevance
                //lab.do("yx2 = diag(yCoord * transpose(yCoord))");
                //lab.do("yx2 = yx2 ./ sum(yx2)", function(result){setRelevance(result);});
                var yx2 = diag(mul(yCoord , transpose(yCoord))) ;
                var yx2 =entrywisediv( yx2 , sum(yx2)) ;
                console.log("finished");
            }