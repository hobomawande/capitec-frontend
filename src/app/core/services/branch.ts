import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../../Models/branch/Branch';
import { CreateBranchRequest } from '../../Models/branch/CreateBranchRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private apiUrl = `${environment.apiBase}/branches`;

  constructor(private http: HttpClient) {}

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  getActiveBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/active`);
  }

  getBranch(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  createBranch(request: CreateBranchRequest): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, request);
  }

  updateBranch(id: string, request: Partial<CreateBranchRequest>): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${id}`, request);
  }

  activateBranch(id: string): Observable<Branch> {
    return this.http.patch<Branch>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateBranch(id: string): Observable<Branch> {
    return this.http.patch<Branch>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
