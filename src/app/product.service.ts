import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private productsUrl = "assets/products.json"; // Path to your products.json

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http
      .get<any>(this.productsUrl)
      .pipe(catchError(this.handleError<any>("getProducts", [])));
  }

  getProduct(id: string): Observable<any> {
    return this.getProducts().pipe(
      map((data) => data.data.find((product: any) => product.id === id))
    );
  }

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
