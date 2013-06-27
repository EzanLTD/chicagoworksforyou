var stIndex = 0;
var serviceTypes = _.pairs(serviceTypesJSON);

function calculateLayerSettings(wardNum, highest, lowest) {
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

function redrawChart(stCode, isRedraw) {
    var numOfDays = 7;
    var url = window.apiDomain + 'requests/' + stCode + '/counts.json?end_date=' + currWeekEnd.format(dateFormat) + '&count=' + numOfDays + '&callback=?';

    $.getJSON(
        url,
        function(response) {
            var counts = _.pairs(response).slice(1,51);
            var sorted = _.sortBy(counts,function(pair) { return pair[1]; });

            var lowest = sorted[0];
            var highest = sorted[49];

            if (!isRedraw) {
                for (var path in wardPaths) {
                    var wardNum = parseInt(path, 10);
                    var poly = L.polygon(
                        wardPaths[path],
                        $.extend({
                            id: wardNum,
                            opacity: 1,
                            weight: 2
                        }, calculateLayerSettings(wardNum, highest, lowest))
                    );
                    poly.bindPopup('<a href="/wards/' + wardNum + '/">Ward ' + wardNum + '</a>');
                    allWards.addLayer(poly);
                }

                allWards.addTo(window.map);
            } else {
                allWards.eachLayer(function(layer) {
                    layer.setStyle(calculateLayerSettings(layer.options.id, highest, lowest));
                });
            }
        }
    );
}

function updateST(i) {
    var st = serviceTypes[i][1];
    $('.st-info h2').text(st.name);
    redrawChart(st.code, true);
}

$(function () {
    $('.prevST').click(function(evt) {
        evt.preventDefault();
        updateST(--stIndex);
    });

    $('.nextST a').click(function(evt) {
        evt.preventDefault();
        updateST(++stIndex);
    });

    drawChicagoMap();
    buildWardPaths();

    window.allWards = L.layerGroup();

    redrawChart(serviceTypes[0][1].code, false); // Graffiti Removal
});
