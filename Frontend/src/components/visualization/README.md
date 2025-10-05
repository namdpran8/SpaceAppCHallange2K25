# OrbitVisualizer3D Integration Guide

## Overview
Production-quality 3D exoplanet orbital visualization component with full interactivity, transit detection, and light curve synchronization.

## Features
- ✨ Interactive 3D scene with realistic orbital mechanics
- 🎯 Transit detection and highlighting
- ⏱️ Time-based animation with play/pause and speed control
- 🔄 Two-way synchronization with light curve charts
- 📊 Detailed planet information panel
- 📸 Screenshot/export functionality
- 📱 Mobile responsive with touch controls
- ⌨️ Full keyboard navigation support

## Installation

Required dependencies (already installed):
```bash
npm install three @react-three/fiber@^8.18 @react-three/drei@^9.122.0
```

## Basic Usage

```tsx
import { OrbitVisualizer3D, DEMO_DATA } from '@/components/visualization/OrbitVisualizer3D';
import '@/components/visualization/OrbitVisualizer3D.css';

function MyComponent() {
  return (
    <div>
      <OrbitVisualizer3D data={DEMO_DATA} />
    </div>
  );
}
```

## Integration with Dashboard

Add to your Visualization tab:

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrbitVisualizer3D } from '@/components/visualization/OrbitVisualizer3D';
import '@/components/visualization/OrbitVisualizer3D.css';

<Tabs defaultValue="lightcurve">
  <TabsList>
    <TabsTrigger value="lightcurve">Light Curve</TabsTrigger>
    <TabsTrigger value="orbit">3D Orbit</TabsTrigger>
  </TabsList>
  
  <TabsContent value="lightcurve">
    {/* Your light curve chart */}
  </TabsContent>
  
  <TabsContent value="orbit">
    <OrbitVisualizer3D />
  </TabsContent>
</Tabs>
```

## Data Format

```typescript
interface OrbitData {
  star: {
    id: string;
    name: string;
    radius_solar: number;
    color: string; // hex color
  };
  planets: Array<{
    id: string;
    name: string;
    semi_major_axis_AU: number;
    eccentricity: number;
    inclination_deg: number;
    argument_of_peri_deg: number;
    ascending_node_deg: number;
    mean_anomaly_deg: number;
    period_days: number;
    radius_earth: number;
    color: string; // hex color
    transit_times_unix: number[]; // Unix timestamps
    detection_probability: number; // 0-100
  }>;
  epoch_unix: number; // Reference time
}
```

## Event System

### Events Emitted by OrbitVisualizer3D

```typescript
// Fired when simulation time changes (during animation or scrubbing)
window.addEventListener('exoTimeChange', (e: CustomEvent) => {
  console.log('Current time:', e.detail.time_unix);
});

// Fired when user clicks on a planet
window.addEventListener('exoPlanetSelected', (e: CustomEvent) => {
  console.log('Selected planet:', e.detail.planetId);
});

// Fired when a transit is detected
window.addEventListener('exoTransitEvent', (e: CustomEvent) => {
  console.log('Transit detected:', e.detail.planetId, e.detail.transitTime);
  // Use this to highlight the corresponding dip in your light curve
});
```

### Events Listened by OrbitVisualizer3D

```typescript
// Seek to specific time from light curve (when "Sync with Light Curve" is enabled)
window.dispatchEvent(new CustomEvent('exoLightCurveSeek', {
  detail: { time_unix: 1696200000 }
}));
```

## Light Curve Integration Example

```tsx
// In your light curve component
const handleLightCurveDipClick = (transitTime: number) => {
  // This will make the 3D orbit jump to this time
  window.dispatchEvent(new CustomEvent('exoLightCurveSeek', {
    detail: { time_unix: transitTime }
  }));
};

// Listen for orbit updates to highlight on light curve
useEffect(() => {
  const handleTransit = (e: Event) => {
    const event = e as CustomEvent;
    highlightTransitOnChart(event.detail.transitTime);
  };
  
  window.addEventListener('exoTransitEvent', handleTransit);
  return () => window.removeEventListener('exoTransitEvent', handleTransit);
}, []);
```

## Keyboard Controls

- **Space**: Play/Pause animation
- **Left/Right Arrows**: Scrub time backward/forward
- **Escape**: Close info panel

## Mouse/Touch Controls

- **Drag**: Rotate camera
- **Scroll/Pinch**: Zoom in/out
- **Click planet**: Select and show info
- **Two-finger drag**: Pan camera (mobile)

## API Integration

To fetch data from your backend:

```tsx
const [orbitData, setOrbitData] = useState(null);

useEffect(() => {
  fetch('/api/visualize/3d?sample=true')
    .then(res => res.json())
    .then(data => setOrbitData(data));
}, []);

return orbitData ? <OrbitVisualizer3D data={orbitData} /> : <Loading />;
```

## Customization

### Props

```typescript
<OrbitVisualizer3D
  data={myData}           // OrbitData object
  containerId="my-orbit"  // Custom container ID (default: "exo-3d-orbit")
/>
```

### Styling

All styles are scoped with `.exo-orbit-3d` prefix. To customize:

```css
/* Override specific styles */
.exo-orbit-3d__controls-panel {
  background: rgba(0, 0, 0, 0.9) !important;
}

.exo-orbit-3d__play-btn {
  background: your-custom-color !important;
}
```

## Performance Tips

- Component automatically pauses when tab is hidden
- Trails are limited to last 50 positions
- Low-poly geometry for optimal performance
- Uses instanced meshes for future scalability

## Mobile Fallback

On very small screens (<480px), the component remains interactive but with simplified controls. WebGL unavailable? The component will show a fallback message.

## Demo Mode

The component ships with two example planets:
- **Exo-1b**: Edge-on orbit (89.2° inclination) - transits visible
- **Exo-1c**: Inclined orbit (45°) - no transits from viewer perspective

Use the "Use Example Transit" workflow by playing the animation to see a live transit.

## Troubleshooting

### Canvas is blank
- Check browser WebGL support: `chrome://gpu`
- Ensure dependencies are installed correctly
- Check console for Three.js errors

### Performance issues
- Disable trails with the toggle
- Reduce animation speed
- Close other GPU-intensive tabs

### Events not firing
- Ensure "Sync with Light Curve" is enabled
- Check event listeners are attached before component mounts
- Verify event names match exactly (case-sensitive)

## License & Credits

Built for NASA Space Apps Challenge 2025 by Dark Mode Devs.
Uses Three.js, React Three Fiber, and React Three Drei.
