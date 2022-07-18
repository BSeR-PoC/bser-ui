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
  @Input() isSubmitBtnRendered: boolean;
  @Input() isSubmitBtnEnabled: boolean;

  @Output() cancelEvent = new EventEmitter();
  @Output() saveAndContinueEvent = new EventEmitter();
  @Output() saveAndExitEvent = new EventEmitter();
  @Output() submitEvent = new EventEmitter();

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

  onSubmit() {
    this.submitEvent.emit(null);
  }

}
