import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'

type Location = {
  lat: number
  lng: number
  name?: string
  raw?: any
}

export default function MapPicker({
  initial = { lat: 24.86, lng: 67.01 },
  onSelect,
}: {
  initial?: { lat: number; lng: number }
  onSelect?: (loc: Location) => void
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)

  const KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY
  if (!KEY) {
    console.warn('NEXT_PUBLIC_MAPTILER_KEY not set — set it in .env.local')
  }

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return // init once

    const map = new maplibregl.Map({
      container: mapContainer.current,
      // style from MapTiler — use your API key
      style: `https://api.maptiler.com/maps/streets/style.json?key=${KEY}`,
      center: [initial.lng, initial.lat],
      zoom: 12,
    })

    map.addControl(new maplibregl.NavigationControl())

    map.on('click', async (e: any) => {
      const lng = e.lngLat.lng
      const lat = e.lngLat.lat
      placeMarker(map, lng, lat)
      // reverse geocode
      const reverse = await reverseGeocode(lat, lng)
      const name = reverse?.features?.[0]?.properties?.label || reverse?.features?.[0]?.properties?.name || ''
      const loc = { lat, lng, name, raw: reverse }
      setSelected(loc)
      if (onSelect) onSelect(loc)
    })

    mapRef.current = map

    // cleanup
    return () => map.remove()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function placeMarker(map: any, lng: number, lat: number) {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat])
    } else {
      const el = document.createElement('div')
      el.style.width = '28px'
      el.style.height = '28px'
      el.style.borderRadius = '50%'
      el.style.background = 'linear-gradient(135deg,#ff6a00 0%,#000 100%)'
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)'
      markerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map)
    }
    map.flyTo({ center: [lng, lat], zoom: 14 })
  }

  // forward geocode (search)
  async function searchPlaces(q: string) {
    if (!q || q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${KEY}&limit=6`
      const res = await fetch(url)
      const json = await res.json()
      setResults(json.features || [])
    } catch (err) {
      console.error('search error', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // reverse geocode
  async function reverseGeocode(lat: number, lng: number) {
    try {
      const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${KEY}`
      const res = await fetch(url)
      return await res.json()
    } catch (err) {
      console.error('reverse error', err)
      return null
    }
  }

  // debounce user input
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) searchPlaces(query.trim())
      else setResults([])
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  async function pickFeature(feat: any) {
    const [lng, lat] = feat.geometry.coordinates
    const name = feat.properties?.label || feat.properties?.name || feat.place_name || ''
    setSelected({ lat, lng, name, raw: feat })
    setResults([])
    setQuery(name)
    if (mapRef.current) {
      placeMarker(mapRef.current, lng, lat)
    }
    if (onSelect) onSelect({ lat, lng, name, raw: feat })
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 360, maxWidth: '40vw' }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Search place</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city, address or POI"
          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
        />
        <div style={{ position: 'relative' }}>
          {loading && <div style={{ padding: 8 }}>Searching...</div>}
          {results.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 8, border: '1px solid #eee', borderRadius: 6, maxHeight: 300, overflow: 'auto' }}>
              {results.map((r) => (
                <li key={r.id} onClick={() => pickFeature(r)} style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #f3f3f3' }}>
                  <div style={{ fontWeight: 600 }}>{r.properties?.name || r.properties?.label || r.place_name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{r.properties?.label || r.place_name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Selected:</strong>
          <div style={{ marginTop: 6 }}>
            {selected ? (
              <div>
                <div>{selected.name}</div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  {selected.lat.toFixed(6)}, {selected.lng.toFixed(6)}
                </div>
              </div>
            ) : (
              <div style={{ color: '#666' }}>Click on map or search to pick a location</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => {
              if (selected && onSelect) onSelect(selected)
              alert(selected ? `Picked: ${selected.name || ''} (${selected.lat}, ${selected.lng})` : 'No location selected')
            }}
            style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: '#111', color: '#fff' }}
          >
            Confirm location
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 480 }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: 480 }} />
      </div>
    </div>
  )
}
