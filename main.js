// Stavebniny Ľubeľa - Main JS
console.log('Stavebniny Ľubeľa system initialized.');

// Placeholder for shopping cart logic
let cart = [];

function addToCart(productId) {
    cart.push(productId);
    updateCartIcon();
    alert('Produkt bol pridaný do košíka.');
}

function updateCartIcon() {
    const dots = document.querySelectorAll('.cart-dot');
    dots.forEach(dot => {
        dot.textContent = cart.length;
        dot.style.display = cart.length > 0 ? 'flex' : 'none';
    });
}

// Mobile menu toggle (if added later)
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
});
