onmessage = function(data){
                //var lab = new Lalolab("lab", false, "lib/lalolib" ) ;
                self.importScripts("lib/lalolib/lalolib.js");
                var X = mat(data.data[0],true);

                var s = size(X,1);
                
                var n = s;
                
                var N = sum(X);
                
                //calculate Sum of observations for each column
                var colSum = entrywisediv(sum(X,1), X.m);
    
                //create matrix of probabilities
                var P = entrywisediv( X , N) ;

                //column and row sum
                var r = sum(P,2) ;
                var c = sum(P,1) ;


                //diagonal of column and row sums
                var Dr = diag(r);
                var Dc = diag(transpose(c));
                var rc = mul(r,c);

                var invDr = inv(Dr);
                var invDc = inv(Dc);
                var sqrtInvDr = sqrt(invDr);
                var sqrtInvDc = sqrt(invDc);
                var a = sub(P,rc);
                var b = mul(sqrtInvDr , a);
    
                //calculate matrix of response
                var Z =  mul(b, sqrtInvDc);

                //postMessage({Dr: Dr, Dc: Dc, Z:Z, invDr: invDr, invDc: invDc, sqrtInvDr: sqrtInvDr, sqrtInvDc: sqrtInvDc, colSum: colSum});
                postMessage({Z:Z, sqrtInvDr: sqrtInvDr, sqrtInvDc: sqrtInvDc, colSum: colSum});
            }