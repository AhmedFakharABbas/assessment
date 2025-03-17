import { inject, Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private  authService=inject(AuthService);

  constructor() {
    this.socket$ = webSocket("ws://localhost:9070/ws");
  }

  get messages() {
    return this.socket$.asObservable();
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }
}
