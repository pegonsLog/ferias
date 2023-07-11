import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-created',
  templateUrl: './dialog-created.component.html',
  styleUrls: ['./dialog-created.component.scss']
})
export class DialogCreatedComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogCreatedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
