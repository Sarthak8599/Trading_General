import { supabase, Trade } from './supabase'
import { User } from '@supabase/supabase-js'

export class TradeService {
  // Get all trades for current user
  static async getAllTrades(): Promise<Trade[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trades:', error)
      throw error
    }

    return data || []
  }

  // Create a new trade
  static async createTrade(trade: Omit<Trade, 'id' | 'created_at' | 'updated_at'>): Promise<Trade> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trades')
      .insert([{ ...trade, user_id: user.id }])
      .select()
      .single()

    if (error) {
      console.error('Error creating trade:', error)
      throw error
    }

    return data
  }

  // Update a trade
  static async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating trade:', error)
      throw error
    }

    return data
  }

  // Delete a trade
  static async deleteTrade(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting trade:', error)
      throw error
    }
  }

  // Get trades by date range
  static async getTradesByDateRange(startDate: string, endDate: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching trades by date range:', error)
      throw error
    }

    return data || []
  }

  // Get trades by strategy
  static async getTradesByStrategy(strategyName: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('strategyName', strategyName)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trades by strategy:', error)
      throw error
    }

    return data || []
  }

  // Get trades by symbol
  static async getTradesBySymbol(symbol: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching trades by symbol:', error)
      throw error
    }

    return data || []
  }
}