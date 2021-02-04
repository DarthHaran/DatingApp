import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (error) {
          switch (error.status) {
            case 400:
              error.statusText = 'OK' ? 'Bad Request' : error.statusText, error.status;
              if (error.error.errors) {
                const modalStateErrors = [];
                for (const key in error.error.errors) {
                  if (error.error.errors[key]) {
                    modalStateErrors.push(error.error.errors[key])
                  }
                }
                throw modalStateErrors.flat();
              } else {
                this.toastr.error(error.statusText);
              }
              break;

            case 401:
              error.statusText = 'OK' ? 'Unauthorised' : error.statusText, error.status;
              this.toastr.error(error.statusText);
              break;

            case 404:
              error.statusText = 'OK' ? 'Not Found' : error.statusText, error.status;
              this.router.navigateByUrl('/not-found');
              break;

            case 500:
              error.statusText = 'OK' ? 'Internal Server Error' : error.statusText, error.status;
              const navigationExtras: NavigationExtras = {state: {error: error.error}}
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;
          
            default:
              this.toastr.error('Oops. Something went wrong. :(');
              console.log(error);
              break;
          }
        }
        return throwError(error);
      })
    )
  }
}
