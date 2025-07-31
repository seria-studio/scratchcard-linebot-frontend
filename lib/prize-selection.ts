import type { Prize, ScratchCard } from './types';

interface PrizeSelectionError {
  type: 'no_prizes' | 'out_of_stock' | 'api_error';
  message: string;
}

interface PrizeSelectionResult {
  success: boolean;
  prize?: Prize;
  error?: PrizeSelectionError;
}

/**
 * Selects a prize for the user based on availability and probability weights
 * @param scratchCard The scratch card containing all prizes with their results
 * @returns PrizeSelectionResult
 */
export function selectPrizeForUser(
  scratchCard: ScratchCard
): PrizeSelectionResult {
  try {
    // Step 1: Check if scratch card has prizes
    if (!scratchCard.prizes || scratchCard.prizes.length === 0) {
      return {
        success: false,
        error: {
          type: 'no_prizes',
          message: '此刮刮卡沒有設置任何獎品'
        }
      };
    }

    console.log('Available prizes:', scratchCard.prizes);

    // Step 2-3: Calculate remaining stock for each prize using the results field
    const availablePrizes = scratchCard.prizes.filter(prize => {
      const usedCount = prize.results?.length || 0;
      const remainingStock = prize.quantity - usedCount;
      return remainingStock > 0;
    });

    // Step 4: Check if any prizes are available
    if (availablePrizes.length === 0) {
      return {
        success: false,
        error: {
          type: 'out_of_stock',
          message: '很抱歉，所有獎品都已領完！'
        }
      };
    }

    // Step 5: Calculate total weight based on remaining prizes and their probabilities
    const totalWeight = availablePrizes.reduce((sum, prize) => sum + prize.probability, 0);

    if (totalWeight <= 0) {
      return {
        success: false,
        error: {
          type: 'no_prizes',
          message: '獎品機率設置有誤'
        }
      };
    }

    // Step 6: Generate random prize using weighted selection
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const prize of availablePrizes) {
      cumulativeWeight += prize.probability;
      if (randomValue <= cumulativeWeight) {
        return {
          success: true,
          prize: prize
        };
      }
    }

    // Fallback to last available prize (should not happen with proper probabilities)
    return {
      success: true,
      prize: availablePrizes[availablePrizes.length - 1]
    };

  } catch (error) {
    return {
      success: false,
      error: {
        type: 'api_error',
        message: error instanceof Error ? error.message : '選擇獎品時發生錯誤'
      }
    };
  }
}

/**
 * Debug function to show remaining stock for all prizes
 * @param scratchCard The scratch card containing all prizes with their results
 * @returns Array with stock information
 */
export function getPrizeStock(scratchCard: ScratchCard) {
  try {
    return scratchCard.prizes.map(prize => {
      const used = prize.results?.length || 0;
      const remaining = Math.max(0, prize.quantity - used);
      
      return {
        prize: prize,
        remaining: remaining,
        used: used
      };
    });
  } catch (error) {
    console.error('Error getting prize stock:', error);
    return [];
  }
}