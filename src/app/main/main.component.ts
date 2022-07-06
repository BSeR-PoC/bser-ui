import { Component, OnInit } from '@angular/core';
import {FhirClientService} from "../fhir-client.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private fhirClient: FhirClientService) { }

  ngOnInit(): void {
    // Ready the SMART JS Client after redirect is complete.
    this.fhirClient.readyClient();
  }

}
