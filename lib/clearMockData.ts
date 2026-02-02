// Utility to clear old mock data from localStorage
export function clearOldMockData() {
    // List of keys that might contain old mock data
    const keysToCheck = [
        'mf_finance_accounts',
        'mf_finance_transactions',
        'mf_vault_items',
        'mf_resources',
    ];

    keysToCheck.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`Cleared old mock data: ${key}`);
        }
    });
}

// Clear on app load (run once)
if (typeof window !== 'undefined') {
    const hasCleared = localStorage.getItem('mf_mock_data_cleared_v1');
    if (!hasCleared) {
        clearOldMockData();
        localStorage.setItem('mf_mock_data_cleared_v1', 'true');
    }
}
