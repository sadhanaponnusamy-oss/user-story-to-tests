import express from 'express'
import {
  JiraConnectRequestSchema,
  JiraStoriesRequestSchema,
  JiraStoryDetailRequestSchema
} from '../schemas'
import * as jiraService from '../services/jira.service'

export const jiraRouter = express.Router()

// validate connection credentials
jiraRouter.post('/connect', async (req: express.Request, res: express.Response) => {
  try {
    const parseResult = JiraConnectRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: `Validation error: ${parseResult.error.message}` })
      return
    }
    const creds = parseResult.data
    try {
      await jiraService.validateCredentials(creds)
      res.json({ ok: true })
    } catch (err: any) {
      console.error('Jira connect error:', err.message || err)
      res.status(502).json({ error: err.message || 'Failed to validate Jira credentials' })
    }
  } catch (err) {
    console.error('Unexpected error in /jira/connect', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// fetch list of stories
jiraRouter.post('/stories', async (req: express.Request, res: express.Response) => {
  try {
    const parseResult = JiraStoriesRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: `Validation error: ${parseResult.error.message}` })
      return
    }
    const creds = parseResult.data
    try {
      const stories = await jiraService.fetchStories(creds)
      res.json(stories)
    } catch (err: any) {
      console.error('Jira fetch stories error:', err.message || err)
      res.status(502).json({ error: err.message || 'Failed to fetch stories from Jira' })
    }
  } catch (err) {
    console.error('Unexpected error in /jira/stories', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// fetch single story details
jiraRouter.post('/story', async (req: express.Request, res: express.Response) => {
  try {
    const parseResult = JiraStoryDetailRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: `Validation error: ${parseResult.error.message}` })
      return
    }
    const { issueKey, ...creds } = parseResult.data
    try {
      const detail = await jiraService.fetchStoryDetail(creds, issueKey)
      res.json(detail)
    } catch (err: any) {
      console.error('Jira fetch story detail error:', err.message || err)
      res.status(502).json({ error: err.message || 'Failed to fetch story detail from Jira' })
    }
  } catch (err) {
    console.error('Unexpected error in /jira/story', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})
