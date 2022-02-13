import React, { useState, useEffect } from 'react'
import StartEnd from './StartEnd'
import { useSelector, useDispatch } from 'react-redux'
import { optimLocations, removeLocation, clearLocations, addLocation } from '../reducers/addressesReducer'
import { createGoogleUrl, removeGoogleUrl } from '../reducers/googleUrlReducer'
import { createRoute } from '../reducers/routeReducer'
import { setNotification } from '../reducers/notificationReducer'
import styled from 'styled-components'
import optimize from '../services/optimize'
import logedOptimize from '../services/logedOptimize'
import _ from 'lodash'
import {
  lineString as turfLineString,
  bbox as turfBbox,
  featureCollection as turfFeatureCollection
} from '@turf/turf'
import { removeRoute } from '../reducers/routeReducer'
import { addStart, addEnd } from '../reducers/startendReducer'

const Layout = styled.div`
  position: relative;
  overflow-y: auto;
  border-top: 1px solid black;
  padding: 1rem;
  > div > button {
    display: inline-block;
    position: relative;
  }
`
const Olist = styled.div`
  padding: 1rem;
  > div {
    border: 2px solid black;
    border-radius: 8px;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    > button {
      margin-left: 3em;
    }
    > p > b {
      border-right: 1px solid black;
      padding: 0.3rem;
      margin-right: 0.3rem;
    }
  }
`

const Button = styled.button`
  margin: 0.5em;
  border: 1px solid black;
  border-radius: 4px;
  background-color: white;
  > a {
      color: inherit;
  }
  &:hover {
    background-color: black;
    color: white;
  }
`
const LocationCount = styled.div`
  display: inline-block;
  position: absolute;
  right: 0;
  padding-right: 5%;
  @media (max-width: 320px) {
    position: relative;
    left: 4%;
    display: block;
  }
`
const Locations = ({ map }) => {
  const route = useSelector(state => state.route)
  const DEPOT = useSelector(state => state.DEPOT)
  const googleMapsUrl = useSelector(state => state.googleUrl)
  const addresses = useSelector(state => state.addresses)
  const user = useSelector(state => state.user)
  const locations = addresses.features
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

  useEffect(() => {
    if (!map) return
    map.getSource('dropoffs-symbol').setData(addresses)
  },[addresses])

  useEffect(() => {
    if (!map) return
    const newWarehouse = turfFeatureCollection([DEPOT.start, DEPOT.end])
    if (!map.getLayer('warehouse')) {
      map.on('idle', () => {
        map.getSource('warehouse').setData(newWarehouse)
      })
    } else if (map.isSourceLoaded('warehouse')) map.getSource('warehouse').setData(newWarehouse)
  }, [DEPOT])

  useEffect(() => {
    if (!map) return
    map.getSource('route').setData(route)
  }, [route])

  const handleOptimizeClick = async () => {
    if (_.isEmpty(DEPOT.start) || _.isEmpty(DEPOT.end)) {
      return dispatch(setNotification(
        'Please add a start/end location for the optimization to work!', 10
      ))
    }

    if (locations.length > 10 && user === null)  {
      return dispatch(setNotification(
        <span>Without an account the planner suports only ten locations plus the start/end.<br/>Remove addresses or register an account in order to continue!</span>, 10
      ))
    }

    const allLocations = [DEPOT.start, ...locations, DEPOT.end]

    if (location.length <= 10) {
      const { routeGeoJSON, orderedIndexArray, waypoints } = await optimize(allLocations)

      const removedDepotArray = orderedIndexArray.slice(1, -1).map(elem => elem-1)
      dispatch(optimLocations(removedDepotArray))
      dispatch(createGoogleUrl(waypoints))
      dispatch(createRoute(routeGeoJSON))
    } else {
      const {
        orderedAddresslist,
        routeGeoJSON,
        waypoints
      } = await logedOptimize(allLocations)
      dispatch(removeGoogleUrl())
      dispatch(clearLocations())
      dispatch(removeRoute())
      dispatch(addStart(orderedAddresslist.shift()))
      dispatch(addEnd(orderedAddresslist.pop()))
      dispatch(addLocation(orderedAddresslist))
      dispatch(createRoute(routeGeoJSON))
      console.log(waypoints[0])
    }

    const bboxLoc = [DEPOT.start, ...locations, DEPOT.end]
    /**
     * use turf to create a bounding box out of all
     * locations and feed it to fitBounds()
     */
    const bbox = turfBbox(turfLineString(bboxLoc.map(elem => elem.center)))
    map.fitBounds(bbox, { padding: 50 })
  }

  const handleRemove = id => {
    dispatch(removeLocation(id))
    dispatch(removeGoogleUrl())
    dispatch(removeRoute())
  }

  const handleClearLocations = () => {
    dispatch(clearLocations())
    dispatch(removeGoogleUrl())
    dispatch(removeRoute())
  }

  return (
    <Layout>
      {locations.length < 2 ||
      <div>
        <Button onClick={handleOptimizeClick}>optimize</Button>
        <Button onClick={handleClearLocations}>clear locations</Button>
        <Button style={style}>
          <a href={googleMapsUrl}>open in gmaps</a>
        </Button>
        <LocationCount>Count: <b>{locations.length}</b></LocationCount>
      </div>
      }
      <StartEnd />
      <Olist>
        {locations.map(({ id, place_name }, index) => (
          <div key={id + index}>
            <p><b>{index + 1}: </b>{place_name}</p>
            <Button onClick={() => handleRemove(id)}>Remove</Button>
          </div>
        ))}
      </Olist>
    </Layout>
  )
}

export default Locations
