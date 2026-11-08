'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SITE_CONFIG } from '../config';

export interface PublicCartItem {
  productId: string;
  name: string;
  image: string;
  pricePence: number;
  quantity: number;
}

export interface TradeCartItem {
  productId: string;
  name: string;
  image: string;
  sku: string;
  packPricePence: number;
  retailPricePence: number;
  unitsPerPack: number;
  packs: number;
}

export interface TradeStandCartItem {
  standId: string;
  name: string;
  image: string;
  fixedPricePence: number;
  quantity: number;
  linesCount: number;
  packsCount: number;
  unitsCount: number;
}

interface CartState {
  // Public Cart
  publicItems: PublicCartItem[];
  addPublicItem: (item: Omit<PublicCartItem, 'quantity'>, quantity?: number) => void;
  updatePublicQuantity: (productId: string, quantity: number) => void;
  removePublicItem: (productId: string) => void;
  clearPublicCart: () => void;

  // Trade Cart
  tradeItems: TradeCartItem[];
  tradeStands: TradeStandCartItem[];
  setTradePacks: (item: Omit<TradeCartItem, 'packs'>, packs: number) => void;
  updateTradePacks: (productId: string, packs: number) => void;
  removeTradeItem: (productId: string) => void;
  addTradeStand: (stand: Omit<TradeStandCartItem, 'quantity'>, quantity?: number) => void;
  updateTradeStandQuantity: (standId: string, quantity: number) => void;
  removeTradeStand: (standId: string) => void;
  clearTradeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      // Seed public items to match 08-public-basket-checkout: 2 items (Hair Grips, Birthday Candles)
      publicItems: [
        {
          productId: 'b0000000-0000-0000-0000-000000000001',
          name: 'Hair Grips',
          image: '/images/hair-grips.jpg',
          pricePence: 99,
          quantity: 1,
        },
        {
          productId: 'b0000000-0000-0000-0000-000000000004',
          name: 'Birthday Candles',
          image: '/images/birthday-candles.jpg',
          pricePence: 99,
          quantity: 1,
        },
      ],

      addPublicItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.publicItems.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              publicItems: state.publicItems.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            publicItems: [...state.publicItems, { ...item, quantity }],
          };
        }),

      updatePublicQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              publicItems: state.publicItems.filter((i) => i.productId !== productId),
            };
          }
          return {
            publicItems: state.publicItems.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          };
        }),

      removePublicItem: (productId) =>
        set((state) => ({
          publicItems: state.publicItems.filter((i) => i.productId !== productId),
        })),

      clearPublicCart: () => set({ publicItems: [] }),

      // Seed trade items to match 07-trade-basket-checkout: 35 packs (£116.20 ex VAT)
      tradeItems: [
        {
          productId: 'p-hair-grips',
          name: 'Hair Grips',
          image: '/images/hair-grips.jpg',
          sku: '321',
          packPricePence: 332,
          retailPricePence: 99,
          unitsPerPack: 6,
          packs: 10,
        },
        {
          productId: 'p-nit-comb',
          name: 'Nit Combs',
          image: '/images/nit-comb.jpg',
          sku: '307',
          packPricePence: 332,
          retailPricePence: 99,
          unitsPerPack: 6,
          packs: 8,
        },
        {
          productId: 'p-nail-scissors',
          name: 'Nail Scissors',
          image: '/images/nail-scissors.jpg',
          sku: '309',
          packPricePence: 332,
          retailPricePence: 99,
          unitsPerPack: 6,
          packs: 6,
        },
        {
          productId: 'p-birthday-candles',
          name: 'Birthday Candles',
          image: '/images/birthday-candles.jpg',
          sku: '314',
          packPricePence: 332,
          retailPricePence: 99,
          unitsPerPack: 6,
          packs: 6,
        },
        {
          productId: 'p-nail-glue',
          name: 'Nail Glue',
          image: '/images/nail-glue.jpg',
          sku: '304',
          packPricePence: 332,
          retailPricePence: 99,
          unitsPerPack: 6,
          packs: 5,
        },
      ],

      tradeStands: [],

      setTradePacks: (item, packs) =>
        set((state) => {
          if (packs <= 0) {
            return {
              tradeItems: state.tradeItems.filter((i) => i.productId === item.productId),
            };
          }
          const existing = state.tradeItems.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              tradeItems: state.tradeItems.map((i) =>
                i.productId === item.productId ? { ...i, packs } : i
              ),
            };
          }
          return {
            tradeItems: [...state.tradeItems, { ...item, packs }],
          };
        }),

      updateTradePacks: (productId, packs) =>
        set((state) => {
          if (packs <= 0) {
            return {
              tradeItems: state.tradeItems.filter((i) => i.productId !== productId),
            };
          }
          return {
            tradeItems: state.tradeItems.map((i) =>
              i.productId === productId ? { ...i, packs } : i
            ),
          };
        }),

      removeTradeItem: (productId) =>
        set((state) => ({
          tradeItems: state.tradeItems.filter((i) => i.productId !== productId),
        })),

      addTradeStand: (stand, quantity = 1) =>
        set((state) => {
          const existing = state.tradeStands.find((s) => s.standId === stand.standId);
          if (existing) {
            return {
              tradeStands: state.tradeStands.map((s) =>
                s.standId === stand.standId
                  ? { ...s, quantity: s.quantity + quantity }
                  : s
              ),
            };
          }
          return {
            tradeStands: [...state.tradeStands, { ...stand, quantity }],
          };
        }),

      updateTradeStandQuantity: (standId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              tradeStands: state.tradeStands.filter((s) => s.standId !== standId),
            };
          }
          return {
            tradeStands: state.tradeStands.map((s) =>
              s.standId === standId ? { ...s, quantity } : s
            ),
          };
        }),

      removeTradeStand: (standId) =>
        set((state) => ({
          tradeStands: state.tradeStands.filter((s) => s.standId !== standId),
        })),

      clearTradeCart: () => set({ tradeItems: [], tradeStands: [] }),
    }),
    {
      name: 'bnb_cart_store_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Calculation Helpers
export function usePublicCartTotals() {
  const items = useCartStore((state) => state.publicItems);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalPence = items.reduce(
    (acc, item) => acc + item.pricePence * item.quantity,
    0
  );

  return {
    items,
    totalItems,
    subtotalPence,
  };
}

export function useTradeCartTotals() {
  const tradeItems = useCartStore((state) => state.tradeItems);
  const tradeStands = useCartStore((state) => state.tradeStands);

  const packsFromItems = tradeItems.reduce((acc, i) => acc + i.packs, 0);
  const unitsFromItems = tradeItems.reduce(
    (acc, i) => acc + i.packs * i.unitsPerPack,
    0
  );

  const itemsSubtotalPence = tradeItems.reduce(
    (acc, i) => acc + i.packPricePence * i.packs,
    0
  );

  const standsSubtotalPence = tradeStands.reduce(
    (acc, s) => acc + s.fixedPricePence * s.quantity,
    0
  );

  const totalExVatPence = itemsSubtotalPence + standsSubtotalPence;

  // Retail value calculation for profit
  const totalRrpPence = tradeItems.reduce(
    (acc, i) => acc + i.retailPricePence * i.packs * i.unitsPerPack,
    0
  );
  const totalProfitPence = Math.max(0, totalRrpPence - itemsSubtotalPence);

  // Delivery check against £150 threshold
  const qualifiesForFreeDelivery =
    totalExVatPence >= SITE_CONFIG.tradeFreeDeliveryThresholdPence;
  const remainingForFreeDeliveryPence = Math.max(
    0,
    SITE_CONFIG.tradeFreeDeliveryThresholdPence - totalExVatPence
  );
  const freeDeliveryProgressPercent = Math.min(
    100,
    Math.round(
      (totalExVatPence / SITE_CONFIG.tradeFreeDeliveryThresholdPence) * 100
    )
  );

  const vatPence = Math.round(totalExVatPence * SITE_CONFIG.vatRate);
  const grandTotalPence = totalExVatPence + vatPence;

  return {
    tradeItems,
    tradeStands,
    totalPacks: packsFromItems,
    totalUnits: unitsFromItems,
    totalExVatPence,
    totalProfitPence,
    qualifiesForFreeDelivery,
    remainingForFreeDeliveryPence,
    freeDeliveryProgressPercent,
    vatPence,
    grandTotalPence,
  };
}

