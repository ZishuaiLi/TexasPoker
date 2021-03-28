import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GameStatus} from '../_models/GameStatus';
import {HttpClient} from '@angular/common/http';



@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient) {
  }

  postAction(roomID: number, action:string) {
    return this.http.post(`http://localhost:3030/game/action`, {roomId: roomID, action: action});
  }

  getGameStatus() {
    return this.http.get<GameStatus>(`http://localhost:3030/game/gamestatus`);
  }

  leaveGame(roomID: number) {
    return this.http.post(`http://localhost:3030/game/leaveroom`, {roomId: roomID});
  }

  startGame(roomID: number) {
    return this.http.post(`http://localhost:3030/game/startgame`, {roomId: roomID});
  }


  createGame() {
    return this.http.get<number>(`http://localhost:3030/game/createroom`);
  }

  joinGame(roomID: number) {
    return this.http.post(`http://localhost:3030/game/joinroom`, {roomId: roomID});
  }


}
