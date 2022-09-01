import { Component, OnInit } from '@angular/core';
import {FhirClientService} from "../service/fhir-client.service";
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  patient: Patient;
  constructor(private fhirClient: FhirClientService) { }

  ngOnInit(): void {
 //   this.fhirClient.readyClient();

    this.fhirClient.getPatient().subscribe({
      next: (result) => {
        this.patient = result;
      }
    })

  }

}
