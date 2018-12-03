// This file represents the 5 day outlook used on the national page.
// It uses the MapContainer

(function (window, flood) {
  var ol = window.ol
  var maps = flood.maps
  var MapContainer = maps.MapContainer
  var forEach = flood.utils.forEach

  function OutlookMap (elementId, options) {
    options = options || {}

    // Outlook map
    var road = maps.layers.road()

    var view = new ol.View({
      center: ol.proj.transform(maps.center, 'EPSG:4326', 'EPSG:3857'),
      zoom: 6,
      minZoom: 6,
      maxZoom: 7,
      extent: maps.extent
    })

    var geoJson = new window.ol.format.GeoJSON()
    var outlookGeoJson = flood.model.geoJson

    var areasOfConcernFeatures = geoJson.readFeatures(outlookGeoJson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })

    function styleFeature (feature) {
      var strokeColour = '#6f777b'
      var strokeWidth = 2
      var zIndex = feature.get('z-index')
      var lineDash = [2, 3]
      var fillColour = '#85994b'

      if (feature.get('risk-level') === 2) {
        fillColour = '#ffbf47'
      } else if (feature.get('risk-level') === 3) {
        fillColour = '#F47738'
      } else if (feature.get('risk-level') === 4) {
        fillColour = '#df3034'
      }

      return new ol.style.Style({
        fill: new ol.style.Fill({ color: fillColour }),
        stroke: new ol.style.Stroke({
          color: strokeColour,
          width: strokeWidth,
          miterLimit: 2,
          lineJoin: 'round',
          lineDash: lineDash
        }),
        lineDash: lineDash,
        zIndex: zIndex
      })
    }

    var areasOfConcern = new window.ol.layer.Vector({
      zIndex: 200,
      source: new window.ol.source.Vector({
        format: geoJson,
        features: areasOfConcernFeatures
      }),
      style: styleFeature
    })

    // Outlook set first day
    function setDay (day) {
      areasOfConcern.getSource().forEachFeature(function (feature) {
        var featureDay = feature.get('day')
        var visible = featureDay === day
        feature.setStyle(visible ? null : new ol.style.Style({}))
      })

      forEach(outlookButtons, function (btn, i) {
        btn.setAttribute('aria-selected', i + 1 === day ? 'true' : 'false')
      })
    }

    var container = new MapContainer(document.getElementById(elementId), {
      buttonText: 'View map of forecast flood risk',
      progressive: true,
      view: view,
      layers: [
        road,
        areasOfConcern
      ]
    })

    var outlookControl = container.element.querySelector('.map__outlook-control')
    var outlookButtons = outlookControl.querySelectorAll('button')

    setDay(1)

    forEach(outlookButtons, function (button) {
      button.addEventListener('click', function (e) {
        var day = +button.getAttribute('data-day')
        setDay(day)
      })
    })
  }

  // Export a helper factory to create this map
  // onto the `maps` object.
  // (This is done mainly to avoid the rule
  // "do not use 'new' for side effects. (no-new)")
  maps.createOutlookMap = function (containerId, place) {
    return new OutlookMap(containerId, place)
  }
})(window, window.flood)