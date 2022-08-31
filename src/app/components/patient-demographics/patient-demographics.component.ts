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
      next: value => { this.patient = Object.assign(new Patient(), value);}
    });
  }

  getLanguageList(patient: Patient): any[] {
    let languageList = patient?.communication?.map(element => {
      if (element.language?.text){
        return element.language?.text;
      }
      else if (element.language?.coding?.[0]?.display){
        return element.language?.coding?.[0]?.display.charAt(0).toUpperCase() + element.language?.coding?.[0]?.display.slice(1);
      }
      else if(element.language?.coding?.[0]?.code) {
        return element.language?.coding?.[0]?.code.charAt(0).toUpperCase() + element.language?.coding?.[0]?.code.slice(1);
      }
      else return null;
    }).filter(
      element => !!element
    );
    return languageList;
  }
}
