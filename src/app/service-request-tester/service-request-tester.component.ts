import { Component, OnInit } from '@angular/core';
import { ServiceRequestHandlerService } from '../service/service-request-handler.service';

@Component({
  selector: 'app-service-request-tester',
  templateUrl: './service-request-tester.component.html',
  styleUrls: ['./service-request-tester.component.scss']
})
export class ServiceRequestTesterComponent implements OnInit {

  constructor(private serviceRequestHandler: ServiceRequestHandlerService) { }

  ngOnInit(): void {
      // TODO: REMOVE THIS COMPONENT INCLUDING ROUTE, TESTING ONLY
      console.log("Loading Service Request Testing Component");
      this.serviceRequestHandler.createNewServiceRequest();
  }

}
