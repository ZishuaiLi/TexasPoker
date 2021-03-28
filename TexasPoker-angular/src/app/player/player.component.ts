import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../_models/Player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  @Input() player : Player;
  @Input() isOperating: boolean;

  usingClass: string;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.isOperating == false)
      this.usingClass = "player-card-waiting";
    else
      this.usingClass = "player-card-operating";
  }
}
