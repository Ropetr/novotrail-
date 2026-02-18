import type { IEventBus } from './event-bus';
import type { DomainEvent } from './events';

/**
 * Event bus implementation using Cloudflare Queues.
 * Publishes domain events to the TASK_QUEUE for async processing.
 */
export class QueueEventBus implements IEventBus {
  constructor(private queue: Queue) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.queue.send(event);
    console.log(`[EventBus] Published event: ${event.type}`, {
      tenantId: event.tenantId,
      timestamp: event.metadata.timestamp,
    });
  }
}
