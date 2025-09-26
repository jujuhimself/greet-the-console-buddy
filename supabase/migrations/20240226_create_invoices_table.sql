CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES profiles(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Add RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own invoices
CREATE POLICY "Users can view their own invoices"
    ON invoices
    FOR SELECT
    USING (auth.uid() = pharmacy_id);

-- Policy to allow users to insert their own invoices
CREATE POLICY "Users can insert their own invoices"
    ON invoices
    FOR INSERT
    WITH CHECK (auth.uid() = pharmacy_id);

-- Policy to allow users to update their own invoices
CREATE POLICY "Users can update their own invoices"
    ON invoices
    FOR UPDATE
    USING (auth.uid() = pharmacy_id);

-- Add indexes
CREATE INDEX idx_invoices_pharmacy_id ON invoices(pharmacy_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
