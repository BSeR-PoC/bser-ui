import { Injectable } from '@angular/core';
import { oauth2 as SmartClient } from 'fhirclient';
import { environment } from "../environments/environment";
import {from, Observable} from 'rxjs';


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

  readyClientNew(cbSuccess, cbError) {
    SmartClient.ready()
      .then(client => {
        this.fhirClient = client;
        client.patient.read()
          .then((data) => {
            this.patient = data;
            console.log(data);
            cbSuccess(data);
          })
          .catch((error: any) => {
            console.log(error)
            cbError(error);
          });
      })
      .catch((error: any) => {
        console.error(error);
        cbError(error);
      })
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

  getPatient(client): Observable<any> {
    return from (client.patient.read())
  }

  getClient(): Observable<any> {
    return from (SmartClient.ready())
  }

}
