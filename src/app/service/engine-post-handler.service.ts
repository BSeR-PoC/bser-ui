import { Injectable } from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {FhirClientService} from "./fhir-client.service";
import {Coverage} from "@fhir-typescript/r4-core/dist/fhir/Coverage";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";
import {environment} from "../../environments/environment";
import {Parameters} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ParameterHandlerService} from "./parameter-handler.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EnginePostHandlerService {

  patient: Patient;
  coverage: Coverage;
  requester: Practitioner;
  serverUrl: string;

  constructor(private fhirClient: FhirClientService, private http: HttpClient, private parameterHandler: ParameterHandlerService) {
    this.fhirClient.getPatient().subscribe({
      next: value => { this.patient = value;}
    });
    this.fhirClient.getCoverage().subscribe({
      next: value => { this.coverage = value?.entry?.find(entry => entry.resource.resourceType === "Coverage")?.resource;}
    });
    this.fhirClient.getPractitioner().subscribe({
      next: value => { this.requester = value;}
    });
    this.fhirClient.serverUrl$.subscribe({
      next: value => { this.serverUrl = value;}
    });
  }

  postToEngine(serviceRequest: ServiceRequest, parameters: Parameters) {
    let parametersCopy: Parameters = Object.assign(new Parameters(), parameters);
    let serviceRequestCopy: ServiceRequest = Object.assign(new ServiceRequest(), serviceRequest);
    serviceRequestCopy.supportingInfo.length = 0; // Remove Supporting Info

    // Package The Resources
    parametersCopy = this.parameterHandler.setResourceParameter(parametersCopy, "referral", serviceRequestCopy.toJSON());
    parametersCopy = this.parameterHandler.setResourceParameter(parametersCopy, "patient", this.patient);
    parametersCopy = this.parameterHandler.setResourceParameter(parametersCopy, "requester", this.requester);
    parametersCopy = this.parameterHandler.setResourceParameter(parametersCopy, "coverage", this.coverage);
    parametersCopy = this.parameterHandler.setStringParameter(parametersCopy, "bserProviderBaseUrl", environment.bserProviderServer);

    // TODO: Replace with HTTP Call, this is for demo purposes.
    console.log(parametersCopy.toJSON());
    let headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set("Authorization", "Basic " + btoa(environment.bserEngineBasicAuthUser + ":" + environment.bserEngineBasicAuthPass));
    console.log(headers);
    return this.http.post(environment.bserEngineEndpoint, parametersCopy.toJSON(), {headers: headers});
  }



}
