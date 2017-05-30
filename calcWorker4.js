onmessage = function(data){
    self.importScripts("lib/lalolib/lalolib.js");

    //calculate eigenvalues
    var EV = pow( data.data[1].USV.s,2);
    var PI =entrywisediv( EV , sum(EV));

    var k = 1/data.data[2];
    var num = 2;
    
    //calculate columns considered for error chart
    for(num; num < size(data.data[1].USV.s,1); num++ ){
        if(get( data.data[1].USV.s,num) < k)
            break;
    }
    
    //create diagonal matrix of USV.s values for projection
    var SY = zeros(size(data.data[0].sqrtInvDc,1),2) ;

    set( SY,0,0, get( data.data[1].USV.s,0) ) ;
    set( SY,1,1, get( data.data[1].USV.s,1) ) ;

    var SYY = zeros(size(data.data[0].sqrtInvDc,1),num-2);
    
    for(var i = 0; i < num - 2; i++){
        set( SYY,i,i, get( data.data[1].USV.s,i+2) ) ;
    }

    //project columns to new coordinates
    var yCoord = mul(mul( data.data[0].sqrtInvDc , transpose(data.data[1].USV.V) ), SY);
    var yyCoord = mul(mul( data.data[0].sqrtInvDc , transpose(data.data[1].USV.V) ), SYY);

    //calculate relevance
    var yy =pow( yCoord,2) ;
    var wY1 =entrywisediv(get( yy,range(),0) ,get( EV,0) ) ;
    var wY2 =entrywisediv(get( yy,range(),1) ,get( EV,1) ) ;
    
    var yy =pow( yyCoord,2);
    var wY3 = pow(get(EV, range(2,num)),-1);
    //console.log(asdf);
    var wY3 = mul(yy, pow(get(EV, range(2,num)),-1));

    var yx2 = diag(mul(yCoord , transpose(yCoord))) ;
    var yx2 =entrywisediv( yx2 , sum(yx2)) ;

    postMessage({yCoord: yCoord, yx2: yx2, wY1:wY1, wY2:wY2, wY3:wY3});
}