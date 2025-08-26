-- Function to safely deduct stock quantity
CREATE OR REPLACE FUNCTION deduct_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if product exists and has enough stock
    IF NOT EXISTS (
        SELECT 1 FROM products 
        WHERE id = p_product_id 
        AND stock_quantity >= p_quantity
    ) THEN
        RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
    END IF;

    -- Deduct stock
    UPDATE products 
    SET 
        stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;
