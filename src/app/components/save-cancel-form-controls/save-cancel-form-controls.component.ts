import {Component, Input, Output, EventEmitter} from '@angular/core';


@Component({
  selector: 'app-save-cancel-form-controls',
  templateUrl: './save-cancel-form-controls.component.html',
  styleUrls: ['./save-cancel-form-controls.component.scss']
})
export class SaveCancelFormControlsComponent {

  @Input() isCancelEnabled: boolean;
  @Input() isSaveAndExitEnabled: boolean;
  @Input() isSaveAndContinueEnabled: boolean;

  @Output() cancelEvent = new EventEmitter();
  @Output() saveAndContinueEvent = new EventEmitter();
  @Output() saveAndExitEvent = new EventEmitter();

  constructor() { }

  onSaveAndContinue() {
    this.saveAndContinueEvent.emit(null);
  }

  onCancel() {
    this.cancelEvent.emit(null);
  }

  onSaveAndExit() {
    this.saveAndExitEvent.emit(null);
  }

}
