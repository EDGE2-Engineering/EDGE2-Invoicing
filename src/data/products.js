
export const initialProducts = [
    {
        id: 'P1',
        title: 'A2 Desi Cow Ghee',
        category: 'Ghee',
        price: 1500,
        weight: '500ml',
        stock: 50,
        description: 'Pure A2 chemical-free hand-churned Ghee from free-grazing Hallikar cows. Made using the traditional Bilona method.',
        ingredients: 'A2 Cow Milk Butter',
        benefits: 'Boosts immunity, improves digestion, good for skin, balances Vata and Pitta doshas.',
        images: [
            'https://ueirorganic.com/cdn/shop/files/a2desicowghee.jpg?v=1697902974'
        ],
        featured: true,
        status: 'In Stock'
    }
];

export const getProducts = () => {
    const stored = localStorage.getItem('products');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            console.error("Error parsing stored products", e);
        }
    }
    return initialProducts;
};

export const saveProducts = (products) => {
    localStorage.setItem('products', JSON.stringify(products));
    window.dispatchEvent(new Event('storage'));
};
