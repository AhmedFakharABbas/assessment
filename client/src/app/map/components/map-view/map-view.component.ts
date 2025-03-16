import {
  AfterViewInit,
  Component,
  effect,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription, BehaviorSubject, Subject, timer } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { MapService } from '../../services/map.service';
import mapboxgl from 'mapbox-gl';
import { LocationModel } from '../../models/location';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-view',
  imports: [FormsModule, CommonModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.css',
})
export class MapViewComponent implements OnDestroy, OnInit {
  private map!: mapboxgl.Map;
  private locationSub!: Subscription;
  private restaurantSub!: Subscription;
  private themeSub!: Subscription;
  private cancelRequests$ = new Subject<void>();

  errorMessage: string = '';
  searchQuery: string = '';
  location: LocationModel | null = null;
  timeout: number = 2000;
  restaurants: any[] = [];
  get isDarkMode() {
    return this.themeService.darkModeSignal();
  }
  private searchTrigger = new BehaviorSubject<string>('');

  mapboxToken =
    'pk.eyJ1IjoiYWxpLWFrYmVyLTc5IiwiYSI6ImNsYXRqMTB0bzAwY3Izdm55Zmptc2N6ZjkifQ.T28yDHgDc28SCV96kH5NUg';

  constructor(
    private mapService: MapService,
    private themeService: ThemeService
  ) {
    (mapboxgl as any).accessToken = this.mapboxToken;
    effect(() => {
      const isDark = this.isDarkMode;
      this.updateMapStyle(isDark);
    });
  }

  ngOnInit() {
    this.updateMapStyle(this.isDarkMode);
    this.setupSearchSubscription();
  }

  setupSearchSubscription(): void {
    this.searchTrigger
      .pipe(
        debounceTime(300),
        takeUntil(this.cancelRequests$),
        switchMap((query) => this.mapService.getCityCoordinates(query))
      )
      .subscribe({
        next: (location) => {
          if (location) {
            this.location = location;
            this.initializeMap();
            this.loadRestaurants();
          } else {
            setTimeout(() => {
              this.errorMessage = 'No location found. Please try again.';
            }, this.timeout);
          }
        },
        error: () => {
          setTimeout(() => {
            this.errorMessage = 'Failed to fetch location data. Please retry.';
          }, this.timeout);
        },
      });
  }

  initializeMap(): void {
    if (this.map) {
      this.map.remove();
    }
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.location!.lon, this.location!.lat],
      zoom: 13,
    });
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    new mapboxgl.Marker()
      .setLngLat([this.location!.lon, this.location!.lat])
      .setPopup(new mapboxgl.Popup().setText(this.location!.name))
      .addTo(this.map);
    this.setupMapEvents();
  }
  setupMapEvents(): void {
    if (this.map) {
      this.map.on('moveend', () => {
        const center = this.map.getCenter();
        this.loadRestaurants(center.lat, center.lng);
      });
    }
  }

  loadRestaurants(lat?: number, lon?: number): void {
    const latitude = lat ?? this.location?.lat;
    const longitude = lon ?? this.location?.lon;
    if (!latitude || !longitude) return;

    this.restaurantSub = this.mapService
      .autoRefreshRestaurants(latitude, longitude)
      .pipe(takeUntil(this.cancelRequests$))
      .subscribe({
        next: (restaurants) => {
          this.restaurants = restaurants;
          this.displayRestaurants();
        },
        error: () => {
          setTimeout(() => {
            this.errorMessage = 'Failed to fetch restaurants. Please retry.';
          }, this.timeout);
        },
      });
  }

  displayRestaurants(): void {
    if (this.map.getSource('restaurants')) {
      this.map.removeLayer('clusters');
      this.map.removeLayer('cluster-count');
      this.map.removeLayer('unclustered-point');
      this.map.removeLayer('restaurant-labels');
      this.map.removeSource('restaurants');
    }

    this.map.addSource('restaurants', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.restaurants.map((restaurant) => ({
          type: 'Feature',
          properties: {
            name: restaurant.tags.name,
            description:
              restaurant.tags.description || 'No description available',
          },
          geometry: {
            type: 'Point',
            coordinates: [restaurant.lon, restaurant.lat],
          },
        })),
      },
      cluster: true,
      clusterMaxZoom: 14, // Clusters disappear at zoom 14
      clusterRadius: 50, // Closer points will cluster together
    });

    // Clusters (when zoomed out)
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'restaurants',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ff0000',
        'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25], // Adjust size based on density
      },
    });

    // Cluster count text
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'restaurants',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 12,
      },
    });

    // Individual restaurant points (when zoomed in)
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'restaurants',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#008000',
        'circle-radius': 8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    });

    // Labels for individual restaurants
    this.map.addLayer({
      id: 'restaurant-labels',
      type: 'symbol',
      source: 'restaurants',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'name'],
        'text-offset': [0, 1.2], // Position text above marker
        'text-anchor': 'top',
        'text-size': 12,
      },
      paint: {
        'text-color': '#000',
        'text-halo-color': '#fff',
        'text-halo-width': 2,
      },
    });

    // Handle clicks to zoom in on clusters
    this.map.on('click', 'clusters', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      });
      if (!features.length) return;

      const clusterId = features[0]?.properties?.['cluster_id'];
      if (!clusterId) return;

      (this.map.getSource('restaurants') as any).getClusterExpansionZoom(
        clusterId,
        (err: unknown, zoom: number) => {
          if (err) {
            console.error('Error expanding cluster:', err);
            return;
          }

          this.map.easeTo({
            center: [e.lngLat.lng, e.lngLat.lat],
            zoom: zoom + 1,
          });
        }
      );
    });

    // Show popup on hover for individual restaurants
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.map.on('mouseenter', 'unclustered-point', (e) => {
      this.map.getCanvas().style.cursor = 'pointer';

      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];

      const coordinates = (feature.geometry as any).coordinates.slice();
      const { name, description } = feature.properties as {
        name?: string;
        description?: string;
      };

      popup
        .setLngLat(coordinates)
        .setHTML(
          `<strong>${name || 'Unknown'}</strong><br>${
            description || 'No description available'
          }`
        )
        .addTo(this.map);
    });

    this.map.on('mouseleave', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = '';
      popup.remove();
    });
  }

  searchCity(): void {
    console.log('searc trigers ');
    if (this.searchQuery.trim().length === 0) {
      this.errorMessage = '';
      return;
    }
    this.errorMessage = '';
    this.searchTrigger.next(this.searchQuery);
  }

  updateMapStyle(isDarkMode: boolean): void {
    if (this.map) {
      this.map.setStyle(
        isDarkMode
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/streets-v11'
      );
    }
  }

  retry(): void {
    this.searchTrigger.next(this.searchQuery);
  }
  ngOnDestroy(): void {
    this.cancelRequests$.next();
    this.cancelRequests$.complete();
    this.locationSub?.unsubscribe();
    this.restaurantSub?.unsubscribe();
    this.themeSub?.unsubscribe();
  }
}
