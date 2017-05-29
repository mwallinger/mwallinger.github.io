onmessage = function(data){
                //var lab = new Lalolab("lab", false, "lib/lalolib" ) ;
                self.importScripts("lib/lalolib/lalolib.js");
                var X = mat(data.data[0],true);
                //load the data into lalolab
                //lab.load(data, "X");

                //lab.do("s = size(X,1)");
                var s = size(X,1);
                

                //lab.do("n = s[1]");
                var n = s;
                
                //calculate Matrix Total
                //lab.do("N = sum(X)");  
                var N = sum(X);
                
                //lab.do("sum(X,1) ./ X.m", function ( result ) {setColSum(result);});
                //calculate probability matrix
                //lab.do("P = X ./ N");
                var colSum = entrywisediv(sum(X,1), X.m);
                var P = entrywisediv( X , N) ;
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
                var rc = mul(r,c);
                console.log(rc);
                var invDr = inv(Dr);
                var invDc = inv(Dc);
                var sqrtInvDr = sqrt(invDr);
                var sqrtInvDc = sqrt(invDc);
                var a = sub(P,rc);
                var b = mul(sqrtInvDr , a);
                var Z =  mul(b, sqrtInvDc);

                //postMessage({Dr: Dr, Dc: Dc, Z:Z, invDr: invDr, invDc: invDc, sqrtInvDr: sqrtInvDr, sqrtInvDc: sqrtInvDc, colSum: colSum});
                postMessage({Z:Z, sqrtInvDr: sqrtInvDr, sqrtInvDc: sqrtInvDc, colSum: colSum});
                console.log("finished");
            }