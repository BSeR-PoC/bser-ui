import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ReferralService {

  //TODO: find out the environment and update the variables.
  serverBase = environment.production;

  constructor(private http: HttpClient) { }

  //The minimum data we need to create a referral is the patient id
  createReferral(params: any): Observable<any[]> {
    const requestBody = {
      params: params
    };

    return this.http.post<any[]>(this.serverBase + 'referral', requestBody);
  }
}
