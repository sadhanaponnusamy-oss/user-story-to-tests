import { z } from 'zod'

export const GenerateRequestSchema = z.object({
  storyTitle: z.string().min(1, 'Story title is required'),
  acceptanceCriteria: z.string().min(1, 'Acceptance criteria is required'),
  description: z.string().optional(),
  additionalInfo: z.string().optional()
})

export const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
  testData: z.string().optional(),
  expectedResult: z.string(),
  category: z.string()
})

export const GenerateResponseSchema = z.object({
  cases: z.array(TestCaseSchema),
  model: z.string().optional(),
  promptTokens: z.number(),
  completionTokens: z.number()
})

// --- Jira integration schemas ---------------------------------------------

export const JiraCredentialsSchema = z.object({
  baseUrl: z.string().url('Base URL must be a valid URL'),
  email: z.string().email('Email must be valid'),
  apiToken: z.string().min(1, 'API token is required')
})

export const JiraConnectRequestSchema = JiraCredentialsSchema

export const JiraStorySchema = z.object({
  key: z.string(),
  summary: z.string()
})

export const JiraStoriesRequestSchema = JiraCredentialsSchema

export const JiraStoriesResponseSchema = z.array(JiraStorySchema)

export const JiraStoryDetailRequestSchema = JiraCredentialsSchema.extend({
  issueKey: z.string().min(1, 'Issue key is required')
})

export const JiraStoryDetailResponseSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string().optional(),
  acceptanceCriteria: z.string().optional()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>

export type JiraCredentials = z.infer<typeof JiraCredentialsSchema>
export type JiraStory = z.infer<typeof JiraStorySchema>
export type JiraStoryDetail = z.infer<typeof JiraStoryDetailResponseSchema>