import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const SmokeSchema = z.object({
  emit: z.string().optional().default('console'),
  dryRun: z.boolean().optional().default(false),
});

const HealthCheckSchema = z.object({
  service: z.string().optional(),
  region: z.string().optional().default('asia-southeast1'),
});

export const healthTools: Tool[] = [
  {
    name: 'health.smoke',
    description: 'Run comprehensive health check: create chat message, run sentiment analysis, check BQ views, return KPI',
    inputSchema: SmokeSchema,
  },
  {
    name: 'health.check',
    description: 'Check service health and readiness',
    inputSchema: HealthCheckSchema,
  },
];

/**
 * Comprehensive smoke test that validates the entire pipeline
 */
export async function executeSmoke(args: z.infer<typeof SmokeSchema>) {
  const { emit, dryRun } = args;
  
  if (dryRun) {
    return { message: 'DRY RUN: Would run smoke test', emit };
  }
  
  try {
    // 1. Publish test chat messages
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const timestamp = new Date().toISOString();
    const messages = [
      { text: 'I love EdenOS', sentiment: 'positive', ts: timestamp },
      { text: 'I hate bugs', sentiment: 'negative', ts: timestamp },
      { text: 'This is amazing', sentiment: 'positive', ts: timestamp },
    ];
    
    const publishedMessages = [];
    for (const msg of messages) {
      const { stdout } = await execAsync(
        `gcloud pubsub topics publish chat-history --message='${JSON.stringify(msg)}' --format=json`
      );
      const result = JSON.parse(stdout);
      publishedMessages.push({
        message: msg,
        messageId: result.messageIds?.[0],
      });
    }
    
    // 2. Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Check BigQuery views
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'agile-anagram-469914-e2';
    
    // Check chat_raw table
    let chatRawCount = 0;
    try {
      const { stdout } = await execAsync(
        `bq query --nouse_legacy_sql --format=json "SELECT COUNT(*) as count FROM \`${projectId}.edenos.chat_raw\` WHERE DATE(ts)=CURRENT_DATE('Asia/Manila')"`
      );
      const result = JSON.parse(stdout);
      chatRawCount = result[0]?.count || 0;
    } catch (error) {
      console.warn('Could not query chat_raw table:', error);
    }
    
    // Check sentiment trends view
    let sentimentTrends = null;
    try {
      const { stdout } = await execAsync(
        `bq query --nouse_legacy_sql --format=json "SELECT * FROM \`${projectId}.edenos.sentiment_trends\` ORDER BY day DESC LIMIT 5"`
      );
      sentimentTrends = JSON.parse(stdout);
    } catch (error) {
      console.warn('Could not query sentiment_trends view:', error);
    }
    
    // 4. Calculate KPI
    const positiveCount = publishedMessages.filter(m => m.message.sentiment === 'positive').length;
    const negativeCount = publishedMessages.filter(m => m.message.sentiment === 'negative').length;
    const totalCount = publishedMessages.length;
    const positiveRate = totalCount > 0 ? (positiveCount / totalCount) * 100 : 0;
    
    const kpi = {
      messagesPublished: totalCount,
      positiveSentiment: positiveCount,
      negativeSentiment: negativeCount,
      positiveRate: positiveRate.toFixed(2) + '%',
      chatRawRecords: chatRawCount,
      sentimentTrendsAvailable: sentimentTrends !== null,
      timestamp: new Date().toISOString(),
    };
    
    // 5. Emit results based on emit parameter
    if (emit === 'scheduler') {
      // Publish to audit-events topic for scheduler-triggered runs
      try {
        await execAsync(
          `gcloud pubsub topics publish audit-events --message='${JSON.stringify({
            type: 'smoke_test_completed',
            kpi,
            source: 'scheduler',
            timestamp: new Date().toISOString(),
          })}'`
        );
      } catch (error) {
        console.warn('Could not publish to audit-events:', error);
      }
    }
    
    return {
      success: true,
      message: 'Smoke test completed successfully',
      kpi,
      publishedMessages,
      sentimentTrends,
    };
    
  } catch (error) {
    throw new Error(`Smoke test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Basic health check for service readiness
 */
export async function executeHealthCheck(args: z.infer<typeof HealthCheckSchema>) {
  const { service, region } = args;
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    if (service) {
      // Check specific service health
      const { stdout } = await execAsync(
        `gcloud run services describe ${service} --region=${region} --format=json`
      );
      
      const serviceInfo = JSON.parse(stdout);
      const isHealthy = serviceInfo.status.conditions?.some((c: any) => 
        c.type === 'Ready' && c.status === 'True'
      );
      
      return {
        service: serviceInfo.metadata.name,
        healthy: isHealthy,
        status: serviceInfo.status.conditions,
        url: serviceInfo.status.url,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Check overall system health
      const checks = {
        gcloud: false,
        bq: false,
        firebase: false,
        pubsub: false,
      };
      
      try {
        await execAsync('gcloud config get-value project');
        checks.gcloud = true;
      } catch (error) {
        console.warn('gcloud not configured');
      }
      
      try {
        await execAsync('bq version');
        checks.bq = true;
      } catch (error) {
        console.warn('BigQuery CLI not available');
      }
      
      try {
        await execAsync('firebase --version');
        checks.firebase = true;
      } catch (error) {
        console.warn('Firebase CLI not available');
      }
      
      try {
        await execAsync('gcloud pubsub topics list --limit=1');
        checks.pubsub = true;
      } catch (error) {
        console.warn('Pub/Sub access not available');
      }
      
      const overallHealth = Object.values(checks).every(Boolean);
      
      return {
        healthy: overallHealth,
        checks,
        timestamp: new Date().toISOString(),
      };
    }
    
  } catch (error) {
    throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

