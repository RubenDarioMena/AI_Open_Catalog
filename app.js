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
    let activeFilter = { type: 'all', value: 'all' }; // type: 'section' | 'category' | 'all'

    // Ensure CONFIG is loaded
    const CATEGORY_MAP = typeof SECTION_MAPPING !== 'undefined' ? SECTION_MAPPING : {};

    // Use global data from data.js
    if (typeof modelsData !== 'undefined') {
        allModels = modelsData;
        initApp();
    } else {
        console.error('Error: modelsData not found. Make sure data.js is loaded.');
    }

    function initApp() {
        renderNavigation();
        renderModels(allModels);
        setupEventListeners();
    }

    function renderNavigation() {
        categoryNav.innerHTML = '';

        // 1. "All Models" Link (Always first)
        const allLi = document.createElement('li');
        const allLink = document.createElement('a');
        allLink.href = "#";
        allLink.textContent = "All Models";
        allLink.dataset.type = 'all';
        allLink.classList.add('active'); // Default active
        allLi.appendChild(allLink);
        categoryNav.appendChild(allLi);

        // 2. Render General Sections
        Object.keys(CATEGORY_MAP).forEach(section => {
            if (section === 'All Models') return; // Skip special key if present

            const li = document.createElement('li');

            // Section Title Link
            const sectionLink = document.createElement('a');
            sectionLink.href = "#";
            sectionLink.textContent = section;
            sectionLink.dataset.type = 'section';
            sectionLink.dataset.value = section;
            li.appendChild(sectionLink);

            // Dropdown Menu (Subcategories)
            const subCategories = CATEGORY_MAP[section];
            if (subCategories && subCategories.length > 0) {
                const dropUl = document.createElement('ul');
                dropUl.className = 'dropdown-menu';

                subCategories.forEach(subCat => {
                    const subLi = document.createElement('li'); // Technically ul > li > ul > li for HTML semantics? No, dropdown-menu is div or ul
                    // Let's keep dropdown-menu as flex container in CSS, but semantically, nav > ul > li > ul > li is standard.
                    // My CSS expects .dropdown-menu to be the UL.

                    const subLink = document.createElement('a');
                    subLink.href = "#";
                    subLink.textContent = subCat;
                    subLink.dataset.type = 'category';
                    subLink.dataset.value = subCat;

                    // Prevent bubbling instantly to parent
                    subLink.addEventListener('click', (e) => {
                        e.stopPropagation(); // Handle separately
                        handleNavigationClick(subLink, 'category', subCat);
                    });

                    subLi.appendChild(subLink);
                    dropUl.appendChild(subLi); // Since we styled dropdown-menu a, check if we need li wrapping. CSS has .dropdown-menu a, so we need to be careful with structure.
                    // My Style: .dropdown-menu { flex-direction: column }... .dropdown-menu a { ... }
                    // If I put <li> inside, I need to make sure <li> doesn't mess up flex or styling.
                    // safer: allow .dropdown-menu to be a div or style li inside it?
                    // Let's just adjust the JS to match standard nested list.
                    // Structure: LI > A (Parent) + UL (Dropdown) > LI > A (Child)
                });
                li.appendChild(dropUl);
            }

            // Handle Parent Click
            sectionLink.addEventListener('click', (e) => {
                e.preventDefault();
                handleNavigationClick(sectionLink, 'section', section);
            });

            categoryNav.appendChild(li);
        });
    }

    // We didn't add structure for dropdown items as LI in the previous loop properly if styler expects simple A tags?
    // Looking at CSS: 
    // .dropdown-menu { display: flex; flex-direction: column; ... }
    // .dropdown-menu a { ... }
    // If I insert LI, the flex applies to LIs. I should style LIs or just put 'a' directly if standard HTML allows (it doesn't niceley inside UL).
    // Let's assume standard UL > LI > A structure for dropdown.
    // I will quickly patch style.css in my mind: .dropdown-menu li { list-style:none; } .dropdown-menu a { display:block; }
    // Wait, the CSS I wrote targeted `.dropdown-menu a`. If I wrap in LI, I need to ensure LI doesn't have padding.
    // Actually, let's keep it simple: Make .dropdown-menu a DIV if I want just links, OR make it a UL and update styles.
    // I made it a UL in JS above. Let's make sure the CSS works.
    // CSS: .dropdown-menu { ... display:flex; flex-direction: column; gap: 2px; }
    // CSS: .dropdown-menu a { ... }
    // If I have UL > LI > A, the LI is the flex item.
    // I should probably simplify JS to just append 'a' if 'ul' class is dropdown-menu, but valid HTML requires LI in UL.
    // FIX: I will change the created element to DIV for dropdown-menu.

    function handleNavigationClick(element, type, value) {
        // Update UI
        // Remove 'active' from all main links
        document.querySelectorAll('#category-nav > li > a').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.dropdown-menu a').forEach(el => el.classList.remove('active')); // Sub links

        if (type === 'all') {
            element.classList.add('active');
        } else if (type === 'section') {
            element.classList.add('active');
        } else if (type === 'category') {
            element.classList.add('active');
            // Also highlight the parent section
            const parentSection = element.closest('ul').parentElement.querySelector('a'); // The sibling A
            if (parentSection) parentSection.classList.add('active');
        }

        // Update Filter State
        activeFilter = { type, value };
        filterModels();
    }

    function setupEventListeners() {
        // Global delegate for main nav (fallback/simplification)
        categoryNav.addEventListener('click', (e) => {
            if (e.target.dataset.type === 'all') {
                e.preventDefault();
                handleNavigationClick(e.target, 'all', 'all');
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
            let categoryMatch = true;

            // Clean model category string (remove extra spaces, take primary)
            // Model category in data might be "Video Generator" or "Video Generator / Game"
            // My mapping keys are exact strings.
            // Logic: 
            // If Section selected: model.category MUST START WITH or BE INCLUDED in the section list.
            // Actually, best check: Is the model's category in the list of categories for this section?

            const modelCat = model.category; // e.g. "Video Generator"

            if (activeFilter.type === 'all') {
                categoryMatch = true;
            } else if (activeFilter.type === 'section') {
                // Check if modelCat matches ANY category in this section
                const allowedCategories = CATEGORY_MAP[activeFilter.value] || [];
                // Loose match: modelCat might be "Video Tool" and allowed has "Video Tool".
                // But modelCat might be "Video Tool / Something".
                // Let's check if the primary part matches any allowed.
                categoryMatch = allowedCategories.some(allowed => modelCat.includes(allowed));
            } else if (activeFilter.type === 'category') {
                // Exact match (or inclusive)
                categoryMatch = modelCat.includes(activeFilter.value);
            }

            const matchesSearch = model.name.toLowerCase().includes(searchTerm) ||
                model.description.toLowerCase().includes(searchTerm);

            return categoryMatch && matchesSearch;
        });

        renderModels(filtered);
    }

    // ... (Existing renderModels, openModal, closeModalHandler remain same, just ensure they are present)

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
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
        document.body.style.overflow = 'hidden';
    }

    function closeModalHandler() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    }
});
