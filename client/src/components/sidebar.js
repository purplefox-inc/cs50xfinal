import React, { useState, useEffect } from "react"
import styled from "styled-components"

const SidebarElem = styled.div`
  background-color: rgba(35, 55, 75, 0.9);
  color: #fff;
  padding: 6px 12px;
  font-family: monospace;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  margin: 12px;
  border-radius: 4px;
`

const Sidebar = ({ map }) => {
    const [lng, setLng] = useState(4.5201)
    const [lat, setLat] = useState(50.8195)
    const [zoom, setZoom] = useState(11.67)
    
    useEffect(() => {
        map.on('move', () => {
          setLng(map.getCenter().lng.toFixed(4))
          setLat(map.getCenter().lat.toFixed(4))
          setZoom(map.getZoom().toFixed(2))
        })
    })

    return (
        <SidebarElem>
           Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </SidebarElem>
    )
}

export default Sidebar