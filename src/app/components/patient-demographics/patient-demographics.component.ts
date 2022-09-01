import { Component, OnInit } from '@angular/core';
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {FhirClientService} from "../../fhir-client.service";
import {Organization} from "@fhir-typescript/r4-core/dist/fhir/Organization";

@Component({
  selector: 'app-patient-demographics',
  templateUrl: './patient-demographics.component.html',
  styleUrls: ['./patient-demographics.component.scss']
})
export class PatientDemographicsComponent implements OnInit {
  patient: Patient;
  insuranceProvider: Organization;
  constructor(private fhirClient: FhirClientService) { }

  ngOnInit(): void {
    this.fhirClient.getPatient().subscribe({
      next: value => this.patient = Object.assign(new Patient(), value),
      error: console.error
    });

    this.fhirClient.getCoverage().subscribe({
      next: value => this.insuranceProvider = value?.entry?.find(entry => entry.resource.resourceType === "Organization")?.resource,
      error: console.error
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

  stringToDate(date: string) {
    if(!date){
      return null
    }
    return new Date(date);
  }
}
