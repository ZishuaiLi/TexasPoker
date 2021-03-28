import {Component, OnInit} from '@angular/core';

import {GameService} from '../_services/game.service';
import {NotificationService} from '../_services/notification.service';
import {GameStatus} from '../_models/GameStatus';
import {AppComponent} from '../app.component';
import {MatDialog} from '@angular/material';
import {DialogRequireRoomidComponent} from '../dialog-require-roomid/dialog-require-roomid.component';
import {AuthService} from '../_services/auth.service';

@Component({ templateUrl: 'home.component.html' ,

  styleUrls: ['home.component.css']})
  export class HomeComponent implements OnInit {

  enableCheck: boolean;
  enableCall: boolean;
  enableRaise: boolean;
  enableAllIn: boolean;
  enableFold: boolean;

  gameStatus: GameStatus;
  gameTips: string;
  gameTipsClass: string;
  intervalId = 0

  isInitializing = true;

  private forceDisableButtons: boolean;

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private notifService: NotificationService,
    private appComponent: AppComponent,
    private dialog: MatDialog
  ) {
    this.gameStatus = {
      id: -1,
      started: false, //Game is not started at the beginning
      host: "",
      currentPlayer: "",
      player: null,
      otherPlayers: [],
      cards: [],
      maxBets: -1,
      winner: "No winner",
    };
  }

  ngOnInit() {
    this.gameTips = "Game is initializing";
    this.gameTipsClass = "game-tips game-tips-inactive";
    this.updateButtons();
    this.intervalId = setInterval(() => {
      this.updateGameStatus();
    }, 500); //update game status per 500ms
  }

  private updateGameStatus() {
    this.gameService.getGameStatus().subscribe(
      gameStatus => {
        if (!gameStatus)
          return;
        this.isInitializing = false;
        this.gameStatus = gameStatus;
        this.sortPlayers();
        this.updateButtons();
        this.updateGameTips();
      },
      error => {
        this.notifService.showNotif(error, 'error');
      });
  }

  private updateButtons() {
    if (this.forceDisableButtons ||
      this.gameStatus.id === -1 ||
      this.gameStatus.started === false ||
      this.gameStatus.currentPlayer !== this.gameStatus.player.name) {
      this.enableAllButton(false);
      return
    }
    this.enableAllButton(true);
    this.enableCheck = this.gameStatus.maxBets == this.gameStatus.player.bet;
    this.enableCall = this.gameStatus.maxBets != this.gameStatus.player.bet;
  }

  private updateGameTips() {
    if (this.gameStatus.started === false)
    {
      if (this.gameStatus.winner === "No winner") {
        this.gameTips = "Waiting for " +
          (this.gameStatus.host === this.gameStatus.player.name ? "you" : this.gameStatus.host) + " to start game.";
      }
      else {
        this.gameTips = this.gameStatus.winner + " is the winner!";
      }
      this.gameTipsClass = "game-tips game-tips-inactive";
      return;
    }


    if (this.gameStatus.player.name != this.gameStatus.currentPlayer)
    {
      let remainingTime: number = 0;
      this.gameStatus.otherPlayers.forEach((value => {
        if (value.name == this.gameStatus.currentPlayer)
          remainingTime = value.remainTime;
        }));
      this.gameTips = "Current player is " + this.gameStatus.currentPlayer +
        " , and " + remainingTime + " second left.";
      this.gameTipsClass = "game-tips game-tips-inactive"
    }
    else {
      this.gameTips = "It is your turn! You have " + this.gameStatus.player.remainTime + " second left.";
      this.gameTipsClass = "game-tips game-tips-active"
    }
  }

  private enableAllButton(status: boolean) {
    this.enableCheck = status;
    this.enableCall = status;
    this.enableRaise = status;
    this.enableAllIn = status;
    this.enableFold = status;
  }

  doAction(action:string) {
    this.forceDisableButtons = true;
    this.enableAllButton(false);
    setTimeout(()=>this.forceDisableButtons = false, 1000);
    this.gameService.postAction(this.gameStatus.id, action).subscribe(
      result =>{
        if (result['message'] !== 'OK')
          this.notifService.showNotif(result['message'], "confirm", 1000);
      }
    );
  }

  logout() {
    clearInterval(this.intervalId);
    this.appComponent.logout();
  }

  deleteAccount()
  {
    this.authService.deleteAccount().subscribe(result => {
      this.notifService.showNotif("You have deleted your account", "confirm", 1000);
    });
    this.logout();
  }

  createGame()
  {
    if (this.gameStatus.id > 0)
      this.leaveGame();
    this.gameService.createGame().subscribe(
      roomID =>{
        this.notifService.showNotif('The ID of the room you created is ' + roomID, "confirm", 1000);
      }
    );
  }

  joinGame()
  {
    let roomID:number = -1;
    const dialogRef = this.dialog.open(DialogRequireRoomidComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof(result) != "number")
        return;
      roomID = result;
      if (roomID < 0)
        return;
      this.gameService.joinGame(roomID).subscribe(
        result =>{
          this.notifService.showNotif( result['message'], "confirm", 1000);
        }
      );
    });
  }

  leaveGame()
  {
    this.gameService.leaveGame(this.gameStatus.id).subscribe(
      result =>{
        this.notifService.showNotif(result['message'], "confirm", 1000);
      }
    );
  }

  startGame()
  {
    this.gameService.startGame(this.gameStatus.id).subscribe(
      result =>{
        this.notifService.showNotif(result['message'], "confirm", 1000);
      }
    );
  }


  sortPlayers()
  {
    this.gameStatus.otherPlayers.sort((a, b) => {
      let aOrder = a.order === -1 ? 1000 : a.order;
      let bOrder = b.order === -1 ? 1000 : b.order;
      return aOrder - bOrder;
    });
  }
}
