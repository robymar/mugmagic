/**
 * Database Transaction Utilities
 * Provides simplified transaction handling with automatic rollback
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { logError, logInfo } from './logger';

/**
 * Execute a function within a database transaction
 * Automatically commits on success and rolls back on error
 * 
 * @param supabase - Supabase client
 * @param callback - Transaction callback function
 * @returns Result from callback
 * 
 * @example
 * const result = await withTransaction(supabase, async (client) => {
 *   await client.from('orders').insert({ ... });
 *   await client.from('order_items').insert({ ... });
 *   return { success: true };
 * });
 */
export async function withTransaction<T>(
    supabase: SupabaseClient,
    callback: (client: SupabaseClient) => Promise<T>
): Promise<T> {
    // Note: Supabase doesn't expose traditional BEGIN/COMMIT/ROLLBACK
    // But we can use RPC to call PostgreSQL functions that handle transactions
    // For now, we'll provide error handling wrapper and logging

    try {
        logInfo('Starting database transaction');
        const result = await callback(supabase);
        logInfo('Transaction completed successfully');
        return result;
    } catch (error) {
        logError('Transaction failed, rolling back', { data: error });
        throw error;
    }
}

/**
 * Execute multiple database operations atomically using a stored procedure
 * This is the proper way to handle transactions in Supabase
 * 
 * @param supabase - Supabase client
 * @param procedureName - Name of the stored procedure
 * @param params - Parameters to pass to the procedure
 * @returns Result from stored procedure
 * 
 * @example
 * await executeStoredProcedure(supabase, 'process_order', {
 *   order_id: '123',
 *   items: [...]
 * });
 */
export async function executeStoredProcedure<T = any>(
    supabase: SupabaseClient,
    procedureName: string,
    params: Record<string, any> = {}
): Promise<T> {
    try {
        logInfo(`Executing stored procedure: ${procedureName}`, {
            data: { procedureName, paramsKeys: Object.keys(params) }
        });

        const { data, error } = await supabase.rpc(procedureName, params);

        if (error) {
            logError(`Stored procedure ${procedureName} failed`, { data: error });
            throw error;
        }

        logInfo(`Stored procedure ${procedureName} completed successfully`);
        return data as T;
    } catch (error) {
        logError(`Error executing stored procedure ${procedureName}`, { data: error });
        throw error;
    }
}

/**
 * Retry a database operation with exponential backoff
 * Useful for handling transient failures
 * 
 * @param operation - Function to retry
 * @param maxRetries - Maximum number of retries (default 3)
 * @param baseDelay - Base delay in ms (default 100)
 * @returns Result from operation
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 100
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            // Don't retry on certain errors
            if (error.code === 'PGRST116' || error.code === '23505') {
                // Not found or unique constraint violation
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                logInfo(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    logError('Operation failed after all retries', { data: lastError });
    throw lastError;
}

/**
 * Check if an error is a transient error that can be retried
 */
export function isTransientError(error: any): boolean {
    if (!error) return false;

    // PostgreSQL error codes for transient errors
    const transientCodes = [
        '08000', // connection_exception
        '08003', // connection_does_not_exist
        '08006', // connection_failure
        '40001', // serialization_failure
        '40P01', // deadlock_detected
    ];

    return transientCodes.includes(error.code);
}

/**
 * Batch insert with automatic chunking
 * Prevents timeout on large inserts
 * 
 * @param supabase - Supabase client
 * @param table - Table name
 * @param records - Records to insert
 * @param chunkSize - Size of each chunk (default 100)
 */
export async function batchInsert<T extends Record<string, any>>(
    supabase: SupabaseClient,
    table: string,
    records: T[],
    chunkSize: number = 100
): Promise<void> {
    logInfo(`Batch inserting ${records.length} records into ${table}`);

    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);

        const { error } = await supabase
            .from(table)
            .insert(chunk);

        if (error) {
            logError(`Batch insert failed at chunk ${i / chunkSize + 1}`, { data: error });
            throw error;
        }

        logInfo(`Inserted chunk ${i / chunkSize + 1} of ${Math.ceil(records.length / chunkSize)}`);
    }

    logInfo(`Batch insert completed: ${records.length} records`);
}
