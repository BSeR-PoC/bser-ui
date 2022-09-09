import { Injectable } from '@angular/core';
import {ServiceRequest} from "@fhir-typescript/r4-core/dist/fhir/ServiceRequest";
import {Patient} from "@fhir-typescript/r4-core/dist/fhir/Patient";
import {FhirClientService} from "./fhir-client.service";
import {Coverage} from "@fhir-typescript/r4-core/dist/fhir/Coverage";
import {Practitioner} from "@fhir-typescript/r4-core/dist/fhir/Practitioner";

import {fhirclient} from "fhirclient/lib/types";
import {Parameters, ParametersParameter} from "@fhir-typescript/r4-core/dist/fhir/Parameters";
import {ParameterHandlerService} from "./parameter-handler.service";
import {Reference} from "@fhir-typescript/r4-core/dist/fhir";

@Injectable({
  providedIn: 'root'
})
export class EnginePostHandlerService {

  patient: Patient;
  coverage: Coverage;
  requester: Practitioner;
  serverUrl: string;

  constructor(private fhirClient: FhirClientService, private parameterHandler: ParameterHandlerService) {
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
    let serviceRequestCopy: ServiceRequest = Object.assign(new ServiceRequest(), serviceRequest)
    serviceRequestCopy.supportingInfo.length = 0; // Remove Supporting Info

    // Package The Resources
    parameters = this.parameterHandler.setResourceParameter(parameters, "referral", serviceRequestCopy);
    parameters = this.parameterHandler.setResourceParameter(parameters, "patient", this.patient);
    parameters = this.parameterHandler.setResourceParameter(parameters, "requester", this.requester);
    parameters = this.parameterHandler.setResourceParameter(parameters, "coverage", this.patient);
    parameters = this.parameterHandler.setStringParameter(parameters, "bserProviderBaseUrl", this.serverUrl);

    // TODO: Replace with HTTP Call, this is for demo purposes.
    console.log(parameters.toJSON());
  }



}
