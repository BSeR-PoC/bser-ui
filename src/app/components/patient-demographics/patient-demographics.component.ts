import { Component, OnInit } from '@angular/core';
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {FhirClientService} from "../../fhir-client.service";

@Component({
  selector: 'app-patient-demographics',
  templateUrl: './patient-demographics.component.html',
  styleUrls: ['./patient-demographics.component.scss']
})
export class PatientDemographicsComponent implements OnInit {
  patient: Patient;
  constructor(private fhirClient: FhirClientService) { }

  ngOnInit(): void {
    this.fhirClient.getPatient().subscribe({
      next: value => { this.patient = Object.assign(new Patient(), value); console.log(typeof this.patient); console.log(this.patient instanceof Patient)}
    });
  }

}
