import type { DomainEvent, DomainEventType } from './events';

/** Interface for publishing domain events */
export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
}

/** Event handler function type */
export type EventHandler = (event: DomainEvent) => Promise<void>;

/** Event handler registry for the queue consumer */
export interface IEventHandlerRegistry {
  register(eventType: DomainEventType, handler: EventHandler): void;
  getHandlers(eventType: DomainEventType): EventHandler[];
}

/** In-memory event handler registry */
export class EventHandlerRegistry implements IEventHandlerRegistry {
  private handlers = new Map<DomainEventType, EventHandler[]>();

  register(eventType: DomainEventType, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  getHandlers(eventType: DomainEventType): EventHandler[] {
    return this.handlers.get(eventType) || [];
  }
}
