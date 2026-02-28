import { GenerateRequest, GenerateResponse, JiraCredentials, JiraStory, JiraStoryDetail } from './types'

// ensure the default matches backend .env PORT
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091/api'

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

// Jira related API functions
export async function jiraConnect(creds: JiraCredentials): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/jira/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }
}

export async function fetchJiraStories(creds: JiraCredentials): Promise<JiraStory[]> {
  const response = await fetch(`${API_BASE_URL}/jira/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }
  return response.json()
}

export async function fetchJiraStoryDetail(creds: JiraCredentials, issueKey: string): Promise<JiraStoryDetail> {
  const response = await fetch(`${API_BASE_URL}/jira/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...creds, issueKey }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `HTTP ${response.status}`)
  }
  return response.json()
}
