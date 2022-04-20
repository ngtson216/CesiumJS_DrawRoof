var myAjax = new XMLHttpRequest(); // Tạo đối tượng XMLHttpRequest
myAjax.open("GET", "squaw_creek_container_info.xml", false); //Mở file 
myAjax.setRequestHeader("Content-Type", "text/xml"); //Đặt header với content-type là text/xml
myAjax.send(null); //Gửi yêu cầu
var xmlDocument = myAjax.responseXML; //Lấy nội dung XML từ file và trả về biến xmlDocument
var po = xmlDocument.getElementsByTagName("POINT"); // Lấy các thẻ có tên là POINT
var li = xmlDocument.getElementsByTagName("LINE");
var plg = xmlDocument.getElementsByTagName("POLYGON");

//Set up Cesium
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMWNlZGZiZC1hZDBkLTRlYzktOTdiMS0yZjFkN2IyZDA1MmMiLCJpZCI6ODk4NjgsImlhdCI6MTY0OTk4NjY0Nn0.YmDNYZ3GH7ahtkPAiCnRm5l5w2Quv_eMJO0IwPpYzPM';
const viewer = new Cesium.Viewer('cesiumContainer', {
    terrainProvider: Cesium.createWorldTerrain()
});
const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-93.62033081054688, 42.01864242553711, 500),
    orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90, 0),
    }
});

//Draw All Point
for (i = 0; i < po.length; i++) {
    drawAllPoint(po[i].attributes[0].value)
}

//Draw All Line
for (var i = 0; i < li.length; i++) {
    drawAllLine(li[i].attributes[1].value);
}

//Draw All Polygon
for (var i = 0; i < plg.length; i++) {
    var spl = plg[i].attributes[1].value.split(" ").join("");
    drawAllPolygon(spl);
}

function getPoDegree(arrOfLine) {
    var arrOfPo = [];
    for (var i = 0; i < arrOfLine.length; i++) {
        for (var j = 0; j < li.length; j++) {
            if (arrOfLine[i] === li[j].attributes[0].value) {
                var a = takeDegreeFromLine(li[j].attributes[1].value);
                arrOfPo.push(a);
            }
        }
    }
    return arrOfPo
}

function getLineFromPolygon(polygonPath) {
    var p = 0;
    var arrPlg = [];
    for (var i = 0; i < polygonPath.length; i++) {
        if (polygonPath[i] === ',') {
            var a = polygonPath.slice(p, i);
            p = i + 1;
            arrPlg.push(a);
        }
        if (i === polygonPath.length - 1 && polygonPath[i] !== ',') {
            var a = polygonPath.slice(p, polygonPath.length);
            arrPlg.push(a);
        }
    }
    return arrPlg
}

function pointInLine(point1, point2) {
    var poDegree1, poDegree2;
    for (var i = 0; i < po.length; i++) {
        if (po[i].attributes[1].value === point1) {
            poDegree1 = po[i].attributes[0].value;
        }
        if (po[i].attributes[1].value === point2) {
            poDegree2 = po[i].attributes[0].value;
        }
    }
    return {
        poDe1: poDegree1,
        poDe2: poDegree2,
    }
}

function sliceLine(linePath) {
    var po1, po2;
    for (var i = 0; i < linePath.length; i++) {
        if (linePath[i] === ',') {
            po1 = linePath.slice(0, i);
            po2 = linePath.slice(i + 2, linePath.length);
            break;
        }
    }
    return {
        point1: po1,
        point2: po2,
    }
}

function sliceDegree(degree) {
    var longitude, latitude, height, checki;
    for (var i = 0; i < degree.length; i++) {
        if (degree[i] === ',') {
            longitude = degree.slice(0, i);
            checki = i;
            break;
        }
    }
    for (var j = checki + 2; j < degree.length; j++) {
        if (degree[j] === ',') {
            latitude = degree.slice(checki + 2, j);
            height = degree.slice(j + 2, degree.length);
            break;
        }
    }
    return {
        longitude: longitude,
        latitude: latitude,
        height: height,
    }
}

function takeDegreeFromLine(linePath) {
    var takePo = sliceLine(linePath);
    var tkPoDegree = pointInLine(takePo.point1, takePo.point2);
    return {
        slDr1: sliceDegree(tkPoDegree.poDe1),
        slDr2: sliceDegree(tkPoDegree.poDe2),
    }
}

function drawAllPoint(degree) {
    var takeDegree = sliceDegree(degree);
    drawPoint(takeDegree.longitude, takeDegree.latitude, takeDegree.height)
}

function drawPoint(a, b, c) {
    const point = viewer.entities.add({
        name: 'Point',
        description: '<p>\
            Point from degree: </p>\ ' +
            'Longitude: ' + a +
            '</br>\ Latitude: ' + b +
            '</br>\ Latitude: ' + c,
        position: Cesium.Cartesian3.fromDegrees(a, b, c),
        point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
        },
    });
    return point;
}

function drawAllLine(linePath) {
    var sD = takeDegreeFromLine(linePath);
    drawLine(sD.slDr1.longitude, sD.slDr1.latitude, sD.slDr1.height, sD.slDr2.longitude, sD.slDr2.latitude, sD.slDr2.height);
}

function drawLine(a, b, c, d, e, f) {
    const line = viewer.entities.add({
        name: "Line",
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([a, b, c, d, e, f]),
            width: 2,
            material: Cesium.Color.YELLOW,
        },
    });
    return line;
}

function drawPolygon(arrPoDg) {
    const redPolygon = viewer.entities.add({
        name: "Polygon",
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(arrPoDg),
            perPositionHeight: true,
            material: Cesium.Color.PURPLE,
        },
    });
}

function drawAllPolygon(value) {
    arrPoDegree = getPoDegree(getLineFromPolygon(value));
    var arrPoDegree;
    var arrPoDg = [];
    for (var j = 0; j < arrPoDegree.length; j++) {
        arrPoDg.push(+arrPoDegree[j].slDr1.longitude,
            +arrPoDegree[j].slDr1.latitude,
            +arrPoDegree[j].slDr1.height,
            +arrPoDegree[j].slDr2.longitude,
            +arrPoDegree[j].slDr2.latitude,
            +arrPoDegree[j].slDr2.height);
    }
    drawPolygon(arrPoDg);
}