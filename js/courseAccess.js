document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuration ---
    // Extract module ID from the URL, e.g., 'modulo1' from '/aulas/modulo1/modulo1.html'
    const pathParts = window.location.pathname.split('/');
    const moduleDirectory = pathParts[pathParts.length - 2]; // e.g., 'modulo1'
    const moduleId = moduleDirectory;

    // --- User and Course Data Fetching ---
    let purchasedCourses = new Set();
    let currentUser = null;

    const userString = localStorage.getItem('loggedInUser');
    if (userString) {
        currentUser = JSON.parse(userString);
    }

    if (currentUser && currentUser.id) {
        try {
            const response = await fetch(`/api/get-user-courses?userId=${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                purchasedCourses = new Set(data.courses.map(c => c.id));
            } else {
                console.error('Failed to fetch user courses for access check');
            }
        } catch (error) {
            console.error('Error fetching user courses:', error);
        }
    }

    // --- Access Control Logic ---
    const hasAccess = purchasedCourses.has(moduleId);

    if (!hasAccess) {
        // User does not have access, lock down the lesson links.
        lockLessonLinks();
    }
});

function lockLessonLinks() {
    // Find all links that lead to an aula (lesson)
    const lessonLinks = document.querySelectorAll("a[href*='_aula']");

    lessonLinks.forEach(link => {
        // Preserve the original destination for a potential redirect after purchase
        const originalHref = link.href;
        
        // Disable the link
        link.href = 'javascript:void(0);';
        
        // Add a visual indicator that it's locked
        link.classList.add('locked-lesson');
        link.textContent = 'Bloqueado';
        
        // Add a click event to inform the user
        link.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Você precisa comprar este curso para assistir a esta aula. Adicione o curso ao seu carrinho na página inicial.');
            // Optional: Redirect to the main page
            window.location.href = '../../index.html';
        });
    });
}
