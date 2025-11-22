export interface CourseInput {
  title?: string
  description?: string
  category?: string
  priceNgn?: number
  priceUsd?: number
  durationWeeks?: number
  googleClassroomLink?: string
  contentType?: string
}

export const courseValidationRules = {
  title: { required: true, minLength: 3, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 1000 },
  category: { required: true, enum: ["writing", "graphics", "video", "speaking", "leadership", "storytelling"] },
  priceNgn: { required: true, min: 1000, max: 1000000 },
  priceUsd: { required: true, min: 1, max: 1000 },
  durationWeeks: { required: true, min: 1, max: 52 },
  googleClassroomLink: { required: false, pattern: /^https:\/\/classroom\.google\.com/ },
  contentType: { required: true, enum: ["internal", "external"] },
}

export function validateCourse(data: CourseInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.title || data.title.length < 3 || data.title.length > 100) {
    errors.title = "Title must be between 3 and 100 characters"
  }

  if (!data.description || data.description.length < 10 || data.description.length > 1000) {
    errors.description = "Description must be between 10 and 1000 characters"
  }

  if (!data.category || !courseValidationRules.category.enum.includes(data.category)) {
    errors.category = "Invalid category"
  }

  if (!data.priceNgn || data.priceNgn < 1000 || data.priceNgn > 1000000) {
    errors.priceNgn = "Price NGN must be between 1000 and 1000000"
  }

  if (!data.priceUsd || data.priceUsd < 1 || data.priceUsd > 1000) {
    errors.priceUsd = "Price USD must be between 1 and 1000"
  }

  if (!data.durationWeeks || data.durationWeeks < 1 || data.durationWeeks > 52) {
    errors.durationWeeks = "Duration must be between 1 and 52 weeks"
  }

  if (!data.contentType || !courseValidationRules.contentType.enum.includes(data.contentType)) {
    errors.contentType = "Invalid content type"
  }

  if (data.contentType === "external" && data.googleClassroomLink) {
    if (!courseValidationRules.googleClassroomLink.pattern.test(data.googleClassroomLink)) {
      errors.googleClassroomLink = "Invalid Google Classroom link"
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
