import { Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: "root",
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

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
