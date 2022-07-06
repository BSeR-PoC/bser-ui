import { Injectable } from '@angular/core';
import { oauth2 as SmartClient } from 'fhirclient';
import { environment } from "../environments/environment";
import {Subject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class FhirClientService {

  private fhirClient: any;
  private patient: any;

  constructor() {}

  authorize() {
    SmartClient.authorize(
      {
        clientId: environment.fhirClientId,
        scope: environment.fhirScope,
        //iss: environment.fhirIss,
        redirectUri: environment.fhirRedirectUri
      }
    );
  }

  readyClient() {
    SmartClient.ready()
      .then(client => {
        this.fhirClient = client;
        client.patient.read()
          .then((data) => {
            this.patient = data;
            console.log(data);
          })
          .catch((error: any) => {
            console.log(error)
          });
      })
      .catch((error: any) => {
        console.error(error);
      })
  }
}
