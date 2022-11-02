import { Injectable } from '@angular/core';
import {Resource} from "@fhir-typescript/r4-core/dist/fhir";
import {Bundle, BundleEntry, BundleEntryRequest} from "@fhir-typescript/r4-core/dist/fhir/Bundle";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TransactionBundleHandlerService {

  constructor(private http: HttpClient) { }


  sendTransactionBundle(method: string, resources: any[]) {
    let transBundle = new Bundle({type: "transaction"});

    if (method === "POST") {
      this.createBundlePostRequestEntries(resources).forEach(
        bundleEntry => transBundle.entry.push(bundleEntry)
      );
    }
    else if (method === "PUT") {
      this.createBundlePutRequestEntries(resources).forEach(
        bundleEntry => transBundle.entry.push(bundleEntry)
      );
    }
    else if (method === "DELETE") {
      this.createBundleDeleteRequestEntries(resources).forEach(
        bundleEntry => transBundle.entry.push(bundleEntry)
      );
    }

    return this.http.post(environment.bserProviderServer, transBundle.toJSON());
  }

  createBundlePostRequestEntries(resources: Resource[]): BundleEntry[] {
    let bundleEntries = []
    resources.forEach(resource => {
      let bundleEntry = new BundleEntry({
        fullUrl: resource.resourceType + "/" + resource.id,
        resource: resource.toJSON(),
        request: new BundleEntryRequest({
          method: "POST",
          url: resource.resourceType
        })
      });
      bundleEntries.push(bundleEntry);
    });
    return bundleEntries;
  }

  createBundlePutRequestEntries(resources: Resource[]): BundleEntry[] {
    let bundleEntries = []
    resources.forEach(resource => {
      let bundleEntry = new BundleEntry({
        fullUrl: resource.resourceType + "/" + resource.id,
        resource: resource.toJSON(),
        request: new BundleEntryRequest({
          method: "PUT",
          url: resource.resourceType + "/" + resource.id
        })
      });
      bundleEntries.push(bundleEntry);
    });
    return bundleEntries;
  }

  createBundleDeleteRequestEntries(resources: Resource[]): BundleEntry[] {
    let bundleEntries = []
    Object.entries(resources).forEach(entry => {
      if (!(entry[1] === undefined)) {
        console.log(entry[1])
        let resource:any = entry[1];
        let bundleEntry = new BundleEntry({
          //fullUrl: resource.resourceType + "/" + resource.id,
          //resource: resource.toJSON(),
          request: new BundleEntryRequest({
            method: "DELETE",
            url: resource.resourceType + "/" + resource.id,
          })
        });
        bundleEntries.push(bundleEntry);
      }
    });
    return bundleEntries;
  }

}
