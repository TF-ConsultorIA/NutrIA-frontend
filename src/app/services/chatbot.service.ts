import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChatRequest, ChatResponse } from '../models/chatbot';
import { map } from 'rxjs';

@Service()
export class ChatbotService {
  private baseUrl = environment.aiUrl
  private http = inject(HttpClient);

  recommendation(request: ChatRequest) {
    let params = new HttpParams().set('message', request.message);

    return this.http.post<ChatResponse>(`${this.baseUrl}/recommendation`, {}, { params })
    .pipe(map((response: ChatResponse) => {

      return {...response, time: new Date()};
    }));
  }

  support(request: ChatRequest) {
    let params = new HttpParams().set('message', request.message);

    return this.http.post<ChatResponse>(`${this.baseUrl}/support/ask`, {}, { params })
    .pipe(map((response: ChatResponse) => {

      return {...response, time: new Date()};
    }));
  }
}
