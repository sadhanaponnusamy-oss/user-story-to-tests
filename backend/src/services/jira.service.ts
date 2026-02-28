import fetch from 'node-fetch'
import { JiraCredentials } from '../schemas'

function buildAuthHeader(creds: JiraCredentials): string {
  const token = Buffer.from(`${creds.email}:${creds.apiToken}`).toString('base64')
  return `Basic ${token}`
}

interface JiraIssue { key: string; fields: any }

export async function validateCredentials(creds: JiraCredentials): Promise<void> {
  const url = `${creds.baseUrl.replace(/\/+$/,'')}/rest/api/3/myself`
  const response = await fetch(url, {
    headers: {
      Authorization: buildAuthHeader(creds),
      'Accept': 'application/json'
    }
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid Jira credentials')
    }
    const text = await response.text().catch(() => '')
    throw new Error(`Jira returned ${response.status}: ${text}`)
  }
}

export async function fetchStories(creds: JiraCredentials, jql: string = 'issuetype=Story'): Promise<Array<{ key: string; summary: string }>> {
  // use POST /search/jql since some Jira instances require body-based search
  const url = `${creds.baseUrl.replace(/\/+$/,'')}/rest/api/3/search/jql`
  const body = {
    jql,
    fields: ['key', 'summary'],
    maxResults: 1000
  }
  console.log('fetchStories POST', url, body)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: buildAuthHeader(creds),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    console.error('Jira response body:', text)
    throw new Error(`Failed to fetch stories (status ${response.status})`)
  }
  const data = await response.json()
  if (!data.issues) {
    return []
  }
  return data.issues.map((issue: JiraIssue) => ({
    key: issue.key,
    summary: issue.fields?.summary || ''
  }))
}

export async function fetchStoryDetail(
  creds: JiraCredentials,
  issueKey: string
): Promise<{ key: string; title: string; description?: string; acceptanceCriteria?: string }> {
  const url = `${creds.baseUrl.replace(/\/+$/,'')}/rest/api/3/issue/${encodeURIComponent(issueKey)}`
  const response = await fetch(url, {
    headers: {
      Authorization: buildAuthHeader(creds),
      'Accept': 'application/json'
    }
  })
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Story not found')
    }
    throw new Error(`Failed to fetch story detail (status ${response.status})`)
  }
  const data: JiraIssue = await response.json()
  const fields = data.fields || {}
  const description = typeof fields.description === 'string' ? fields.description : ''
  let acceptanceCriteria: string | undefined
  for (const key of Object.keys(fields)) {
    if (/acceptance/i.test(key) && typeof fields[key] === 'string') {
      acceptanceCriteria = fields[key]
      break
    }
  }
  return {
    key: data.key,
    title: fields.summary || '',
    description,
    acceptanceCriteria
  }
}
