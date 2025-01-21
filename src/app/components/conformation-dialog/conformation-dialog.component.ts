import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-conformation-dialog',
    templateUrl: './conformation-dialog.component.html',
    styleUrls: ['./conformation-dialog.component.scss'],
    standalone: false
})
export class ConformationDialogComponent implements OnInit {

  content: string = "Do you want to continue?";
  title: string = null;
  defaultActionBtnTitle: string = "Yes";
  secondaryActionBtnTitle: string = "No";

  constructor(
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) private dialogData: any
  ) { }

  onSecondaryClick() {
    this.dialogRef.close('secondaryAction');
  }

  onDefaultClick() {
    this.dialogRef.close('defaultAction');
  }

  ngOnInit(): void {
    this.content = this.dialogData.content;
    this.title = this.dialogData.title;
    this.defaultActionBtnTitle = this.dialogData.defaultActionBtnTitle;
    this.secondaryActionBtnTitle = this.dialogData.secondaryActionBtnTitle;
  }
}


export function openConformationDialog(dialog: MatDialog, dialogData: any) {

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
