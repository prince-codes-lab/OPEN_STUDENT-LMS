-- This script creates indexes on frequently queried fields for production optimization
-- Run this script after deploying the application

-- User collection indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ emailVerified: 1 })

-- Enrollment collection indexes
db.enrollments.createIndex({ userId: 1 })
db.enrollments.createIndex({ courseId: 1 })
db.enrollments.createIndex({ tourId: 1 })
db.enrollments.createIndex({ paymentReference: 1 }, { unique: true })
db.enrollments.createIndex({ completed: 1, userId: 1 })
db.enrollments.createIndex({ userId: 1, createdAt: -1 })
db.enrollments.createIndex({ paymentStatus: 1, userId: 1 })

-- Certificate collection indexes
db.certificates.createIndex({ userId: 1 })
db.certificates.createIndex({ enrollmentId: 1 })
db.certificates.createIndex({ certificateNumber: 1 }, { unique: true })
db.certificates.createIndex({ issuedAt: -1 })

-- Course collection indexes (if exists)
db.courses.createIndex({ title: "text" })
db.courses.createIndex({ createdAt: -1 })

-- Tour collection indexes (if exists)
db.tours.createIndex({ title: "text" })
db.tours.createIndex({ createdAt: -1 })
