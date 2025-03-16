import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  of,
  catchError,
  debounceTime,
  map,
  retry,
  switchMap,
  takeUntil,
  timer,
  Subject
} from 'rxjs';
import { LocationModel } from '../models/location';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private overpassUrl = 'https://overpass-api.de/api/interpreter';
  private searchTrigger = new BehaviorSubject<string>('');
  private cancelRequests$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  searchCity(city: string): void {
     this.searchTrigger.next(city);
  }

  getCityCoordinates(citysearched:string): Observable<LocationModel | null> {
    return this.searchTrigger.pipe(
      debounceTime(300),
      takeUntil(this.cancelRequests$),
      switchMap((city) =>
        this.http.get<any[]>(`${this.nominatimUrl}?q=${citysearched}&format=json&limit=1`).pipe(
          retry(3), // Retry up to 3 times if API fails
          map((results) => {
            if (results.length > 0) {
              const result = results[0];
              return {
                name: result.name ?? city,
                displayName: result.display_name,
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                placeId: result.place_id,
                osmType: result.osm_type,
                osmId: result.osm_id,
                type: result.type,
              } as LocationModel;
            }
            return null;
          }),
          catchError(() => of(null))
        )
      )
    );
  }

  getNearbyRestaurants(lat: number, lon: number): Observable<any[]> {
    const query = `[out:json];node["amenity"="restaurant"](around:1000,${lat},${lon});out body;`;
    return this.http.get<{ elements: any[] }>(`${this.overpassUrl}?data=${query}`).pipe(
      takeUntil(this.cancelRequests$),
      retry(3),
      map((response) => response.elements),
      catchError(() => of([]))
    );
  }

  cancelRequests(): void {
    this.cancelRequests$.next();
  }

  autoRefreshRestaurants(lat: number, lon: number): Observable<any[]> {
    return timer(0, 30000).pipe(
      switchMap(() => this.getNearbyRestaurants(lat, lon))
    );
  }
}
