import { inject, Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private authService = inject(AuthService);

  private token = this.authService.getToken();
  wsUrl = this.token
    ? `ws://localhost:9070/ws?token=${this.token}`
    : `ws://localhost:9070/ws`;

  constructor() {
    this.socket$ = webSocket(this.wsUrl);
  }

  get messages() {
    return this.socket$.asObservable();
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }
}
