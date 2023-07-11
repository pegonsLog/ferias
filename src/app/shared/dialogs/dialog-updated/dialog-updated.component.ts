import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-updated',
  templateUrl: './dialog-updated.component.html',
  styleUrls: ['./dialog-updated.component.scss']
})
export class DialogUpdatedComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogUpdatedComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onCancel(): void {
    this.dialogRef.close();
  }
}
