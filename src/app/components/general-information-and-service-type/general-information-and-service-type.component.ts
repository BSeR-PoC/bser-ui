import {Component, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";

@Component({
  selector: 'app-general-information-and-service-type',
  templateUrl: './general-information-and-service-type.component.html',
  styleUrls: ['./general-information-and-service-type.component.scss']
})
export class GeneralInformationAndServiceTypeComponent implements OnInit {

   // Multiple checkbox reactive form solution inspired by:
   // https://stackblitz.com/edit/multi-checkbox-form-control-angular7

  generalInfoServiceTypeForm: FormGroup;

  constructor(
    public fhirConstants: FhirTerminologyConstants
  ) { }

  ngOnInit(): void {
    this.generalInfoServiceTypeForm = new FormGroup({
      serviceType:  new FormControl(null, [Validators.required]),
      raceCategoriesListCheckboxes: this.createRaceCategoryControls(this.fhirConstants.RACE_CATEGORIES.slice(0,5)),
      raceCategoriesListRadioBtns: new FormControl(),
      educationLevel: new FormControl(null, [Validators.required]),
      employmentStatus: new FormControl(null, [Validators.required]),
      ethnicity: new FormControl(null, [Validators.required])
    });
  }

  onSubmit() {
    console.log(this.generalInfoServiceTypeForm );
    console.log(this.getSelectedRaceCategories());
    this.generalInfoServiceTypeForm.markAllAsTouched();
  }

  getSelectedRaceCategories() {
    const result =  this.generalInfoServiceTypeForm.controls['raceCategoriesListCheckboxes']["controls"]
      .map(
        (category, i) => {
          if(category.value){
            return this.fhirConstants.RACE_CATEGORIES.slice(0,5)[i]
          }
          else {
            return null
          }
        }
      )
      .filter( item => item !== null)
    return result;
  }

  private createRaceCategoryControls(raceCategories) {
    const arr = raceCategories.map(category => {
      return new FormControl(category.selected || false);
    });
    return new FormArray(arr);
  }

  /**
   * When the user selects any of the checkboxes for the race, we want to deselect the radio buttons.
   * This is because we cannot have a selected race value and simultaneously
   * selected Unknown or Asked but no answer value selected.
   */
  onRaceCategoryCheckboxChange(event: any) {
    const raceSelected = this.generalInfoServiceTypeForm
      .get("raceCategoriesListCheckboxes")
      .value
      .find(item => !!item);
    if(raceSelected) {
      this.generalInfoServiceTypeForm.patchValue({
        raceCategoriesListRadioBtns: null,
      });
    }
  }

  /**
   * When the user selects any of the radio buttons for the race, we want to deselect the checkboxes.
   * This is because we cannot have a selected Unknown or Asked but no answer radio selected  and simultaneously
   * selected known value for Race.
   */
  onRaceCategoryRadioBtnChange(event: any) {
    this.generalInfoServiceTypeForm
      .controls['raceCategoriesListCheckboxes']['controls']
      .forEach(control => control.patchValue(false));
  }

  isRaceSelected(){
    if(this.generalInfoServiceTypeForm
      .get("raceCategoriesListCheckboxes")
      .value
      .find(item => !!item)
      ||
      this.generalInfoServiceTypeForm
        .get("raceCategoriesListRadioBtns")
        .value
    ){
      return true;
    }
    else {
      return false;
    }
  }

  isControlValid(controlName: string, errorCode: string): boolean {
   return this.generalInfoServiceTypeForm.get(controlName).hasError(errorCode)
    && this.generalInfoServiceTypeForm.get(controlName).touched;
  }

  onCancel() {
    this.generalInfoServiceTypeForm.reset();
  }

  onSaveAndContinue() {
    console.log('onSaveAndContinue');
    this.onSubmit();
  }

  onSaveAndExit() {
    console.log('onSaveAndExit');
    this.onSubmit();
  }
}
