import { Component, OnInit } from '@angular/core';
import {FhirClientService} from "../fhir-client.service";
import {from, switchMap, map} from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  data: any;
  constructor(private fhirClient: FhirClientService) { }

  ngOnInit(): void {
    this.fhirClient.readyClient();

    this.fhirClient.getPatient().subscribe({
      next: (result) => this.data = result
    })
  }

}
