import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly feedbackUrl = 'http://localhost:5019/api/Feedback';

  constructor(private http: HttpClient) { }

 submitFeedback(feedbackData: any): Observable<any> {
  return this.http.post(this.feedbackUrl, feedbackData, { responseType: 'text' });
}
}