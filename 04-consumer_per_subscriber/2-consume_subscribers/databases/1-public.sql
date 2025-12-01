CREATE TABLE domain_events_to_consume (
	event_id uuid NOT NULL,
	subscriber_name TEXT NOT NULL,
	name TEXT NOT NULL,
	attributes jsonb NOT NULL,
	occurred_at timestamptz NOT NULL,
	inserted_at timestamptz NOT NULL DEFAULT NOW(),
	PRIMARY KEY (event_id, subscriber_name)
);

CREATE INDEX idx__domain_events_to_consume__inserted_at ON public.domain_events_to_consume (inserted_at);
CREATE INDEX idx__domain_events_to_consume__subscriber_name ON public.domain_events_to_consume (subscriber_name);
