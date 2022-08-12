import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {FhirTerminologyConstants} from "../../providers/fhir-terminology-constants";
import {Router} from "@angular/router";
import {FhirClientService} from "../../fhir-client.service";
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {USCorePatient} from "../../domain/USCorePatient";

@Component({
  selector: 'app-general-information-and-service-type',
  templateUrl: './general-information-and-service-type.component.html',
  styleUrls: ['./general-information-and-service-type.component.scss']
})
export class GeneralInformationAndServiceTypeComponent implements OnInit {

  // Multiple checkbox reactive form solution inspired by:
  // https://stackblitz.com/edit/multi-checkbox-form-control-angular7

  @Output() savedSuccessEvent = new EventEmitter();
  SAVE_AND_EXIT = 'saveAndExit';
  SAVE_AND_CONTINUE = 'saveAndContinue';

  generalInfoServiceTypeForm: FormGroup;
  usCorePatient: USCorePatient;

  constructor(
    public fhirConstants: FhirTerminologyConstants,
    private router: Router,
    private fhirClient: FhirClientService,
  ) {
  }

  ngOnInit(): void {
    this.generalInfoServiceTypeForm = new FormGroup({
      serviceType: new FormControl(null, [Validators.required]),
      raceCategoriesListCheckboxes: this.createRaceCategoryControls(this.fhirConstants.RACE_CATEGORIES.slice(0, 5)),
      raceCategoriesListRadioBtns: new FormControl(),
      educationLevel: new FormControl(null, [Validators.required]),
      employmentStatus: new FormControl(null, [Validators.required]),
      ethnicity: new FormControl(null, [Validators.required])
    });

    this.fhirClient.getPatient().subscribe({
      next: (result) => {
        const patient = Object.assign(new Patient(), result);
        this.usCorePatient = new USCorePatient(patient);
        this.updateFormControls(this.usCorePatient);
      }
    })
  }
  private updateFormControls(usCorePatient) {

    if(usCorePatient.ethnicity){
      const ethnicity = this.fhirConstants.ETHNICITY
        .find((element) => element.code === usCorePatient.ethnicity[0]?.valueCoding?.code);

      this.generalInfoServiceTypeForm.controls['ethnicity'].patchValue(ethnicity);
    }

    if(usCorePatient.race){
      //The race section of the form has two parts: checkboxes and radio buttons.

      // Populating the checkboxes first.
      const raceCodes = usCorePatient.race.map(element => element.valueCoding?.code);
      const raceCheckboxesSelectedList = this.fhirConstants.RACE_CATEGORIES
        .slice(0, 5)
        .map(element => element.code)
        .map((element) => raceCodes.indexOf(element) != -1);

      this.generalInfoServiceTypeForm.controls['raceCategoriesListCheckboxes'].patchValue(raceCheckboxesSelectedList);

      //Populating the radio buttons second.
    }
  }

  submit(nextState: string) {
    this.generalInfoServiceTypeForm.markAllAsTouched();
    console.log(this.generalInfoServiceTypeForm);
    if (this.generalInfoServiceTypeForm.valid) {
      if (nextState === this.SAVE_AND_EXIT) {
        this.router.navigate(['/'])
      } else if (nextState === this.SAVE_AND_CONTINUE) {
        this.savedSuccessEvent.emit();
      }
    }
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
    if (raceSelected) {
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

  isRaceSelected() {
    if (this.generalInfoServiceTypeForm
        .get("raceCategoriesListCheckboxes")
        .value
        .find(item => !!item)
      ||
      this.generalInfoServiceTypeForm
        .get("raceCategoriesListRadioBtns")
        .value
    ) {
      return true;
    } else {
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
    this.submit(this.SAVE_AND_CONTINUE);
  }

  onSaveAndExit() {
    this.submit(this.SAVE_AND_EXIT);
  }


}
