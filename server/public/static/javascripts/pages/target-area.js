// Add back button
(function (window, flood) {
  const maps = flood.maps
  const utils = flood.utils
  const model = flood.model

  // Add browser back button
  utils.addBrowserBackButton()

  // Create LiveMap if querystring is present
  if (utils.getParameterByName('v') === 'map-live') {
    maps.createLiveMap('map-live')
  }
  // Create LiveMap if show map button pressed
  var mapContainer = document.getElementById('map-live')
  if (mapContainer) {
    const button = document.createElement('button')
    button.id = 'map-btn'
    button.className = 'defra-button-map govuk-!-margin-bottom-4'
    button.innerText = 'View map of the flood risk area'
    button.addEventListener('click', function (e) {
      e.preventDefault()
      maps.createLiveMap('map-live', { btn: 'map-btn', lyr: 'ts,tw,ta', fid: model.featureId })
    })
    mapContainer.parentNode.insertBefore(button, mapContainer)
  }
  // Create LiveMap if history changes
  window.addEventListener('popstate', function (e) {
    if (mapContainer.firstChild) {
      mapContainer.removeChild(mapContainer.firstChild)
    }
    if (e && e.state) {
      maps.createLiveMap('map-live')
    }
  })
})(window, window.flood)
