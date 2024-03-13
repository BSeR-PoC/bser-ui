import {Component, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ActivatedRoute} from "@angular/router";
import {skipWhile, switchMap} from "rxjs";
import {MappedServiceRequest} from "../../models/mapped-service-request";

export class MappedSimpleObservation {
  name: string;
  value: number;
  unit: string;
  constructor(observationResource){
    this.name = observationResource?.code?.coding?.[0]?.display;
    this.value = observationResource?.valueQuantity?.value;
    this.unit = observationResource?.valueQuantity?.unit;
  }
}

export class ObservationComponents{


}

export class MappedCompositeObservation {
  name: string;
  components: MappedSimpleObservation[];
  constructor(observationResource){
    this.name = observationResource?.code?.coding?.[0]?.display;
    this.components = observationResource.component.map(component => new MappedSimpleObservation(component));
  }
}

@Component({
  selector: 'app-active-referrals',
  templateUrl: './active-referrals.component.html',
  styleUrl: './active-referrals.component.scss'
})
export class ActiveReferralsComponent implements OnInit{

  serviceRequest: MappedServiceRequest;
  data: any;
  mappedObservations: {mappedSimpleObservations: [MappedSimpleObservation], mappedComponentObservations: [MappedCompositeObservation]};

  constructor(private serviceRequestHandler: ServiceRequestHandlerService, private activeRoute: ActivatedRoute){}

  ngOnInit(): void {
    this.serviceRequestHandler.mappedServiceRequests.pipe(
      skipWhile(mappedServiceRequests => !mappedServiceRequests?.length),
      switchMap(mappedServiceRequests => {
          const serviceRequestID = this.activeRoute.snapshot.params['serviceRequestId'];
          this.serviceRequest = mappedServiceRequests.find(serviceRequest => serviceRequest.serviceRequestId == serviceRequestID);
          return this.serviceRequestHandler.getDataByQueryStr(this.serviceRequest.supportingInfoRef);
        })
    ).subscribe({
      next: value=> {
        this.data = value;
        this.mappedObservations = this.mapObservations(value);
      }
    })
  }

  private mapObservations(bundle: any): { mappedSimpleObservations: [MappedSimpleObservation], mappedComponentObservations: [MappedCompositeObservation]}{
    const simpleObservations = bundle?.entry?.filter(entry => entry?.resource?.resourceType == "Observation" && !entry.resource.component).map(entry => entry.resource);
    const mappedSimpleObservations = simpleObservations.map(observation => new MappedSimpleObservation(observation));
    const compositeObservations = bundle?.entry?.filter(entry => entry?.resource?.resourceType == "Observation" && entry.resource.component).map(entry => entry.resource);
    const mappedComponentObservations = compositeObservations.map(observation => new MappedCompositeObservation(observation));
    return {mappedSimpleObservations: mappedSimpleObservations, mappedComponentObservations: mappedComponentObservations};
  }
}
