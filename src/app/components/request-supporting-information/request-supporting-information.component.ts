import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-request-supporting-information',
  templateUrl: './request-supporting-information.component.html',
  styleUrls: ['./request-supporting-information.component.scss']
})
export class RequestSupportingInformationComponent implements OnInit {

  foods: [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  supportingInformationForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.supportingInformationForm = new FormGroup({
      'height':new FormControl(null, [Validators.required]),
      'weight':new FormControl(null, [Validators.required]),
      'bmi':new FormControl(null, [Validators.required]),
      'bp':new FormControl(null, [Validators.required]),
      'allergies':new FormControl(null, [Validators.required]),
      'medicalHistory':new FormControl(null, [Validators.required]),
    });
  }

  onSubmit() {

  }
}
