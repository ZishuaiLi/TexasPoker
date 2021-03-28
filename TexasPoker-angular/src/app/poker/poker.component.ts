import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-poker',
  templateUrl: './poker.component.html',
  styleUrls: ['./poker.component.css']
})
export class PokerComponent implements OnInit {

  @Input() cardName: string;
  @Input() size:string;
  constructor() {
  }

  ngOnInit() {
  }

}
