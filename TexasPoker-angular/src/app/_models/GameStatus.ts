import {Player} from './Player';


export class GameStatus {
  id:number;
  started:boolean;
  host: string;
  currentPlayer: string;
  player: Player;
  otherPlayers: Player[];
  cards: string[];
  maxBets: number;
  winner: string;
}

