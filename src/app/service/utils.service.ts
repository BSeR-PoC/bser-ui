import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private _snackBar: MatSnackBar) { }

  showErrorNotification(messageStr: string = 'Server Error.'){
    this._snackBar.open(messageStr, 'x' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ["error-message"],
      duration: 10000
    });
  }

  showSuccessNotification(messageStr: string){
    this._snackBar.open(messageStr, 'x' ,{
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['mat-toolbar', 'mat-primary'],
      duration: 5000
    });
  }

  /*
  * Checks if an object is "empty"
  * An empty object has no keys
  * OR
  * All values for the keys are falsy
  * */
  isEmpty(object: any) {
    if(!object || Object.keys(object).length == 0){
      return true;
    }
    const isEmpty = !Object.values(object).some(x => x !== null && x !== '');
    return isEmpty
  }

}
