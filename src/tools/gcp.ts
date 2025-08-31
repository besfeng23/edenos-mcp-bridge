import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// GCP Cloud Run tools
const RunStatusSchema = z.object({
  service: z.string(),
  region: z.string().optional().default('asia-southeast1'),
});

const RunRestartSchema = z.object({
  service: z.string(),
  region: z.string().optional().default('asia-southeast1'),
  dryRun: z.boolean().optional().default(false),
});

const RunRollbackSchema = z.object({
  service: z.string(),
  region: z.string().optional().default('asia-southeast1'),
  revision: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

// GCP Pub/Sub tools
const PubSubPublishSchema = z.object({
  topic: z.string(),
  payload: z.record(z.any()),
  attributes: z.record(z.string()).optional(),
  dryRun: z.boolean().optional().default(false),
});

// GCP Scheduler tools
const SchedulerTriggerSchema = z.object({
  job: z.string(),
  region: z.string().optional().default('asia-southeast1'),
  dryRun: z.boolean().optional().default(false),
});

// GCP Cloud Tasks tools
const TasksCreateSchema = z.object({
  queue: z.string(),
  payload: z.record(z.any()),
  delay: z.number().optional().default(0),
  dryRun: z.boolean().optional().default(false),
});

export const gcpTools: Tool[] = [
  {
    name: 'gcp.run.status',
    description: 'Get Cloud Run service status and revision info',
    inputSchema: RunStatusSchema,
  },
  {
    name: 'gcp.run.restart',
    description: 'Restart Cloud Run service (creates new revision)',
    inputSchema: RunRestartSchema,
  },
  {
    name: 'gcp.run.rollback',
    description: 'Rollback Cloud Run service to previous revision',
    inputSchema: RunRollbackSchema,
  },
  {
    name: 'gcp.pubsub.publish',
    description: 'Publish message to Pub/Sub topic',
    inputSchema: PubSubPublishSchema,
  },
  {
    name: 'gcp.scheduler.trigger',
    description: 'Trigger Cloud Scheduler job immediately',
    inputSchema: SchedulerTriggerSchema,
  },
  {
    name: 'gcp.tasks.create',
    description: 'Create Cloud Task in queue',
    inputSchema: TasksCreateSchema,
  },
];

// Implementation functions (to be called from server.ts)
export async function executeRunStatus(args: z.infer<typeof RunStatusSchema>) {
  const { service, region } = args;
  
  // Use gcloud CLI for now (can be replaced with @google-cloud/run SDK)
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync(
      `gcloud run services describe ${service} --region=${region} --format=json`
    );
    
    const serviceInfo = JSON.parse(stdout);
    return {
      name: serviceInfo.metadata.name,
      region: serviceInfo.metadata.namespace,
      status: serviceInfo.status.conditions?.[0]?.status || 'Unknown',
      latestRevision: serviceInfo.status.latestReadyRevisionName,
      url: serviceInfo.status.url,
      traffic: serviceInfo.status.traffic,
    };
  } catch (error) {
    throw new Error(`Failed to get service status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeRunRestart(args: z.infer<typeof RunRestartSchema>) {
  const { service, region, dryRun } = args;
  
  if (dryRun) {
    return { message: `DRY RUN: Would restart ${service} in ${region}` };
  }
  
  // Use gcloud CLI to update service (triggers new revision)
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync(
      `gcloud run services update ${service} --region=${region} --set-env-vars RESTART_TRIGGER=${Date.now()} --format=json`
    );
    
    const result = JSON.parse(stdout);
    return {
      message: `Service ${service} restarted successfully`,
      newRevision: result.status.latestReadyRevisionName,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to restart service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeRunRollback(args: z.infer<typeof RunRollbackSchema>) {
  const { service, region, revision, dryRun } = args;
  
  if (dryRun) {
    return { message: `DRY RUN: Would rollback ${service} to ${revision || 'previous revision'}` };
  }
  
  // Use gcloud CLI to rollback traffic
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const targetRevision = revision || 'REVISION-1';
    const { stdout } = await execAsync(
      `gcloud run services update-traffic ${service} --region=${region} --to-revisions=${targetRevision}=100 --format=json`
    );
    
    const result = JSON.parse(stdout);
    return {
      message: `Service ${service} rolled back successfully`,
      activeRevision: targetRevision,
      traffic: result.status.traffic,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to rollback service: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executePubSubPublish(args: z.infer<typeof PubSubPublishSchema>) {
  const { topic, payload, attributes, dryRun } = args;
  
  if (dryRun) {
    return { message: `DRY RUN: Would publish to ${topic}`, payload, attributes };
  }
  
  // Use gcloud CLI for now (can be replaced with @google-cloud/pubsub SDK)
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const message = JSON.stringify(payload);
    const attrFlags = attributes ? Object.entries(attributes).map(([k, v]) => `--attribute=${k}=${v}`).join(' ') : '';
    
    const { stdout } = await execAsync(
      `gcloud pubsub topics publish ${topic} --message='${message}' ${attrFlags} --format=json`
    );
    
    const result = JSON.parse(stdout);
    return {
      message: `Message published to ${topic} successfully`,
      messageId: result.messageIds?.[0],
      topic,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to publish message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeSchedulerTrigger(args: z.infer<typeof SchedulerTriggerSchema>) {
  const { job, region, dryRun } = args;
  
  if (dryRun) {
    return { message: `DRY RUN: Would trigger scheduler job ${job} in ${region}` };
  }
  
  // Use gcloud CLI to run scheduler job
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync(
      `gcloud scheduler jobs run ${job} --location=${region} --format=json`
    );
    
    const result = JSON.parse(stdout);
    return {
      message: `Scheduler job ${job} triggered successfully`,
      jobName: result.name,
      state: result.state,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to trigger scheduler job: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function executeTasksCreate(args: z.infer<typeof TasksCreateSchema>) {
  const { queue, payload, delay, dryRun } = args;
  
  if (dryRun) {
    return { message: `DRY RUN: Would create task in ${queue}`, payload, delay };
  }
  
  // Use gcloud CLI to create task
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    const message = JSON.stringify(payload);
    const { stdout } = await execAsync(
      `gcloud tasks create-http-task --queue=${queue} --body-content='${message}' --schedule-time=${Date.now() + (delay * 1000)} --format=json`
    );
    
    const result = JSON.parse(stdout);
    return {
      message: `Task created in ${queue} successfully`,
      taskName: result.name,
      scheduleTime: result.scheduleTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

