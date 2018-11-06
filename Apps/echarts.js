var dom = document.getElementById("cesiumContainer");
var myChart = echarts.init(dom);
var app = {};
option = null;

$.getJSON('./Data/flights.json', function (data) {
    var airports = data.airports.map(function (item) {
        return {
            coord: [item[3], item[4]]
        }
    });

    function getAirportCoord(idx) {
        return [data.airports[idx][3], data.airports[idx][4]];
    }

    // Route: [airlineIndex, sourceAirportIndex, destinationAirportIndex]
    var routesGroupByAirline = {};
    data.routes.forEach(function (route) {
        var airline = data.airlines[route[0]];
        var airlineName = airline[0];
        if (!routesGroupByAirline[airlineName]) {
            routesGroupByAirline[airlineName] = [];
        }
        routesGroupByAirline[airlineName].push(route);
    });

    var pointsData = [];
    data.routes.forEach(function (airline) {
        pointsData.push(getAirportCoord(airline[1]));
        pointsData.push(getAirportCoord(airline[2]));
    });

    var series = data.airlines.map(function (airline) {
        var airlineName = airline[0];
        var routes = routesGroupByAirline[airlineName];

        if (!routes) {
            return null;
        }
        return {
            type: 'lines3D',
            name: airlineName,

            effect: {
                show: true,
                trailWidth: 2,
                trailLength: 0.15,
                trailOpacity: 1,
                trailColor: 'rgb(30, 30, 60)'
            },

            lineStyle: {
                width: 1,
                color: 'rgb(50, 50, 150)',
                // color: 'rgb(118, 233, 241)',
                opacity: 0.1
            },
            blendMode: 'lighter',

            data: routes.map(function (item) {
                return [airports[item[1]].coord, airports[item[2]].coord];
            })
        };
    }).filter(function (series) {
        return !!series;
    });

    series.push({
        type: 'scatter3D',
        coordinateSystem: 'globe',
        blendMode: 'lighter',
        symbolSize: 2,
        itemStyle: {
            color: 'rgb(50, 50, 150)',
            opacity: 0.2
        },
        data: pointsData
    });

    myChart.setOption({
        legend: {
            selectedMode: 'single',
            left: 'left',
            data: Object.keys(routesGroupByAirline),
            orient: 'vertical',
            textStyle: {
                color: '#fff'
            }
        },
        globe: {
            baseTexture: "./Images/world.200409.3x5400x2700.jpg",
            heightTexture: "./Images/world.200409.3x5400x2700.jpg",
            displacementScale: 0.04,
            shading: 'realistic',
            environment: './Images/starfield.jpg',
            realisticMaterial: {
                roughness: 0.9
            },
            postEffect: {
                enable: true
            },
            light: {
                main: {
                    intensity: 5,
                    shadow: true
                },
                ambientCubemap: {
                    texture: './Images/pisa.hdr',
                    diffuseIntensity: 0.2
                }
            }

        },
        series: series
    });
    window.addEventListener('keydown', function () {
        series.forEach(function (series, idx) {
            myChart.dispatchAction({
                type: 'lines3DToggleEffect',
                seriesIndex: idx
            });
        })
    });
});
;
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}