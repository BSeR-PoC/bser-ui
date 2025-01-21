import {Component, OnDestroy, OnInit} from '@angular/core';
import {ServiceRequestHandlerService} from "../../service/service-request-handler.service";
import {ActivatedRoute} from "@angular/router";
import {distinctUntilChanged, skipWhile, Subject, switchMap, tap} from "rxjs";
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

export class MappedCompositeObservation {
  name: string;
  components: MappedSimpleObservation[];
  constructor(observationResource){
    this.name = observationResource?.code?.coding?.[0]?.display;
    this.components = observationResource.component.map(component => new MappedSimpleObservation(component));
  }
}

@Component({
    selector: 'app-referral-details',
    templateUrl: './referral-details.component.html',
    styleUrl: './referral-details.component.scss',
    standalone: false
})
export class ReferralDetailsComponent implements OnInit, OnDestroy{

  serviceRequest: MappedServiceRequest;
  data: any;
  mappedObservations: {mappedSimpleObservations: [MappedSimpleObservation], mappedComponentObservations: [MappedCompositeObservation]};
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private serviceRequestHandler: ServiceRequestHandlerService, private activeRoute: ActivatedRoute) {
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.serviceRequestHandler.mappedServiceRequests.pipe(
      skipWhile(mappedServiceRequests => !mappedServiceRequests?.length),
      distinctUntilChanged(),
      switchMap(mappedServiceRequests => {
        const serviceRequestID = this.activeRoute.snapshot.params['serviceRequestId'];
        this.serviceRequest = mappedServiceRequests.find(serviceRequest => serviceRequest.serviceRequestId == serviceRequestID);
        return this.serviceRequestHandler.getDataByQueryStr(this.serviceRequest.supportingInfoRef);
      })
    ).subscribe({
      next: value => {
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
