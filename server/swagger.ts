export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AI HR Management System API',
    version: '1.0.0',
    description: 'Enterprise REST API documentation for AI-Powered Employee Management & HR Analytics Platform with JWT Authentication, RBAC, and Gemini AI Integrations.',
    contact: {
      name: 'Enterprise HR Tech Team',
      email: 'dev@enterprise.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Primary API Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token generated from /auth/login or /auth/register',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-1' },
          username: { type: 'string', example: 'admin' },
          email: { type: 'string', example: 'admin@enterprise.com' },
          role: { type: 'string', enum: ['ADMIN', 'HR', 'EMPLOYEE'], example: 'ADMIN' },
          employeeId: { type: 'string', example: 'emp-1' },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'emp-1' },
          fullName: { type: 'string', example: 'David K. Miller' },
          email: { type: 'string', example: 'employee@enterprise.com' },
          phone: { type: 'string', example: '+1 (555) 017-4820' },
          designation: { type: 'string', example: 'Senior Java Backend Engineer' },
          departmentId: { type: 'string', example: 'dept-1' },
          departmentName: { type: 'string', example: 'Engineering' },
          joiningDate: { type: 'string', example: '2023-06-01' },
          skills: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'] },
          salary: { type: 'number', example: 145000 },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'dept-1' },
          departmentName: { type: 'string', example: 'Engineering' },
          description: { type: 'string', example: 'Software development & AI teams' },
          managerName: { type: 'string', example: 'Alex Mercer' },
          budget: { type: 'number', example: 850000 },
          employeeCount: { type: 'integer', example: 12 },
        },
      },
      Attendance: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'att-1' },
          employeeId: { type: 'string', example: 'emp-3' },
          date: { type: 'string', example: '2026-08-03' },
          checkInTime: { type: 'string', example: '09:00 AM' },
          checkOutTime: { type: 'string', example: '05:30 PM' },
          status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'] },
          workHours: { type: 'number', example: 8.5 },
        },
      },
      LeaveRequest: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'leave-1' },
          employeeId: { type: 'string', example: 'emp-3' },
          leaveType: { type: 'string', enum: ['CASUAL', 'SICK', 'MATERNITY', 'ANNUAL', 'UNPAID'] },
          startDate: { type: 'string', example: '2026-08-10' },
          endDate: { type: 'string', example: '2026-08-14' },
          reason: { type: 'string', example: 'Family vacation' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
          hrComment: { type: 'string' },
        },
      },
      PerformanceReview: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'rev-1' },
          employeeId: { type: 'string', example: 'emp-3' },
          technicalScore: { type: 'integer', minimum: 1, maximum: 10, example: 9 },
          communicationScore: { type: 'integer', minimum: 1, maximum: 10, example: 8 },
          teamworkScore: { type: 'integer', minimum: 1, maximum: 10, example: 9 },
          overallRating: { type: 'number', example: 4.5 },
          projectsCompleted: { type: 'integer', example: 7 },
          feedback: { type: 'string', example: 'Delivered high performance Spring Boot microservices.' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login',
        description: 'Authenticate user credentials and generate a signed JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@enterprise.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with JWT token.' },
          401: { description: 'Invalid email or password.' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register New User',
        description: 'Create a new user account with BCrypt password encryption.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password', 'role'],
                properties: {
                  username: { type: 'string', example: 'new_engineer' },
                  email: { type: 'string', example: 'engineer@enterprise.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['ADMIN', 'HR', 'EMPLOYEE'], example: 'EMPLOYEE' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created successfully.' },
        },
      },
    },
    '/employees': {
      get: {
        tags: ['Employee Management'],
        summary: 'List Employees',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Array of employees' } },
      },
      post: {
        tags: ['Employee Management'],
        summary: 'Add Employee (HR / Admin)',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Employee created' } },
      },
    },
    '/departments': {
      get: {
        tags: ['Department Management'],
        summary: 'List Departments',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Array of departments' } },
      },
    },
    '/attendance': {
      get: {
        tags: ['Attendance'],
        summary: 'Get Attendance Logs',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Attendance logs' } },
      },
      post: {
        tags: ['Attendance'],
        summary: 'Employee Check-in / Out',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Attendance updated' } },
      },
    },
    '/leaves': {
      get: {
        tags: ['Leave Management'],
        summary: 'List Leave Requests',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Leave requests' } },
      },
      post: {
        tags: ['Leave Management'],
        summary: 'Apply for Leave',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Leave request submitted' } },
      },
    },
    '/performance': {
      get: {
        tags: ['Performance Reviews'],
        summary: 'List Reviews',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Performance reviews' } },
      },
    },
    '/ai/resume-analyze': {
      post: {
        tags: ['AI Features'],
        summary: 'AI Resume Analyzer',
        security: [{ bearerAuth: [] }],
        description: 'Extract skills, match score, missing skills, and career improvement suggestions using Gemini 3.6 Flash.',
        responses: { 200: { description: 'Structured JSON analysis' } },
      },
    },
    '/ai/performance-feedback': {
      post: {
        tags: ['AI Features'],
        summary: 'AI Employee Performance Feedback Generator',
        security: [{ bearerAuth: [] }],
        description: 'Generates strengths, weaknesses, 30-60-90 day improvement plan, and career growth recommendations.',
        responses: { 200: { description: 'AI feedback plan' } },
      },
    },
  },
};
