import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GameStatus} from '../_models/GameStatus';
import {HttpClient} from '@angular/common/http';
import apiprefix from '../../apiprefix';


@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private http: HttpClient) {
  }

  postAction(roomID: number, action:string) {
    return this.http.post(apiprefix + `/game/action`, {roomId: roomID, action: action});
  }

  getGameStatus() {
    return this.http.get<GameStatus>(apiprefix + `/game/gamestatus`);
  }

  leaveGame(roomID: number) {
    return this.http.post(apiprefix + `/game/leaveroom`, {roomId: roomID});
  }

  startGame(roomID: number) {
    return this.http.post(apiprefix + `/game/startgame`, {roomId: roomID});
  }


  createGame() {
    return this.http.get<number>(apiprefix + `/game/createroom`);
  }

  joinGame(roomID: number) {
    return this.http.post(apiprefix + `/game/joinroom`, {roomId: roomID});
  }


}
