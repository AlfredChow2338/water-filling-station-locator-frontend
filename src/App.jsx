import { useMemo, useState } from 'react'
import axios from 'axios'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

import viteLogo from '/vite.svg'
import icon from '/icon-removebg.png'
import machine from '/machine.png'
import './App.css'

function App() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY
  })

  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState()
  const [directions, setDirections] = useState(null);

  const center = useMemo(() => {
    return {
      lat: Number(lat),
      lng: Number(lng)
    }
  }, [lat, lng])

  const handleChangeLatitude = (e) => { 
     setLat(e.target.value)
  }

  const handleChangeLongtitude = (e) => {
    setLng(e.target.value)
  }

  const handleClickGetStations = async () => {
    const url = `http://localhost:3000/stations?x=${lng}&y=${lat}`
    const res = await axios.get(url)
    const { data } = res || {}
    const markers = data.map(d => {
      return {
        id: d.country_park,
        lat: d.coordinate.lat,
        lng: d.coordinate.long,
        ...d
      }
    })
    setMarkers(markers)
  }

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker.id)
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: { lat: marker.lat, lng: marker.lng },
        travelMode: window.google.maps.TravelMode.WALKING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error('Directions request failed with status:', status);
        }
      }
    );
  }

  return (
    <>
      <img src={viteLogo} className="logo" alt="Vite logo" />
      <div style={{ textAlign: 'left' }}>
      <div>
        <label>Your Latitude: </label>
        <input onChange={handleChangeLatitude} />
      </div>
      <div style={{ marginTop: 20 }}>
        <label>Your Longtitude: </label>
        <input onChange={handleChangeLongtitude} />
      </div>
      </div>
      <button style={{ marginTop: 40 }} onClick={handleClickGetStations}>Get Nearest Stations</button>
      {isLoaded ? <div style={{ marginTop: 40 }}><GoogleMap
        center={center}
        zoom={13}
        mapContainerStyle={{ height: "400px", width: "800px" }}
      >
        <Marker
          position={center}
          icon={{
            url: icon,
            scaledSize: new window.google.maps.Size(60, 60)
          }}
        />
        {(markers || []).map((marker) => <Marker key={marker.id} onClick={() => handleMarkerClick(marker)} position={marker} icon={{ url: machine, scaledSize: new window.google.maps.Size(50, 50) }}>
          {selectedMarker === marker.id ? <InfoWindow 
            onCloseClick={() => setSelectedMarker()}
          >
              <div style={{ color: 'black', textAlign: 'left' }}>
                <div>Name: {marker.country_park}</div>
                <div>Distnce: {marker.distance}</div>
                <div>Travel Time: {marker.travelTime}</div>
                <div>Difficulty: {marker.difficultyScore}</div>
              </div>
          </InfoWindow> : null}
          {selectedMarker && (
            <DirectionsService
              options={{
                origin: center,
                destination: selectedMarker,
                travelMode: window.google.maps.TravelMode.WALKING
              }}
              callback={(result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                  setDirections(result);
                } else {
                  console.error('Directions request failed with status:', status);
                }
              }}
            />
          )}

          {directions && <DirectionsRenderer directions={directions} />}
        </Marker>)}
      </GoogleMap></div> : null}
    </>
  )
}

export default App
