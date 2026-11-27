export interface CreateAppointmentRequest {
  branchId: string;
  appointmentDate: string;
  serviceName: string;
  customerId: string;
  startTime: string;
  province: string;
}
