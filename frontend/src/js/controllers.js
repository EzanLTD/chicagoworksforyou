'use strict';

/* Controllers */

function ServiceMapCtrl($scope, $http, $routeParams) {
    $http.get('/data/services.json').success(function(data) {
        $scope.services = data;
        window.test = data;
    });

    $scope.orderProp = 'name';
    $scope.wrapClass = 'has-map';
    $scope.serviceTypeSlug = $routeParams.serviceSlug;
    $scope.serviceType = serviceTypesJSON[$routeParams.serviceSlug];
    $scope.hasMap = true;

    $scope.calculateLayerSettings = function(wardNum, highest, lowest) {
        var fillOp = 0.1;
        var col = '#0873AD';

        if (wardNum == lowest[0]) {
            fillOp = 1;
        } else if (wardNum == highest[0]) {
            fillOp = 1;
            col = 'black';
        }

        var settings = {
            color: col,
            fillOpacity: fillOp
        };

        return settings;
    }

    $scope.updateST = function(isRedraw) {
        var st = $scope.serviceType;
        var numOfDays = 7;
        var url = window.apiDomain + 'requests/' + st.code + '/counts.json?end_date=' + currWeekEnd.format(dateFormat) + '&count=' + numOfDays + '&callback=?';

        $.getJSON(
            url,
            function(response) {
                var counts = _.pairs(response).slice(1,51);
                var sorted = _.sortBy(counts,function(pair) { return pair[1]; });

                var lowest = sorted[0];
                var highest = sorted[49];

                if (!isRedraw) {
                    window.allWards = L.layerGroup();

                    for (var path in wardPaths) {
                        var wardNum = parseInt(path, 10);
                        var poly = L.polygon(
                            wardPaths[path],
                            $.extend({
                                id: wardNum,
                                opacity: 1,
                                weight: 2
                            }, $scope.calculateLayerSettings(wardNum, highest, lowest))
                        );
                        poly.bindPopup('<a href="/wards/' + wardNum + '/">Ward ' + wardNum + '</a>');
                        window.allWards.addLayer(poly);
                    }

                    window.allWards.addTo(window.map);
                } else {
                    window.allWards.eachLayer(function(layer) {
                        layer.setStyle(calculateLayerSettings(layer.options.id, highest, lowest));
                    });
                }
            }
        );
    }

    drawChicagoMap();
    buildWardPaths();
    $scope.updateST(false);
}

//ServiceMapCtrl.$inject = ['$scope', '$http'];


function ServiceChartCtrl($scope, $routeParams) {
    $scope.serviceSlug = $routeParams.serviceSlug;
}

//PhoneDetailCtrl.$inject = ['$scope', '$routeParams'];


function WardMapCtrl($scope, $http) {
    $http.get('/data/services.json').success(function(data) {
        $scope.services = data;
    });

    $scope.orderProp = 'name';
}
