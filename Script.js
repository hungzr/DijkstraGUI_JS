var P = 0; //so luong diem
var E = 0; //so luong duong
var G = [];//ma tran do thi
var Points = []; //mang chua toa do cac diem
var Dist = []; //mang luu do dai
var Prev = [];//mang luu vet
var minLength = 0;//do dai duong di

$(document).ready(function () {
    $("#Generate").click(function (){
        board = JXG.JSXGraph.initBoard('box', { boundingbox: [-20, 20, 20, -20], axis: false });
        P = $("#Points").val();
        E = $("#Edges").val();
        GeneraterGraph();
    });

    $("#findWay").click(function () {
        var startPoint = $("#startPoint").val() -1;
        var endPoint = $("#endPoint").val() -1;
        if (startPoint < 0 | startPoint >= P) {
            $("#Route").html("Nhập lại điểm bắt đầu");
            return;
        }
        if (endPoint < 0 | endPoint >= P) {
            $("#Route").html("Nhập lại điểm đến");
            return;
        }

        Dijkstra(startPoint, endPoint);
    });
});

function getRandForPoint(min,max){
    return Math.floor(Math.random() * (max - min +1)) + min;
}
function getRandInteger(max){
    max = Math.floor(max);
    return Math.floor(Math.random() * max); 
}

function Distance(A, B){
    return Math.round(Math.sqrt(Math.pow(A.x - B.x,2) + Math.pow(A.y - B.y,2)));
}

var GeneraterGraph = function() {
    //tao cac canh
    G = new Array(P*P); 
    G.fill(0,0);
    Points = []
    Dist = new Array(P);
    Prev = new Array(P);
    Prev.fill(-1,0);

    var count = 0;
    // for (var i = 0; i < P; i++) {
        // for (var j = 0; j < P; j++) {
        //     rand =  getRandInteger(0, 1);
        //     if(count<E && i!=j && rand == 1  && G[j*P+i] !=1){
        //         G[i * P + j] = 1;
        //         count++;
                
        //     }
        // }
    // }
    while ( count < E){
        var a = getRandInteger(P)
        var b =  getRandInteger(P)
        if (a!=b && G[b * P + a]==0 && G[a * P + b]==0){ //neu 2 diem ko trung nhau va chua co duong di giua 2 dinh
            G[a * P + b]=1;
            count++;
        }

    }
        
    
    //tao diem va toa do
    for (var i=0; i<P; i++){
        var point = {};
        point.x = getRandForPoint(-12, 12);
        point.y = getRandForPoint(-12, 12);
        board.create('point', [point.x, point.y], {strokeColor:'yellow',fillColor:'yellow', name: i+1, size: 2, fixed: true});
        Points.push(point);
    }

    //cap nhat trong so
    for (var i = 0; i<P; i++){
        for ( var j = 0; j<P; j++){
            if( i!=j && G[i * P + j] !=0){
                var distance = Distance(Points[i], Points[j]);
                var point1 = ''+ (i+1);
                var point2 = ''+ (j+1);
                G[i * P + j] = distance;
                var line = board.create('arrow',[point1,point2],{Id: 'line'+i+j,strokeColor:'green', straightFirst:false, straightLast:false, strokeWidth:3});
            }
        }
    }
    PrintMatrix();
}


var INF = 99999999;
function Dijkstra(startPoint, endPoint){
    for (var i = 0; i < P; i++) {
        for (var j = 0; j < P; j++) {
            if (i != j && G[i * P + j] != 0) {
                $("#box_line"+i+j).css("stroke","green").css("stroke-width","3px").css("z-index","");
            }
        }
    }

    var queue = [];

    for (var i = 0; i < P; i++) {
        Dist[i] = INF;
        Prev[i] = -1;
        queue.push(i);
    }
    Dist[startPoint] = 0;

    while (queue.length > 0) {
        var currentNode = indexOfMin(queue); // currentNode la dinh dang xet
        queue = arrayRemove(queue, currentNode); // lay currentNode ra khoi queue

        // tim cac dinh lien ke
        var neighbor = [];
        for (var i = 0; i < P; i++) {
            if (G[currentNode * P + i] != 0 && queue.includes(i)) {
                neighbor.push(i);
            }
        }

        for (var i = 0; i < neighbor.length; i++) {
            var alt = Dist[currentNode] + G[currentNode * P + neighbor[i]];
            if (alt < Dist[neighbor[i]]) {
                Dist[neighbor[i]] = alt;
                Prev[neighbor[i]] = currentNode;
            }
        }
    }

    DrawRoute(startPoint, endPoint);
}
var PrintMatrix = function () {
    $("#matrix").empty();
    for (var i = 0; i < P; i++) {
        $("#matrix").append("<tr id='row" + i + "'></tr>");
        for (var j = 0; j < P; j++) {
            $("#row" + i).append("<td>" + G[i * P + j] + "</td>");
        }
    }
};

var indexOfMin = function (arr) {
    if (arr.length === 0) {
        return -1;
    }

    var min = INF + 1;
    var minIndex = -1;

    for (var i = 0; i < Dist.length; i++) {
        if (Dist[i] < min && arr.includes(i)) {
            minIndex = i;
            min = Dist[i];
        }
    }

    return minIndex;
}

var arrayRemove = function (arr, value) {

    return arr.filter(function (ele) {
        return ele != value;
    });

}

var DrawRoute = function (source, dest) {
    $("#Route").empty();
    $("#Length").empty();
    var Dest = dest;
    var Travel = [];
    Travel.push(dest);
    while (source != dest) {
        if (dest == -1) {
            $("#Route").append("Không tồn tại đường đi");
            return;
        }
        Travel.push(Prev[dest]);
        dest = Prev[dest];
    }
    Travel = Travel.reverse();
    minLength = 0;
    for (var i = 0; i < Travel.length; i++) {
        $("#Route").append(Travel[i] + 1);
        if (i != Travel.length - 1) {
            var temp = Distance(Points[(Travel[i])], Points[(Travel[i+1])]);
            minLength = minLength + temp;
            $("#Route").append("->");
            $("#box_line"+Travel[i]+Travel[i+1]).css("stroke","red").css("stroke-width","5px").css("z-index","300");
        }
    }
    $("#Length").append(minLength);
}