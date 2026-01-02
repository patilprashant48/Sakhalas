#!/bin/bash
# Quick TypeScript error fixes for deployment

echo "Fixing TypeScript compilation errors..."

# Fix unused PaymentFormData import
sed -i 's/import type { Expense, ApprovalAction, ApprovalHistoryItem, PaymentFormData }/import type { Expense, ApprovalAction, ApprovalHistoryItem }/' src/api/expense.api.ts

# The rest will be fixed manually through VS Code
echo "Done!"
