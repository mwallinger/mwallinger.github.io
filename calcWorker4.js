onmessage = function(data){
    self.importScripts("lib/lalolib/lalolib.js");

    var EV = pow( data.data[1].USV.s,2);
    var PI =entrywisediv( EV , sum(EV));

    //calculate row and column factors
    //lab.do("A = sqrt(Dr) * U");
    //lab.do("B = sqrt(Dc) * V");
    
    //var sqrtDc = sqrt(data.data[0].Dc);
    //var B =mul( sqrtDc , data.data[1].USV.V) ;
    
    //projection matrix for columns
    //lab.do("SY = zeros(size(Dc,1),2)");
    //lab.do("SY[0][0] = s[0]");
    //lab.do("SY[1][1] = s[1]");
    
    var k = 1/data.data[2];
    var num = 2;
    
    for(num; num < size(data.data[1].USV.s,1); num++ ){
        if(get( data.data[1].USV.s,num) < k)
            break;
    }
    
    var SY = zeros(size(data.data[0].sqrtInvDc,1),2) ;

    set( SY,0,0, get( data.data[1].USV.s,0) ) ;
    set( SY,1,1, get( data.data[1].USV.s,1) ) ;

    var SYY = zeros(size(data.data[0].sqrtInvDc,1),num-2);
    
    for(var i = 0; i < num - 2; i++){
        set( SYY,i,i, get( data.data[1].USV.s,i+2) ) ;
    }
    //projection matrix for rows
    //lab.do("SX = zeros(size(Dr,1),2)");
    //lab.do("SX[0][0] = s[0]");
    //lab.do("SX[1][1] = s[1]");

    //console.log(data.data[1].USV.V );
    //console.log(data.data[0].sqrtInvDc);

    //var yCoord =mul(mul( data.data[0].sqrtInvDc , transpose(data.data[1].USV.V) ),get( SY,range(),range(0,2)));
    var yCoord = mul(mul( data.data[0].sqrtInvDc , transpose(data.data[1].USV.V) ), SY);
    var yyCoord = mul(mul( data.data[0].sqrtInvDc , transpose(data.data[1].USV.V) ), SYY);

    //lab.do("wY2 = yy[:][1] ./ EV[1]", function ( result ) {setYBarChart(result);});
    var yy =pow( yCoord,2) ;
    var wY1 =entrywisediv(get( yy,range(),0) ,get( EV,0) ) ;
    var wY2 =entrywisediv(get( yy,range(),1) ,get( EV,1) ) ;
    
    var yy =pow( yyCoord,2);
    var wY3 = pow(get(EV, range(2,num)),-1);
    //console.log(asdf);
    var wY3 = mul(yy, pow(get(EV, range(2,num)),-1));

    //calculate relevance
    //lab.do("yx2 = diag(yCoord * transpose(yCoord))");
    //lab.do("yx2 = yx2 ./ sum(yx2)", function(result){setRelevance(result);});
    var yx2 = diag(mul(yCoord , transpose(yCoord))) ;
    var yx2 =entrywisediv( yx2 , sum(yx2)) ;

    postMessage({yCoord: yCoord, yx2: yx2, wY1:wY1, wY2:wY2, wY3:wY3});
}