import React, { useState, useEffect } from 'react'
import StartEnd from './StartEnd'
import { useSelector, useDispatch } from 'react-redux'
import { optimLocations, removeLocation } from '../reducers/locationsReducer'
import { createGoogleUrl, removeGoogleUrl } from '../reducers/googleUrlReducer'
import { createRoute } from '../reducers/routeReducer'
import styled from 'styled-components'
import optimize from '../services/optimize'
import _ from 'lodash'
import {
  lineString as turfLineString,
  bbox as turfBbox,
} from '@turf/turf'
// import { setNotification } from '../reducers/notificationReducer'

const LocationsContainer = styled.div`
  position: absolute;
  top: 450px;
  overflow-y: auto;
  margin: auto;
  > div > button {
    display: inline-block;
    position: relative;
  }
`
const Olist = styled.ol`
  margin: auto;
  border: 1px solid;
  border-style: outset;
  > li {
    margin: 0.3em;
  }
`

const Button = styled.button`
  margin: 0.5em;
`
const Locations = ({ map }) => {
  const locations = useSelector(state => state.locations)
  const DEPOT = useSelector(state => state.DEPOT)
  const googleMapsUrl = useSelector(state => state.googleUrl)
  const dispatch = useDispatch()
  if (!locations) return

  const [visible, setVisible] = useState(false)

  const style = {
    display: visible ? '' : 'none'
  }

  useEffect(() => {
    if (googleMapsUrl.length === 0) setVisible(false)
    if (googleMapsUrl.length > 0) setVisible(true)
  }, [googleMapsUrl])

  const handleOptimizeClick = async () => {
    if (_.isEmpty(DEPOT.start)) return console.log('Please add a starting location')
    if (_.isEmpty(DEPOT.end)) return console.log('Please add an end location')

    const allLocations = [DEPOT.start, ...locations, DEPOT.end]
    const { routeGeoJSON, orderedIndexArray, waypoints } = await optimize(allLocations)
    const removedDepotArray = orderedIndexArray.slice(1, -1).map(elem => elem-1)

    dispatch(optimLocations(removedDepotArray))
    dispatch(createGoogleUrl(waypoints))
    dispatch(createRoute(routeGeoJSON))
    map.getSource('route').setData(routeGeoJSON)

    /**
     * use turf to create a bounding box out of all
     * locations and feed it to fitBounds()
     */
    const bbox = turfBbox(turfLineString(allLocations.map(elem => elem.center)))
    map.fitBounds(bbox, { padding: 50 })
  }

  const handleRemove = id => {
    dispatch(removeLocation(id))
    dispatch(removeGoogleUrl())
  }

  /**
   * I'm thinking about a way to persist the clients route
   * between sessions. This method seams to conflict with mapbox setting
   * its own localStorage, which I'm not sure I can stop
   *
   * For now I implemented redux-persist and seams to work !!!
   **/
  // const handleGoogleButton = () => {
  //   window.localStorage.clear()
  //   window.localStorage.setItem('route', JSON.stringify({
  //     locations: locations,
  //     depot: DEPOT,
  //   }))

  //   console.log(window.localStorage.getItem('route'))
  // }


  return (
    <LocationsContainer>
      {locations.length < 3 ||
      <div>
        <Button onClick={handleOptimizeClick}>optimize</Button>
        <Button style={style}>
          <a href={googleMapsUrl}>open in gmaps</a>
        </Button>
      </div>
      }
      <StartEnd />
      <Olist>
        {locations.map(({ id, place_name }, index) => (
          <li key={id + index}>
            <p>{place_name}</p>
            <button onClick={() => handleRemove(id)}>Remove</button>
          </li>
        ))}
      </Olist>
    </LocationsContainer>
  )
}

export default Locations
