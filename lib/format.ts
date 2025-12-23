export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
    return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('en-IE').format(number);
};

export const formatDate = (date: Date | string | number): string => {
    return new Intl.DateTimeFormat('en-IE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
};
