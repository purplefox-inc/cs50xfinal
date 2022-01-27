import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { useSelector, useDispatch } from 'react-redux'
import { removeGoogleUrl } from '../reducers/googleUrlReducer'
import { removeStart, removeEnd, addStart, addEnd } from '../reducers/startendReducer'
import _ from 'lodash'

const Layout = styled.div`
  position: relative;
  margin: auto;
  border: 1px solid;
  border-style: outset;
  > div {
    margin-left: 3em;
    margin-bottom: 0,3em;
    margin-right: 0.3em;
    border: 3px solid;
    border-style: outset;
  }
`
const StartGeo = styled.div`
  margin: 2px;
`
const EndGeo = styled.div`
  margin: 2px;
`
const StartEnd = () => {
  const startGeocoder = new MapboxGeocoder({
    accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
    types: 'address,country,region,place,postcode,locality,neighborhood'
  })
  const endGeocoder = new MapboxGeocoder({
    accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
    types: 'address,country,region,place,postcode,locality,neighborhood'
  })
  const startGeocoderContainer = useRef(null)
  const endGeocoderContainer = useRef(null)

  const [startVisible, setStartVisible] = useState(false)
  const [endVisible, setEndVisible] = useState(false)

  const startStyle = {
    display: startVisible ? '' : 'none'
  }
  const startGeoStyle = {
    display: startVisible ? 'none' : ''
  }
  const endStyle = {
    display: endVisible ? '' : 'none'
  }
  const endGeoStyle = {
    display: endVisible ? 'none' : ''
  }

  const dispatch = useDispatch()
  const DEPOT = useSelector(state => state.DEPOT)

  useEffect(() => {
    if (_.isEmpty(DEPOT.start)) {
      setStartVisible(false)
    } else setStartVisible(true)
    if (_.isEmpty(DEPOT.end)) {
      setEndVisible(false)
    } else setEndVisible(true)
  })

  useEffect(() => {
    if (startGeocoderContainer.current === null || endGeocoderContainer.current === null) return
    startGeocoder.addTo(startGeocoderContainer.current)
    endGeocoder.addTo(endGeocoderContainer.current)
  }, [])

  startGeocoder.on('result', event => {
    dispatch(addStart(event.result))
  })
  endGeocoder.on('result', event => {
    dispatch(addEnd(event.result))
  })

  return (
    <Layout>
      Start:<div><p>{DEPOT.start.place_name}</p>
        <StartGeo
          style={startGeoStyle}
        ref={startGeocoderContainer} />
        <button
          style={startStyle}
          onClick={() => {
            dispatch(removeStart())
            dispatch(removeGoogleUrl())
          }}
        >Remove
        </button>
      </div>
      End:<div><p>{DEPOT.end.place_name}</p>
        <EndGeo
          style={endGeoStyle}
        ref={endGeocoderContainer} />
        <button
          style={endStyle}
          onClick={() => {
            dispatch(removeEnd())
            dispatch(removeGoogleUrl())
          }}
        >Remove
        </button>
      </div>
    </Layout>
  )
}

export default StartEnd