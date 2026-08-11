export type PackId = 'starter' | 'standard' | 'bulk';

export interface CreditPack {
    id: PackId;
    name: string;
    description: string;
    priceInr: number; // in whole rupees
    credits: number;
}

export const CREDIT_PACKS: Record<PackId, CreditPack> = {
    starter: {
        id: 'starter',
        name: 'Starter',
        description: 'Just need a few more for this video',
        priceInr: 399,
        credits: 500,
    },
    standard: {
        id: 'standard',
        name: 'Standard',
        description: 'I\'m doing a project this weekend',
        priceInr: 799,
        credits: 1200,
    },
    bulk: {
        id: 'bulk',
        name: 'Bulk',
        description: 'I create daily, need a buffer',
        priceInr: 1499,
        credits: 2500,
    },
};

/**
 * Returns the corresponding pack for a given ID.
 * Throws an error if the pack is invalid, acting as a guard against forged requests.
 */
export function getPack(packId: string): CreditPack {
    const pack = CREDIT_PACKS[packId as PackId];
    if (!pack) {
        throw new Error(`Invalid pack ID: ${packId}`);
    }
    return pack;
}
