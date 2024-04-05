import {Component, OnInit} from '@angular/core';
import {FhirClientService} from "./service/fhir-client.service";
import {ServiceRequestHandlerService} from "./service/service-request-handler.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private serviceRequestHandlerService: ServiceRequestHandlerService, private router: Router, private fhirClient: FhirClientService) {

  }

  ngOnInit(): void {
    this.serviceRequestHandlerService.isClientInitialized$.subscribe(value=> {
      console.log(value);
      if(!value){

      }
      else{
        this.router.navigate(['/'])
      }
    })
  };

}
