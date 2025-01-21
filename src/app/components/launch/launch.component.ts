import { Component, OnInit } from '@angular/core';
import {FhirClientService} from "../../service/fhir-client.service";

@Component({
    selector: 'app-launch',
    templateUrl: './launch.component.html',
    styleUrls: ['./launch.component.scss'],
    standalone: false
})
export class LaunchComponent implements OnInit {

  constructor(private fhirClient: FhirClientService) { }

  ngOnInit(): void {
    this.fhirClient.authorize();
  }

}
