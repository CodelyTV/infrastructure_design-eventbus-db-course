CREATE TABLE IF NOT EXISTS domain_events_to_consume (
	id uuid PRIMARY KEY,
	name TEXT,
	attributes jsonb NOT NULL,
	occurred_at timestamptz NOT NULL,
	inserted_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx__domain_events_to_consume__inserted_at ON public.domain_events_to_consume (inserted_at);
