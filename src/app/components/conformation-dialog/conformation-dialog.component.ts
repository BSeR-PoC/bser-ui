import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-conformation-dialog',
  templateUrl: './conformation-dialog.component.html',
  styleUrls: ['./conformation-dialog.component.scss']
})
export class ConformationDialogComponent implements OnInit {

  content: string = "Do you want to continue?";
  title: string = null;
  confirmBtnTitle: string = "Yes";
  rejectBtnTitle: string = "No";

  constructor(
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any
  ) { }

  reject() {
    this.dialogRef.close('rejected');
  }

  confirm() {
    this.dialogRef.close('confirmed');
  }

  ngOnInit(): void {
    this.content = this.dialogData.content;
    this.title = this.dialogData.title;
    this.confirmBtnTitle = this.dialogData.confirmBtnTitle;
    this.rejectBtnTitle = this.dialogData.rejectBtnTitle;
  }
}


export function openConformationDialog(dialog: MatDialog, dialogData: any) {
  console.log("I am opened");
  const config = new MatDialogConfig();

  config.autoFocus = true;
  config.width = dialogData.width ?? "20em";
  config.height = dialogData.height ?? "10em";

  config.data = {
    ...dialogData
  }

  const dialogRef = dialog.open(ConformationDialogComponent, config);

  return dialogRef.afterClosed();
}
