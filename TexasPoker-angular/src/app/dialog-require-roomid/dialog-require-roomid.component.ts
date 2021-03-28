import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';



@Component({
  selector: 'dialog-require-roomid.component',
  templateUrl: 'dialog-require-roomid.component.html',
})
export class DialogRequireRoomidComponent {
  id: number;

  constructor(
    public dialogRef: MatDialogRef<DialogRequireRoomidComponent>,
    ) {}

  public numberOnly(event): boolean {
    let code = 0;
    if (event.key !== undefined) {
      code = event.key.charCodeAt(0);
    } else if (event.keyCode !== undefined) {
      code = event.keyCode;
    }
    return !(code > 31 && (code < 48 || code > 57));
  }
}

