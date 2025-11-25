document.addEventListener('DOMContentLoaded', () => {
    const modelGrid = document.getElementById('model-grid');
    const categoryNav = document.getElementById('category-nav');
    const searchInput = document.getElementById('search-input');
    const modal = document.getElementById('detail-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalDate = document.getElementById('modal-date');
    const modalLink = document.getElementById('modal-link');
    const modalLaunchBtn = document.getElementById('modal-launch-btn');

    let allModels = [];
    let activeCategory = 'all';

    // Use global data from data.js
    if (typeof modelsData !== 'undefined') {
        allModels = modelsData;
        initApp();
    } else {
        console.error('Error: modelsData not found. Make sure data.js is loaded.');
    }

    function initApp() {
        renderCategories();
        renderModels(allModels);
        setupEventListeners();
    }

    function renderCategories() {
        const categories = new Set(allModels.map(m => m.category.split('/')[0].trim()));
        const sortedCategories = Array.from(categories).sort();

        sortedCategories.forEach(cat => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = cat;
            a.dataset.category = cat;
            li.appendChild(a);
            categoryNav.appendChild(li);
        });
    }

    function renderModels(models) {
        modelGrid.innerHTML = '';
        models.forEach(model => {
            const card = document.createElement('div');
            card.className = 'model-card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-category">${model.category}</span>
                    <h3 class="card-title">${model.name}</h3>
                </div>
                <div class="card-body">
                    <p>${model.description}</p>
                </div>
                <div class="card-footer">
                    <span>${model.date}</span>
                    <span>View Details &rarr;</span>
                </div>
            `;
            card.addEventListener('click', () => openModal(model));
            modelGrid.appendChild(card);
        });
    }

    function openModal(model) {
        modalTitle.textContent = model.name;
        modalCategory.textContent = model.category;
        modalDescription.textContent = model.description;
        modalDate.textContent = `Released: ${model.date}`;
        modalLink.href = model.link;
        modalLaunchBtn.href = model.link;

        modal.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModalHandler() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    }

    function setupEventListeners() {
        // Category Filtering
        categoryNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();

                // Update Active State
                document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');

                const category = e.target.dataset.category;
                activeCategory = category;
                filterModels();
            }
        });

        // Search
        searchInput.addEventListener('input', (e) => {
            filterModels();
        });

        // Modal
        closeModal.addEventListener('click', closeModalHandler);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalHandler();
            }
        });
    }

    function filterModels() {
        const searchTerm = searchInput.value.toLowerCase();

        const filtered = allModels.filter(model => {
            const matchesCategory = activeCategory === 'all' || model.category.includes(activeCategory);
            const matchesSearch = model.name.toLowerCase().includes(searchTerm) ||
                model.description.toLowerCase().includes(searchTerm);
            return matchesCategory && matchesSearch;
        });

        renderModels(filtered);
    }
});
