export interface EnrollmentInput {
  courseId?: string
  tourId?: string
  paymentReference?: string
  paymentStatus?: string
  amountPaid?: number
  currency?: string
  enrollmentType?: string
}

export function validateEnrollment(data: EnrollmentInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // At least one of courseId or tourId must be provided
  if (!data.courseId && !data.tourId) {
    errors.enrollment = "Either courseId or tourId must be provided"
  }

  if (data.courseId && typeof data.courseId !== "string") {
    errors.courseId = "Invalid courseId format"
  }

  if (data.tourId && typeof data.tourId !== "string") {
    errors.tourId = "Invalid tourId format"
  }

  if (data.paymentStatus && !["pending", "completed", "failed"].includes(data.paymentStatus)) {
    errors.paymentStatus = "Invalid payment status"
  }

  if (data.currency && !["NGN", "USD"].includes(data.currency)) {
    errors.currency = "Currency must be NGN or USD"
  }

  if (data.amountPaid && data.amountPaid < 0) {
    errors.amountPaid = "Amount paid cannot be negative"
  }

  if (data.enrollmentType && !["course", "tour", "combo"].includes(data.enrollmentType)) {
    errors.enrollmentType = "Invalid enrollment type"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
