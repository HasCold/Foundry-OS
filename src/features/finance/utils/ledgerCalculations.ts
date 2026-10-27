import type { Account, AccountType, LedgerEntry, LedgerLine } from '@/types'

/**
 * Every function here is a pure transform over ledger data — no store access,
 * no side effects. This is what makes the Balance Sheet and Income Statement
 * "instantly update" as new entries are posted: they're recomputed from
 * scratch on every render from whatever entries currently exist.
 */

/** Throws if a set of ledger lines doesn't balance — a bug-catcher for every entry the app posts. */
export function assertBalanced(lines: LedgerLine[]): void {
  const debits = sumByDirection(lines, 'debit')
  const credits = sumByDirection(lines, 'credit')
  if (Math.round((debits - credits) * 100) !== 0) {
    throw new Error(`Ledger entry does not balance: debits ${debits} !== credits ${credits}`)
  }
}

function sumByDirection(lines: LedgerLine[], direction: 'debit' | 'credit'): number {
  return lines.filter((l) => l.direction === direction).reduce((sum, l) => sum + l.amount, 0)
}

/**
 * Net balance for one account across all entries, signed so it reads
 * correctly on a statement (e.g. a debit-normal Asset with more debits than
 * credits comes back positive).
 */
export function computeAccountBalance(account: Account, entries: LedgerEntry[]): number {
  let balance = 0
  for (const entry of entries) {
    for (const line of entry.lines) {
      if (line.accountCode !== account.code) continue
      const sign = line.direction === account.normalBalance ? 1 : -1
      balance += sign * line.amount
    }
  }
  return balance
}

export interface AccountBalance {
  account: Account
  balance: number
}

/** Every account's balance in one pass, filtered to the account types a given statement cares about. */
export function computeBalancesByType(accounts: Account[], entries: LedgerEntry[], types: AccountType[]): AccountBalance[] {
  return accounts
    .filter((a) => types.includes(a.type))
    .map((account) => ({ account, balance: computeAccountBalance(account, entries) }))
}

export interface BalanceSheet {
  assets: AccountBalance[]
  liabilities: AccountBalance[]
  equity: AccountBalance[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  /** Should always be ~0 for a correctly-balanced ledger — surfaced so the UI can flag it if not. */
  outOfBalanceBy: number
}

export function computeBalanceSheet(accounts: Account[], entries: LedgerEntry[]): BalanceSheet {
  const assets = computeBalancesByType(accounts, entries, ['asset'])
  const liabilities = computeBalancesByType(accounts, entries, ['liability'])
  const equity = computeBalancesByType(accounts, entries, ['equity'])

  // Revenue and expense accounts aren't "closed" into Retained Earnings on
  // every posting (that only happens at period-end in real bookkeeping), but
  // the accounting equation (Assets = Liabilities + Equity) only holds if
  // undistributed net income is counted as equity in the meantime. Fold it
  // in here as a synthetic line so the statement always balances live.
  const revenueTotal = sumBalances(computeBalancesByType(accounts, entries, ['revenue']))
  const expenseTotal = sumBalances(computeBalancesByType(accounts, entries, ['expense']))
  const currentPeriodEarnings = revenueTotal - expenseTotal
  const equityWithCurrentEarnings = [
    ...equity,
    {
      account: { code: 'NET-INCOME', name: 'Net Income (Current Period)', type: 'equity' as const, normalBalance: 'credit' as const },
      balance: currentPeriodEarnings,
    },
  ]

  const totalAssets = sumBalances(assets)
  const totalLiabilities = sumBalances(liabilities)
  const totalEquity = sumBalances(equityWithCurrentEarnings)

  return {
    assets,
    liabilities,
    equity: equityWithCurrentEarnings,
    totalAssets,
    totalLiabilities,
    totalEquity,
    outOfBalanceBy: totalAssets - (totalLiabilities + totalEquity),
  }
}

export interface IncomeStatement {
  revenue: AccountBalance[]
  expenses: AccountBalance[]
  totalRevenue: number
  totalExpenses: number
  grossProfit: number
  cogs: number
  grossMargin: number
  netIncome: number
}

export function computeIncomeStatement(accounts: Account[], entries: LedgerEntry[]): IncomeStatement {
  const revenue = computeBalancesByType(accounts, entries, ['revenue'])
  const expenses = computeBalancesByType(accounts, entries, ['expense'])

  const totalRevenue = sumBalances(revenue)
  const totalExpenses = sumBalances(expenses)
  const cogs = expenses.find((e) => e.account.code === '5000')?.balance ?? 0
  const grossProfit = totalRevenue - cogs

  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    grossProfit,
    cogs,
    grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
    netIncome: totalRevenue - totalExpenses,
  }
}

function sumBalances(balances: AccountBalance[]): number {
  return balances.reduce((sum, b) => sum + b.balance, 0)
}
